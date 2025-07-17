import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API = environment.backend + '/refresh';

  constructor(private http: HttpClient) {}

  getAccessToken()  { return localStorage.getItem('accessToken'); }
  getRefreshToken() { return localStorage.getItem('refreshToken'); }

  setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    const { exp } = jwtDecode<JwtPayload>(token);
    if (typeof exp !== 'number') return true;
    return exp * 1000 < Date.now();
  }

  refreshAccessToken() {
    return this.http.post<{ accessToken: string }>(
      this.API,
      { refreshToken: this.getRefreshToken() }
    ).pipe(
      tap(res => this.setAccessToken(res.accessToken))
    );
  }
}
