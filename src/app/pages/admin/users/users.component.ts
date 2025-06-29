import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false,
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild('anchor', { static: true }) anchor!: ElementRef<HTMLElement>;
  constructor(private api: ApiService) { }
  token: any = null;
  userId: any = null;
  users: any[] = [];
  page = 1;
  size = 20;
  totalPages = 1;
  loading = false;

  private observer!: IntersectionObserver;

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
    this.loadUsersPage();
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.loading && this.page <= this.totalPages) {
        this.loadUsersPage();
      }
    });
    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  async loadUsersPage() {
    if (this.loading || this.page > this.totalPages) return;
    this.loading = true;

    const handler = (res: any) => {
      this.users = [this.users, res.data].flat();
      this.totalPages = res.totalPages;
      this.page++;
      this.loading = false;
    };

    if (this.isSearching && this.searchText) {
      this.api.searchUsers(this.searchText, this.page, this.size, this.token).subscribe({
        next: (res: any) => {
          handler(res);
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.api.getUsers(this.page, this.size, this.token).subscribe({
        next: (res: any) => {
          handler(res);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
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
        this.loadUsersPage();
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
        this.loadUsersPage();
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
        this.loadUsersPage();
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

  async searchUsers() {
    if (this.searchText == '') {
      this.isSearching = false;
    } else {
      this.isSearching = true;
    }
    this.users = [];
    this.page = 1;
    this.totalPages = 1; 
    this.loadUsersPage();
  }
  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }
}
