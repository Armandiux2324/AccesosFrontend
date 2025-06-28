import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-sales',
  standalone: false,
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit {
  constructor(private api: ApiService) { }
  token: any = null;
  userId: any = null;
  visits: any[] = [];
  searchText: string = '';
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  showDeleteModal = false;
  visitIdToDelete: any = null;

  visitIdForTicket: any = null;
  showTicketModal = false;
  visitInfo: any = {};
  childrenCount: number = 0;
  adultsCount: number = 0;
  seniorsCount: number = 0;
  disabledCount: number = 0;

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
    this.userId = localStorage.getItem('userId');
    this.getVisits();
  }

  async getVisits() {
    this.api.getVisits(this.token).subscribe({
      next: (data: any) => {
        this.visits = data.data;
      },
      error: (error: any) => {
        console.error('Error fetching visits:', error);
      }
    });
  }

  searchByDate() {
    this.api.searchVisits(this.searchText, this.token).subscribe({
      next: (data: any) => {
        this.visits = data.data;
      },
      error: (error: any) => {
        this.toastMessage = 'Error al buscar.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error searching visits:', error);
      }
    });
  }

  promptDeleteVisit(id: any) {
    this.visitIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.visitIdToDelete = null;
  }

  deleteVisit() {
    this.api.deleteVisit(this.visitIdToDelete, this.token).subscribe({
      next: (data: any) => {
        this.toastMessage = 'Visita eliminada exitosamente.';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.getVisits();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al eliminar visita.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error deleting visit:', error);
      }
    });

    this.showDeleteModal = false;
    this.visitIdToDelete = null;
  }

  promptViewTicket(visitId: any) {
    this.visitIdForTicket = visitId;
    this.api.getVisitById(visitId, this.token).subscribe({
      next: (res: any) => {
        this.visitInfo = res.data;
        if (this.visitInfo) {
          this.showTicketModal = true;
          res.data.visitors.forEach((visitor: any) => {
            if (visitor.price.type == 'Niño') {
              this.childrenCount++;
            } else if (visitor.price.type == 'Adulto') {
              this.adultsCount++;
            } else if (visitor.price.type == 'Adulto Mayor') {
              this.seniorsCount++;
            } else if (visitor.price.type == 'Discapacitado') {
              this.disabledCount++;
            } else {
              console.warn('Tipo de visitante desconocido:', visitor.price.type);
            }
          });
        } else {
          this.showTicketModal = false;
          this.visitIdForTicket = null;
          this.toastMessage = 'No se encontró el ticket asociado a esta visita.';
          this.showErrorToast = true;
          this.autoHideToast();
        }
      },
      error: (error: any) => {
        this.toastMessage = 'Error al obtener el ticket.';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error('Error fetching ticket:', error);
      }
    });
  }

  closeTicketModal() {
    this.showTicketModal = false;
    this.visitIdForTicket = null;
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }

}
