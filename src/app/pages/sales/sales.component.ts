import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import townships from '../../data/zacatecas-townships.json';

import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  role: any = null;
  visits: any[] = [];
  prices: any[] = [];
  discountValue: number = 0;

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

  showAddModal = false;
  tempVar: any = null;
  visitorInfo: any = {};
  visitors: any[] = [];
  visitToAdd: any = {};
  discount: any = '';
  paymentData: any = {};
  quantity: number = 0;
  total: number = 0;

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

  townshipCtrl = new FormControl('');
  townships: any[] = townships;
  filteredTownships!: Observable<string[]>;

  showStatusModal = false;
  status: any = null;

  private refreshTimerId!: number;

  ngOnInit() {
    this.token = localStorage.getItem('accessToken');
    this.userId = localStorage.getItem('userId');
    this.role = localStorage.getItem('role');
    this.tempVar = localStorage.getItem('showAddModal');

    this.filteredTownships = this.townshipCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.filerTownship(value || ''))
    );
    if (this.tempVar === 'true') {
      this.showAddModal = true;
      localStorage.removeItem('showAddModal');
    } else {
      this.showAddModal = false;
      localStorage.removeItem('showAddModal');
    }

    this.refreshAll();
    this.refreshTimerId = window.setInterval(() => this.refreshAll(), 2_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimerId);
  }

  private refreshAll() {
    this.getDiscount();
    this.getPrices();
    this.loadPage(this.currentPage);
  }

  getDiscount(){
    this.api.getSettings(this.token).subscribe({
      next: (res: any) => {
        this.discountValue = res.data.companion_discount;
      },
      error: (err: any) => {
        console.error('Error fetching discount:', err);
      }
    });
  }

  getPrices() {
    this.api.getPrices(this.token).subscribe({
      next: (res: any) => {
        this.prices = res.data;
        console.log('Prices fetched successfully:', this.prices);
      },
      error: (err: any) => {
        console.error('Error fetching prices:', err);
      }
    });
  }

  private filerTownship(value: string): string[] {
    const filter = value.toLowerCase();
    return this.townships.filter(t => t.toLowerCase().includes(filter));
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
            } else if (visitor.price.type == 'Adulto mayor') {
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
    this.childrenCount = 0;
    this.adultsCount = 0;
    this.seniorsCount = 0;
    this.disabledCount = 0;
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

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.visitToAdd = {};
    this.showAddModal = false;
  }

  getPriceType(priceId: number) {
    const p = this.prices.find(x => x.id == priceId);
    return p ? p.type : 'Desconocido';
  }

  calculateTotal(): number {
    return this.visitors.reduce((sum, v) => {
      const priceObj = this.prices.find(p => p.id == v.price_id);
      return sum + (priceObj?.price ?? 0);
    }, 0);
  }

  onDiscountChange() {
    if (this.discount == 'Sí') {
      this.total = this.calculateTotal()
      this.total = this.total - this.discountValue;
    } else {
      this.total = this.calculateTotal();
    }
  }

  addVisitor() {
    const visitor = this.visitorInfo;
    if (visitor.gender && visitor.price_id != null && this.quantity > 0) {
      const tempQuantity = this.quantity;
      for (let i = 0; i < tempQuantity; i++) {
        this.visitors.push({
          gender: this.visitorInfo.gender,
          price_id: this.visitorInfo.price_id,
        });
      }
      if (this.discount == 'Sí') {
        this.total = this.calculateTotal() - this.discountValue;
      } else {
        this.total = this.calculateTotal();
      }
      this.visitorInfo = {};
      this.quantity = 0;
    } else {
      this.toastMessage = 'Por favor, ingrese la información del visitante.';
      this.showErrorToast = true;
      this.autoHideToast();
    }
  }

  removeVisitor(index: number) {
    this.visitors.splice(index, 1);
  }

  addVisit() {
    this.api.addVisit(this.visitToAdd.contact, this.visitToAdd.township, this.visitToAdd.school, this.token).subscribe({
      next: (visitRes: any) => {
        this.visitors.forEach((visitor: any) => {
          this.api.addVisitor(visitRes.data.id, visitor.price_id, visitor.gender, this.token).subscribe({
            next: (visitorRes: any) => {
              console.log('Visitor added successfully:', visitorRes);
            }, error: (err: any) => {
              console.error('Error adding visitor:', err);
            }
          });
        });
        let total = this.calculateTotal();
        if(this.discount == 'Sí'){
          total = total - this.discountValue;
        }
        this.api.addPayment(this.paymentData.payment_type, this.paymentData.reference, total, this.token).subscribe({
          next: (paymentRes: any) => {
            this.api.addTicket(visitRes.data.id, paymentRes.data.id, this.discount, this.token).subscribe({
              next: (ticketRes: any) => {
                this.visitToAdd = {};
                this.visitors = [];
                this.paymentData = {};
                this.quantity = 0;
                this.discount = '';

                this.promptViewTicket(visitRes.data.id);
                this.showTicketModal = true;

                this.showAddModal = false;
                this.toastMessage = 'Visita agregada exitosamente.';
                this.showSuccessToast = true;
                this.autoHideToast();
                this.visits = [];
                this.page = 1;
                this.loadPage(1);
              }
              , error: (err: any) => {
                console.error('Error adding ticket:', err);
              }
            });
          }, error: (err: any) => {
            console.error('Error adding payment:', err);
          }
        });
      }, error: (err: any) => {
        this.toastMessage = 'Error al agregar visita.';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  getVisitInfo(visit: any) {
    this.api.getVisitById(visit.id, this.token).subscribe({
      next: (res: any) => {
        this.visitInfo = res.data;
        this.status = this.visitInfo.ticket.status;
      }, 
      error: (error: any) => {
        this.toastMessage = 'Error al cargar la información de la visita.';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  onChangeStatus(visit: any) {
    this.visitId = visit.id;
    this.getVisitInfo(visit);
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
  }

  updateStatus(){
    this.api.updateTicketStatus(this.visitInfo.ticket.id, this.status, this.token).subscribe({
      next: (res: any) => {
        this.toastMessage = 'Estado de visita actualizado exitosamente.';
        this.showSuccessToast = true;
        this.showStatusModal = false;
        this.autoHideToast();
        this.loadPage(this.currentPage);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al actualizar el estado de la visita.';
        this.showErrorToast = true;
        this.showStatusModal = false;
        this.autoHideToast();
      }
    });
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }

}
