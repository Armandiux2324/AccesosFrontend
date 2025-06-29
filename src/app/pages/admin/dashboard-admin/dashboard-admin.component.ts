import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Chart, registerables } from 'chart.js';  

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
  
  ngOnInit() {
      this.token = localStorage.getItem('authToken');
      this.name = localStorage.getItem('name');
      this.loadMetrics();
      this.loadChartData();

      this.refreshTimerId = window.setInterval(() => {
        this.loadMetrics();
        this.loadChartData();
      }, 30_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimerId);
  }
  
  private loadMetrics() {
    this.getTodaySales();
    this.getTodayVisitors();
  }

  async getTodaySales(){
    this.api.getTodaySales(this.token).subscribe({
        next: (data: any) => {
          console.log('Today Sales:', data);
        },
        error: (error: any) => {
          console.error('Error fetching total sales:', error);
        }
      });
  }

  async getTodayVisitors(){
    this.api.getTodayVisitors(this.token).subscribe({
        next: (data: any) => {
          console.log('Today Visitors:', data);
        },
        error: (error: any) => {
          console.error('Error fetching today visitors:', error);
        }
      });
  }

  private loadChartData() {
    this.api.getLast7DaysSales(this.token).subscribe({
      next: (data: any) => {
        this.labels = data.labels;
        this.dataPoints = data.data;
        this.renderChart();
      },
      error: (error: any) => {
        console.error('Error fetching last 7 days sales:', error);
      }
    });
  }

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
}
