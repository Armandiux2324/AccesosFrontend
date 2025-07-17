import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'FrontendZigZag';
  constructor(private auth: AuthService, private router: Router) {}
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  async ngOnInit() {
    const at = this.auth.getAccessToken();
    if (!at || this.auth.isTokenExpired(at)) {
      this.toastMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
      this.showErrorToast = true;
      this.autoHideToast();
      
      this.auth.clearTokens();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }
}
