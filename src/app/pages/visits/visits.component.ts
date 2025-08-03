import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import townships from '../../data/zacatecas-townships.json';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-visits',
  standalone: false,
  templateUrl: './visits.component.html',
  styleUrl: './visits.component.scss'
})
export class VisitsComponent implements OnInit {
  @ViewChild('ticketPrint', { static: false }) ticketPrint!: ElementRef<HTMLDivElement>;
  constructor(private api: ApiService) { }
  token: any = null;
  userId: any = null;
  role: any = null;
  visits: any[] = [];
  prices: any[] = [];
  discountValue: number = 0;

  page: number = 1;
  size: number = 20;
  totalPages: number = 1;
  currentPage: number = 1;
  pagesArray: number[] = [];
  loading: boolean = false;

  searchDateText: string = '';
  isSearching: boolean = false;

  toastMessage: string = '';

  showAddModal: boolean = false;
  tempVar: any = null;
  visitorInfo: any = {};
  visitors: any[] = [];
  visitToAdd: any = {};
  discount: any = '';
  quantity: number = 0;
  total: number = 0;

  showDeleteModal: boolean = false;
  visitIdToDelete: any = null;

  addPaymentModal: boolean = false;
  paymentData: { cash: number; card?: number; payment_check?: number } = {
    cash: 0.0,
    card: 0.0,
    payment_check: 0.0
  };

  visitId: any = null;
  showTicketModal: boolean = false;
  visitInfo: any = {};
  maleChildrenCount: number = 0;
  femaleChildrenCount: number = 0;
  maleAdultsCount: number = 0;
  femaleAdultsCount: number = 0;
  maleSeniorsCount: number = 0;
  femaleSeniorsCount: number = 0;
  maleDisabledCount: number = 0;
  femaleDisabledCount: number = 0;
  maleTeachersCount: number = 0;
  femaleTeachersCount: number = 0;

  totalsByType: any = {
    'Niño': {
      male: 0,
      female: 0
    },
    'Adulto': {
      male: 0,
      female: 0
    },
    'Adulto Mayor': {
      male: 0,
      female: 0
    },
    'Discapacitado': {
      male: 0,
      female: 0
    },
    'Docente': {
      male: 0,
      female: 0
    }
  };

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

