import {
  HttpEvent, HttpHandler, HttpInterceptor,
  HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //Si es la petición a /refresh, no se envuelve en el interceptor para evitar un bucle infinito
    if (req.url.endsWith('/refresh')) {
      return next.handle(req);
    }

    // Inyectar access token
    const token = this.auth.getAccessToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: token } }) : req;

    // Manejo estándar de 401
    return next.handle(authReq).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.refreshing) {
      this.refreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refreshAccessToken().pipe(
        switchMap(() => {
          this.refreshing = false;
          const newToken = this.auth.getAccessToken();
          this.refreshSubject.next(newToken);
          // Reintentar la petición original con el nuevo token
          return next.handle(req.clone({
            setHeaders: { Authorization: `${newToken}` }
          }));
        }),
        catchError(() => {
          this.refreshing = false;
          // Si el refresh falla, ahí se cierra la sesión
          this.auth.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Session expired'));
        })
      );
    } else {
      // Si ya está refrescando, esperar a que se complete y reintentar la petición original con el nuevo token
      return this.refreshSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token =>
          next.handle(req.clone({
            setHeaders: { Authorization: `${token}` }
          }))
        )
      );
    }
  }
}
