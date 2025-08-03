import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Toast } from 'bootstrap';

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

  toastMessage = '';

  profileModal = false;
  userInfo: any = {};

  showChangePassModal = false;
  passwordData: any = {};
  showNewPass = false;
  showConfPass = false;

  showEditProfileModal = false;
  dataToUpdate: any = {};

  ngOnInit(){
    this.token = localStorage.getItem('accessToken');
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
        this.toastMessage = 'Error al obtener información del usuario';
        this.showToast('error');
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
    this.api.changePassword(this.passwordData.id, this.passwordData.newPass, this.passwordData.confPass, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Contraseña del usuario cambiada exitosamente.';
        this.showToast('success');
        this.passwordData = { id: '', newPass: '', confPass: '' };
        this.closeChangePassModal();
      },
      error: (err: any) => {
        this.toastMessage = 'Error al cambiar contraseña';
        this.showToast('error');
      }
    });
  }

  closeChangePass() {
    this.showChangePassModal = false;
  }

  openEditProfileModal() {
    this.showEditProfileModal = true;
    this.api.getUserById(this.userId, this.token).subscribe({
      next: (data: any) => {
        this.dataToUpdate = data.data;
      },
      error: (error: any) => {
        this.toastMessage = 'Error al cargar información del usuario.';
        this.showToast('error');
      }
    });
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
  }

  updateUser() {
    this.api.updateUser(this.dataToUpdate.id, this.dataToUpdate.name, this.dataToUpdate.username, this.dataToUpdate.email, this.role, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Usuario actualizado exitosamente.';
        this.showToast('success');
        this.closeEditProfileModal();
        this.dataToUpdate = {};
        this.openProfile();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al actualizar usuario.';
        this.showProfileErrorToast();
      }
    });
  }

  private showProfileErrorToast() {
    const el = document.getElementById('profileErrorToast');
    if (!el) return;

    const toast = new Toast(el);
    toast.show();
    setTimeout(() => {
      toast.hide();
    }, 3000);
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