  getDiscount() {
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
        this.showToast('success');
        this.visits = [];
        this.page = 1;
        this.loadPage(1);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al eliminar visita.';
        this.showToast('error');
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
              if (visitor.gender == 'Masculino') {
                this.maleChildrenCount++;
                this.totalsByType['Niño'].male += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              } else {
                this.femaleChildrenCount++;
                this.totalsByType['Niño'].female += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              }
            } else if (visitor.price.type == 'Adulto') {
              if (visitor.gender == 'Masculino') {
                this.maleAdultsCount++;
                this.totalsByType['Adulto'].male += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              } else {
                this.femaleAdultsCount++;
                this.totalsByType['Adulto'].female += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              }
            } else if (visitor.price.type == 'Adulto mayor') {
              if (visitor.gender == 'Masculino') {
                this.maleSeniorsCount++;
                this.totalsByType['Adulto Mayor'].male += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              } else {
                this.femaleSeniorsCount++;
                this.totalsByType['Adulto Mayor'].female += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              }
            } else if (visitor.price.type == 'Discapacitado') {
              if (visitor.gender == 'Masculino') {
                this.maleDisabledCount++;
                this.totalsByType['Discapacitado'].male += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              } else {
                this.femaleDisabledCount++;
                this.totalsByType['Discapacitado'].female += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              }
            } else if (visitor.price.type == 'Docente') {
              if (visitor.gender == 'Masculino') {
                this.maleTeachersCount++;
                this.totalsByType['Docente'].male += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              } else {
                this.femaleTeachersCount++;
                this.totalsByType['Docente'].female += this.prices.find(p => p.id == visitor.price_id)?.price || 0;
              }
            }
          });
        } else {
          this.showTicketModal = false;
          this.visitId = null;
          this.toastMessage = 'No se encontró el ticket asociado a esta visita.';
          this.showToast('error');
        }
      },
      error: (error: any) => {
        this.toastMessage = 'Error al obtener el ticket.';
        this.showToast('error');
      }
    });
  }

  closeTicketModal() {
    this.showTicketModal = false;
    this.maleChildrenCount = 0;
    this.femaleChildrenCount = 0;
    this.maleAdultsCount = 0;
    this.femaleAdultsCount = 0;
    this.maleSeniorsCount = 0;
    this.femaleSeniorsCount = 0;
    this.maleDisabledCount = 0;
    this.femaleDisabledCount = 0;
    this.maleTeachersCount = 0;
    this.femaleTeachersCount = 0;
    this.visitId = null;
    this.totalsByType = {
      'Niño': { male: 0, female: 0 },
      'Adulto': { male: 0, female: 0 },
      'Adulto Mayor': { male: 0, female: 0 },
      'Discapacitado': { male: 0, female: 0 },
      'Docente': { male: 0, female: 0 }
    };
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.visitToAdd = {};
    this.visitors = [];
    this.paymentData = {
      cash: 0.0,
      card: 0.0,
      payment_check: 0.0
    };
    this.total = 0;
    this.visitorInfo = {};
    this.showAddModal = false;
    this.discount = '';
  }

  openAddPaymentModal() {
    this.addPaymentModal = true;
  }

  closeAddPaymentModal() {
    this.addPaymentModal = false;
    this.paymentData = {
      cash: 0.0,
      card: 0.0,
      payment_check: 0.0
    };
    this.visitId = null;
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
      const hasDisabled = this.visitors.some(v => {
        const priceObj = this.prices.find(p => p.id == v.price_id);
        return priceObj?.type == 'Discapacitado';
      });

      if (!hasDisabled) {
        this.toastMessage = 'No se puede aplicar descuento: no hay visitantes discapacitados.';
        this.showVisitErrorToast();
        this.discount = 'No';
        this.total = this.calculateTotal();
        return;
      }
      this.total = this.calculateTotal()
      this.visitors.forEach(visitor => {
        let v_price = visitor.price = this.prices.find(p => p.id == visitor.price_id);
        if (v_price.type != 'Discapacitado') {
          this.total = this.total - this.discountValue;
        }
      });
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
      this.showToast('error');
    }
  }

  removeVisitor(index: number) {
    this.visitors.splice(index, 1);
    this.total = this.calculateTotal();
  }

  addVisit() {
    this.api.addVisit(this.visitToAdd.contact, this.visitToAdd.township, this.visitToAdd.school, this.token).subscribe({
      next: (visitRes: any) => {
        this.visitors.forEach((visitor: any) => {
          this.api.addVisitor(visitRes.data.id, visitor.price_id, visitor.gender, this.token).subscribe({
            next: (visitorRes: any) => { },
            error: (err: any) => {
              this.toastMessage = 'Error al agregar visitante.';
              this.showVisitErrorToast();
            }
          });
        });
        let total = this.calculateTotal();
        if (this.discount == 'Sí') {
          total = total - this.discountValue;
        }
        this.api.addPayment(
          this.paymentData.cash ?? 0,
          this.paymentData.card ?? 0,
          this.paymentData.payment_check ?? 0,
          total,
          this.token
        ).subscribe({
          next: (paymentRes: any) => {
            this.api.addTicket(visitRes.data.id, paymentRes.data.id, this.token).subscribe({
              next: (ticketRes: any) => {
                this.visitToAdd = {};
                this.visitors = [];
                this.paymentData = {
                  cash: 0.0,
                  card: 0.0,
                  payment_check: 0.0
                };
                this.quantity = 0;
                this.discount = '';

                this.promptViewTicket(visitRes.data.id);
                this.showTicketModal = true;

                this.showAddModal = false;
                this.addPaymentModal = false;
                this.toastMessage = 'Visita agregada exitosamente.';
                this.visits = [];
                this.page = 1;
                this.loadPage(1);
                setTimeout(() => {
                  this.printTicket();
                  this.showVisitAddedToast();
                }, 50);
              }
              , error: (err: any) => {
                this.toastMessage = 'Error al agregar ticket.';
                this.showVisitErrorToast();
              }
            });
          }, error: (err: any) => {
            this.toastMessage = 'Error al agregar pago.';
            this.showVisitErrorToast();
          }
        });
      }, error: (err: any) => {
        this.toastMessage = 'Error al agregar visita.';
        this.showVisitErrorToast();
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
        this.showToast('error');
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

  updateStatus() {
    this.api.updateTicketStatus(this.visitInfo.ticket.id, this.status, this.token).subscribe({
      next: (res: any) => {
        this.toastMessage = 'Estado de visita actualizado exitosamente.';
        this.showStatusModal = false;
        this.showToast('success');
        this.loadPage(this.currentPage);
      },
      error: (error: any) => {
        this.toastMessage = 'Error al actualizar el estado de la visita.';
        this.showToast('error');
        this.showStatusModal = false;
      }
    });
  }

  async printTicket() {
    if (!this.ticketPrint) return;
    const element = this.ticketPrint.nativeElement;

    // Renderizar a canvas
    const canvas = await html2canvas(element, { useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    // Generar el PDF
    const pdf = new jsPDF({
      unit: 'mm',
      format: [80, (canvas.height * 80) / canvas.width],
      orientation: 'portrait'
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);

    // Obtener el blob
    const blob = pdf.output('blob');

    // Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    // Cargar el PDF en el iframe y llama al print
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    iframe.onload = () => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();

      // Limpiar después de imprimir
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
      }, 500);
    };
  }

  // Calcula cuánto falta por pagar
  get remaining(): number {
    const paid = (this.paymentData.cash || 0)
               + (this.paymentData.card || 0)
               + (this.paymentData.payment_check || 0);
    return Math.max(this.total - paid, 0);
  }

  // Recalcula los valores de pago para que no sean negativos o mayores al total
  onPaymentChange() {
    // Asegura que ningún valor sea negativo o mayor al restante
    this.paymentData.cash = Math.min(Math.max(this.paymentData.cash || 0, 0), this.total);
    this.paymentData.card = Math.min(Math.max(this.paymentData.card || 0, 0), this.total);
    this.paymentData.payment_check = Math.min(Math.max(this.paymentData.payment_check || 0, 0), this.total);
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

  private showVisitErrorToast() {
    const el = document.getElementById('visitErrorToast');
    if (!el) return;

    const toast = new Toast(el);
    toast.show();
    setTimeout(() => {
      toast.hide();
    }, 3000);
  }

  private showVisitAddedToast() {
    const el = document.getElementById('visitAddedToast');
    if (!el) return;

    const toast = new Toast(el);
    toast.show();
    setTimeout(() => {
      toast.hide();
    }, 3000);
  }

}
