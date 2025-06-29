import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-sales',
  standalone: false,
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit, OnDestroy {
  @ViewChild('anchor', { static: true }) anchor!: ElementRef<HTMLElement>;

  constructor(private api: ApiService) { }
  token: any = null;
  userId: any = null;
  visits: any[] = [];
  page = 1;
  size = 20;
  totalPages = 1;
  loading = false;

  private observer!: IntersectionObserver;

  searchDateText = '';
  isSearching = false;

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

    this.loadVisitsPage();
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.loading && this.page <= this.totalPages) {
        this.loadVisitsPage();
      }
    });
    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  async loadVisitsPage() {
    if (this.loading || this.page > this.totalPages) return;
    this.loading = true;

    if (this.isSearching && this.searchDateText) {
      this.api.searchVisitsPaginated(this.searchDateText, this.page, this.size, this.token).subscribe({
        next: (res: any) => {
          console.log('Visits fetched:', res.data);
          this.visits = res.data;
          this.totalPages = res.totalPages;
          this.page++;
          this.loading = false;
        },
        error: () => {
          console.error('Error fetching visits');
          this.loading = false;
        }
      });
    } else {
      this.api.getVisitsPaginated(this.page, this.size, this.token).subscribe({
        next: (res: any) => {
          console.log('Visits fetched:', res.data);
          this.visits = res.data;
          this.totalPages = res.totalPages;
          this.page++;
          this.loading = false;
        },
        error: () => {
          console.error('Error fetching visits');
          this.loading = false;
        }
      });
    }
  }

  searchByDate() {
    if (!this.searchDateText) {
      this.isSearching = false;
      this.visits = [];
      this.page = 1;
      this.loadVisitsPage();
      return;
    }

    this.isSearching = true;
    this.visits = [];
    this.page = 1;
    this.totalPages = 1;

    this.loadVisitsPage();
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
        this.loadVisitsPage();
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
