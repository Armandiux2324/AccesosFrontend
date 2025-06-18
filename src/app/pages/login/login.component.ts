import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  identificator = '';
  password = '';

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  login() {
    if (!this.identificator || !this.password) {
      this.toastMessage = 'Todos los campos son obligatorios.';
      this.showErrorToast = true;
      this.autoHideToast();
      return;
    }

    this.api.login(this.identificator, this.password).subscribe({
      next: (data: any) => {
        console.log('Login successful:', data);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('authToken', data.token);

        this.toastMessage = 'Inicio de sesión exitoso';
        this.showSuccessToast = true;
        this.autoHideToast();

        setTimeout(() => {
          if (data.user.role === 'Administrador') {
            this.router.navigate(['/dashboard-admin']);
          } else if (data.user.role === 'Taquilla') {
            this.router.navigate(['/dashboard-seller']);
          }
        }, 1000);
      },
      error: (error) => {
        this.toastMessage = "Error al iniciar sesión. Verifica tus datos";
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }
}
