import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false,
})
export class UsersComponent implements OnInit {
  constructor(private api: ApiService) { }
  token: any = null;
  userId: any = null;
  users: any[] = [];

  page = 1;
  size = 20;
  totalPages = 1;
  currentPage = 1;
  pagesArray: number[] = [];
  loading = false;

  searchText: string = '';
  isSearching = false;

  toastMessage = '';

  showAddModal = false;
  dataToAdd: any = {};

  showUpdateModal = false;
  dataToUpdate: any = {};

  showChangePassModal = false;
  showNewPass = false;
  showConfPass = false;
  passwordData: any = {};
  showPass = false;

  showDeleteModal = false;
  userIdToDelete: any = null;

  ngOnInit() {
    this.token = localStorage.getItem('accessToken');
    this.userId = localStorage.getItem('userId');

    this.loadPage(this.currentPage);
  }

  async loadPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loading = true;
    const params = { page: String(page), size: String(this.size) };

    const handler = (res: any) => {
      this.users = res.data;
      this.totalPages = res.totalPages;
      this.currentPage = res.page;
      this.buildPagesArray();
      this.loading = false;
    };

    if (this.isSearching && this.searchText) {
      this.api.searchUsers(this.searchText, page, this.size, this.token).subscribe({
        next: (res: any) => {
          handler(res);
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.api.getUsers(page, this.size, this.token).subscribe({
        next: (res: any) => {
          handler(res);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  searchUsers() {
    this.isSearching = true;
    this.users = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.loadPage(1);
  }

  resetSearch() {
    this.searchText = '';
    this.isSearching = false;
    this.users = [];    
    this.currentPage = 1;
    this.totalPages = 1;
    this.loadPage(1);
  }

  private buildPagesArray() {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page === this.currentPage) return;
    this.loadPage(page);
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.dataToAdd = {};
    this.showAddModal = false;
  }

  addUser() {
    this.api.addUser(this.dataToAdd.name, this.dataToAdd.username, this.dataToAdd.email, this.dataToAdd.password, this.dataToAdd.role, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Usuario agregado exitosamente.';
        this.showToast('success');
        this.closeAddModal();

        this.users = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al agregar usuario.';
        this.showToast('error');
      }
    });
  }

  openUpdateModal(id: any) {
    this.showUpdateModal = true;
    this.api.getUserById(id, this.token).subscribe({
      next: (data: any) => {
        this.dataToUpdate = data.data;
      },
      error: (error: any) => {
        this.toastMessage = 'Error al cargar información del usuario.';
        this.showToast('error');
      }
    });
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  updateUser() {
    this.api.updateUser(this.dataToUpdate.id, this.dataToUpdate.name, this.dataToUpdate.username, this.dataToUpdate.email, this.dataToUpdate.role, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Usuario actualizado exitosamente.';
        this.showToast('success');
        this.closeUpdateModal();

        this.users = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al actualizar usuario.';
        this.showToast('error');
      }
    });
  }

  openChangePassModal(userId: number) {
    this.passwordData = { id: userId, newPass: '', confPass: '' };
    this.showChangePassModal = true;
  }

  closeChangePassModal() {
    this.showChangePassModal = false;
    this.passwordData = { id: '', newPass: '', confPass: '' };
  }

  confirmChangePass() {
    if (this.passwordData.newPass !== this.passwordData.confPass) {
      this.toastMessage = 'Las contraseñas no coinciden';
      this.showPasswordErrorToast();
      return;
    }

    this.api.changePassword(this.passwordData.id, this.passwordData.newPass, this.passwordData.confPass, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Contraseña del usuario cambiada exitosamente.';
        this.showToast('success');
        this.closeChangePassModal();
      },
      error: (err: any) => {
        this.toastMessage = 'Error al cambiar contraseña';
        this.showToast('error');
      }
    });
  }

  promptDeleteUser(id: any) {
    this.userIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.userIdToDelete = null;
  }

  deleteUser() {
    this.api.deleteUser(this.userIdToDelete, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Usuario eliminado exitosamente.';
        this.showToast('success');

        this.users = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al eliminar usuario.';
        this.showToast('error');
      }
    });

    this.showDeleteModal = false;
    this.userIdToDelete = null;
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

  private showPasswordErrorToast() {
    const el = document.getElementById('passwordErrorToast');
    if (!el) return;

    const toast = new Toast(el);
    toast.show();
    setTimeout(() => {
      toast.hide();
    }, 3000);
  }
}
