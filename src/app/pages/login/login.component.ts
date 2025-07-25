import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  identificator = '';
  password = '';

  toastMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

    login() {
      if (!this.identificator || !this.password) {
        this.toastMessage = 'Todos los campos son obligatorios.';
        this.showToast('error');
        return;
      }

      this.api.login(this.identificator, this.password).subscribe({
        next: (data: any) => {
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('name', data.user.name);
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          this.toastMessage = 'Inicio de sesión exitoso';
          this.showToast('success');

          if (data.user.role === 'Administrador') {
            this.router.navigate(['/dashboard-admin']);
          } else if (data.user.role === 'Taquilla') {
            this.router.navigate(['/dashboard-seller']);
          }

        },
        error: (error) => {
          this.toastMessage = "Error al iniciar sesión. Verifica tus datos";
          this.showToast('error');
        }
      });
    }

  private showToast(type: 'success' | 'error') {
    const el = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    if (!el) return;

    const toast = new Toast(el);
    toast.show();
    setTimeout(() => {
      toast.hide();
    }, 3000);
  }
}
