import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  constructor(private router: Router, private api: ApiService) {}
  token: any = null;
  userId: any = null;
  role: any = null;

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  profileModal = false;
  userInfo: any = {};

  showChangePassModal = false;
  passwordData: any = {};

  ngOnInit(){
    this.token = localStorage.getItem('authToken');
    this.userId = localStorage.getItem('userId');
    this.role = localStorage.getItem('role');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openProfile(){
    this.api.getUserById(this.userId, this.token).subscribe({
      next: (res: any) => {
        this.userInfo = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching user info:', err);
      }
    });
    this.profileModal = true;
  }

  closeProfile() {
    this.profileModal = false;
  }

  openChangePassModal() {
    this.passwordData = { id: this.userId, newPass: '', confPass: '' };
    this.showChangePassModal = true;
  }

  closeChangePassModal() {
    this.showChangePassModal = false;
    this.passwordData = { id: '', newPass: '', confPass: '' };
  }

  confirmChangePass() {
    if (this.passwordData.newPass !== this.passwordData.confPass) {
      this.toastMessage = 'Las contraseñas no coinciden';
      this.showErrorToast = true;
      this.autoHideToast();
      return;
    }

    this.api.changePassword(this.passwordData.id, this.passwordData.newPass, this.passwordData.confPass, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Contraseña del usuario cambiada exitosamente.';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.closeChangePassModal();
      },
      error: (err: any) => {
        this.toastMessage = 'Error al cambiar contraseña';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  closeChangePass() {
    this.showChangePassModal = false;
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }

}
