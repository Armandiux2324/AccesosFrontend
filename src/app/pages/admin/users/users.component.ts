import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false,
})
export class UsersComponent implements OnInit{
  constructor(private api: ApiService) { }
  token: any = null;
  userId: any = null;
  users: any[] = [];
  searchText: string = '';
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  showAddModal = false;
  dataToAdd: any = {};

  showUpdateModal = false;
  dataToUpdate: any = {};

  showDeleteModal = false;
  userIdToDelete: any = null;

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
    this.userId = localStorage.getItem('userId');
    this.getUsers();
  }

  async getUsers() {
    this.api.getUsers(this.userId, this.token).subscribe({
      next: (data: any) => {
        this.users = data.data;
      }, 
      error: (error: any) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  searchUsers(){
    this.api.searchUsers(this.searchText, this.token).subscribe({
      next: (data: any) => {
        this.users = data.data;
        if (this.users.length === 0) {
          this.toastMessage = 'No se encontraron usuarios con ese criterio de búsqueda.';
          this.showErrorToast = true;
          this.autoHideToast();
        }
      },
      error: (error: any) => {
        this.toastMessage = 'Error al buscar usuarios.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error searching users:', error);
      }
    });
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
        this.getUsers();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al agregar usuario.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error adding user:', error);
      }
    });
  }

  openUpdateModal(id: any) {
    this.showUpdateModal = true;
    this.api.getUserById(id, this.token).subscribe({
      next: (data: any) => {
        this.dataToUpdate = data.data;
        console.log('User data to update:', this.dataToUpdate);
      },
      error: (error: any) => {
        console.error('Error fetching user data:', error);
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
        this.getUsers();
        this.closeUpdateModal();
      },
      error: (error: any) => {         
        this.toastMessage = 'Error al actualizar usuario.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error updating user:', error);
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
    console.log('Deleting user with ID:', this.userIdToDelete);
    this.api.deleteUser(this.userIdToDelete, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Usuario eliminado exitosamente.';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.getUsers();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al eliminar usuario.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error deleting user:', error);
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
