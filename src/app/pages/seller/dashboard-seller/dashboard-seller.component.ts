import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-dashboard-seller',
  standalone: false,
  templateUrl: './dashboard-seller.component.html',
  styleUrl: './dashboard-seller.component.scss'
})
export class DashboardSellerComponent implements OnInit, OnDestroy{
  constructor(private api: ApiService, private router: Router) { }
  token: any = null;
  name: any = null;
  private refreshTimerId!: number;

  currentVisitors = 0;
  capacity = 0;
  occupancyPercent = 0;

  totalSales = 0;
  salesFilter = false;
  salesRange = { from: '', to: '' };

  recentVisits: any[] = [];

  visitorTypes = ['Adulto', 'Niño', 'Adulto Mayor', 'Discapacitado'];

  visitId: any = null;
  visitInfo: any = {};
  showStatusModal = false;
  status: any = null;

  toastMessage = '';

  ngOnInit() {
    this.token = localStorage.getItem('accessToken');
    this.name = localStorage.getItem('name');
    this.refreshAll();
    this.refreshTimerId = window.setInterval(() => this.refreshAll(), 30_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimerId);
  }

  private refreshAll() {
    this.loadCurrentVisitors();
    this.loadCapacity();
    this.getRecentVisits();
    
    if (this.salesFilter && this.salesRange.from && this.salesRange.to) {
      this.applySalesFilter();
    } else {
      this.loadTotalSales();
    }
  }

  getRecentVisits() {
    this.api.getVisitsPaginated(1, 7, this.token).subscribe({
      next: (res: any) => {
        this.recentVisits = res.data;
      },
      error: (error: any) => {
        this.toastMessage = 'Error al cargar las visitas recientes.';
        this.showToast('error');
      }
    });
  }

  async loadCurrentVisitors() {
    this.api.getActiveVisitorsCount(this.token).subscribe({
      next: (res: any) => {
        this.currentVisitors = res.count;
        this.calculateOccupancy();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al cargar el número de visitantes activos.';
        this.showToast('error');
      }
    })
  }

  async loadCapacity() {
    this.api.getSettings(this.token).subscribe({
      next: (res: any) => { 
        this.capacity = res.data.capacity;
        this.calculateOccupancy();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al cargar el aforo máximo.';
        this.showToast('error');
      }
    })
  }

  calculateOccupancy() {
    if (this.capacity > 0) {
      this.occupancyPercent = Math.round((this.currentVisitors / this.capacity) * 100);
    } else {
      this.occupancyPercent = 0;
    }
  }

  async loadTotalSales() {
    this.api.getTotalSales(this.token).subscribe({
      next: (res: any) => {
        this.totalSales = res.totalSales;
      },
      error: (error: any) => {
        this.toastMessage = 'Error al cargar las ventas totales.';
        this.showToast('error');
      }
    })
  }

  applySalesFilter() {
    if (!this.salesRange.from || !this.salesRange.to) return;
    this.api.getSalesInDateRange(this.salesRange.from, this.salesRange.to, this.token)
      .subscribe({
        next: (res: any) => {
          this.totalSales = res.salesInRange;
        },
        error: (err: any) => {
          this.toastMessage = 'Error al aplicar el filtro de ventas.';
          this.showToast('error');
        }
      });
  }

  resetSalesFilter() {
    this.salesFilter = false;
    this.loadTotalSales();
  }

  countByType(visitors: any[], type: string): number {
    return visitors.filter(v => v.price?.type === type).length;
  }

  getNonZeroVisitorTypes(visitors: any[]): string[] {
    return this.visitorTypes.filter(t => this.countByType(visitors, t) > 0);
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

  updateStatus(){
    this.api.updateTicketStatus(this.visitInfo.ticket.id, this.status, this.token).subscribe({
      next: (res: any) => {
        this.toastMessage = 'Estado de visita actualizado exitosamente.';
        this.showToast('success');
        this.showStatusModal = false;
        this.refreshAll();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al actualizar el estado de la visita.';
        this.showToast('error');
        this.showStatusModal = false;
      }
    });
  }

  redirectToSales() {
    this.router.navigate(['/sales']);
  }

  redirectToAddVisit() {
    localStorage.setItem('showAddModal', 'true');
    this.router.navigate(['/visits']);
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
