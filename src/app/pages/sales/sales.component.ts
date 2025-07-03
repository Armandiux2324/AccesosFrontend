import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

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

  page = 1;
  size = 20;
  totalPages = 1;
  currentPage = 1;
  pagesArray: number[] = [];
  loading = false;

  searchDateText = '';
  isSearching = false;

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  showDeleteModal = false;
  visitIdToDelete: any = null;

  visitId: any = null;
  showTicketModal = false;
  showPaymentModal = false;
  visitInfo: any = {};
  childrenCount: number = 0;
  adultsCount: number = 0;
  seniorsCount: number = 0;
  disabledCount: number = 0;

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
    this.userId = localStorage.getItem('userId');

    this.loadPage(this.currentPage);
  }

  loadPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loading = true;
    const params = { page: String(page), size: String(this.size) };

    const handler = (res: any) => {
      this.visits = res.data
      this.totalPages = res.totalPages;
      this.currentPage = res.page;
      this.buildPagesArray();
      this.loading = false;
    };

    if (this.isSearching && this.searchDateText) {
      this.api.searchVisitsPaginated(this.searchDateText, page, this.size, this.token).subscribe({
        next: (res: any) => {
          handler(res);
        },
        error: (err: any) => {
          this.loading = false;
        }
      });
    } else {
      this.api.getVisitsPaginated(page, this.size, this.token).subscribe({
        next: (res: any) => {
          handler(res);
        },
        error: (err: any) => {
          this.loading = false;
        }
      });
    }
  }

  private buildPagesArray() {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page === this.currentPage) return;
    this.loadPage(page);
  }

  searchByDate() {
    this.isSearching = true;
    this.visits = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.loadPage(1);
  }

  resetSearch() {
    this.searchDateText = '';
    this.isSearching = false;
    this.visits = [];    
    this.currentPage = 1;
    this.totalPages = 1;
    this.loadPage(1);
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
        this.visits = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al eliminar visita.';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });

    this.showDeleteModal = false;
    this.visitIdToDelete = null;
  }

  promptViewTicket(visitId: any) {
    this.visitId = visitId;
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
          this.visitId = null;
          this.toastMessage = 'No se encontró el ticket asociado a esta visita.';
          this.showErrorToast = true;
          this.autoHideToast();
        }
      },
      error: (error: any) => {
        this.toastMessage = 'Error al obtener el ticket.';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  closeTicketModal() {
    this.showTicketModal = false;
    this.visitId = null;
  }

  promptViewPayment(visitId: any) {
    this.visitId = visitId;
    this.api.getVisitById(visitId, this.token).subscribe({
      next: (res: any) => {
        this.visitInfo = res.data;
        if (this.visitInfo) {
          this.showPaymentModal = true;
        } else {
          this.showPaymentModal = false;
          this.visitId = null;
          this.toastMessage = 'No se encontró el pago asociado a esta visita.';
          this.showErrorToast = true;
          this.autoHideToast();
        }
      },
      error: (error: any) => {
        this.toastMessage = 'Error al obtener el pago.';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.visitId = null;
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }

}
