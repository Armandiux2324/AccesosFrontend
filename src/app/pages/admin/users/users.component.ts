import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

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

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  showAddModal = false;
  dataToAdd: any = {};

  showUpdateModal = false;
  dataToUpdate: any = {};

  showChangePassModal = false;
  passwordData: any = {};

  showDeleteModal = false;
  userIdToDelete: any = null;

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
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
    this.dataToAdd = {};
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  addUser() {
    this.api.addUser(this.dataToAdd.name, this.dataToAdd.username, this.dataToAdd.email, this.dataToAdd.password, this.dataToAdd.role, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Usuario agregado exitosamente.';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.closeAddModal();

        this.users = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al agregar usuario.';
        this.showErrorToast = true;
        this.autoHideToast();
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
        this.showErrorToast = true;
        this.autoHideToast();
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
        this.showSuccessToast = true;
        this.autoHideToast();
        this.closeUpdateModal();

        this.users = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al actualizar usuario.';
        this.showErrorToast = true;
        this.autoHideToast();
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
        this.showSuccessToast = true;
        this.autoHideToast();

        this.users = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al eliminar usuario.';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });

    this.showDeleteModal = false;
    this.userIdToDelete = null;
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }
}
