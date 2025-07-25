import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Chart, registerables } from 'chart.js';  
import { Toast } from 'bootstrap';

// Registrar los componentes de Chart.js, necesario para que Chart.js funcione correctamente con Angular
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-admin',
  standalone: false,
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})

export class DashboardAdminComponent implements OnInit, OnDestroy{
  constructor(private api: ApiService) { }
  token: any = null;
  name: any = null;
  totalSalesToday = 0;
  totalVisitorsToday = 0;

  private refreshTimerId!: number;

  labels: string[] = [];
  dataPoints: number[] = [];

  toastMessage = '';

  // Al iniciar el componente, se cargan las métricas y los datos del gráfico y se establece un temporizador para refrescar los datos cada 5 segundos.
  ngOnInit() {
      this.token = localStorage.getItem('accessToken');
      this.name = localStorage.getItem('name');
      this.loadMetrics();
      this.loadChartData();

      this.refreshTimerId = window.setInterval(() => {
        this.loadMetrics();
        this.loadChartData();
        console.log('Metrics and chart data refreshed');
      }, 5_000);
  }

  // Al cerrar el componente, se limpia el temporizador
  ngOnDestroy() {
    clearInterval(this.refreshTimerId);
  }
  
  // Carga las métricas de ventas y visitantes del día actual
  private loadMetrics() {
    this.getTodaySales();
    this.getTodayVisitors();
  }

  // Obtiene las ventas del día actual
  async getTodaySales(){
    this.api.getTodaySales(this.token).subscribe({
        next: (data: any) => {
          this.totalSalesToday = data.totalToday;
        },
        error: (error: any) => {
          this.toastMessage = 'Error al obtener las ventas del día';
          this.showToast('error');
        }
      });
  }

  // Obtiene los visitantes del día actual
  async getTodayVisitors(){
    this.api.getTodayVisitors(this.token).subscribe({
        next: (data: any) => {
          this.totalVisitorsToday = data.todayCount
        },
        error: (error: any) => {
          this.toastMessage = 'Error al obtener los visitantes del día';
          this.showToast('error');
        }
      });
  }

  // Carga los datos del gráfico de ventas de los últimos 7 días
  private loadChartData() {
    this.api.getLast7DaysSales(this.token).subscribe({
      next: (data: any) => {
        this.labels = data.labels;
        this.dataPoints = data.data;
        this.renderChart();
      },
      error: (error: any) => {
        this.toastMessage = 'Error al obtener los datos del gráfico';
        this.showToast('error');
      }
    });
  }

  // Renderiza el gráfico de ventas utilizando Chart.js
  private renderChart() {
    const ctx = (document.getElementById('salesChart') as HTMLCanvasElement).getContext('2d')!;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Ventas ($)',
          data: this.dataPoints,
          fill: false,
          tension: 0.3,
          borderColor: '#0d6efd'
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Fecha' } },
          y: { title: { display: true, text: 'Monto' } }
        }
      }
    });
  }

  // Mostrar los toasts de éxito o error
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
