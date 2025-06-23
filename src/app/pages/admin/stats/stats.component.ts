import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Chart, registerables } from 'chart.js';

interface ChartData { label: string; value: number; }

enum FilterType {
  DateRange = 'date-range',
  TicketType = 'ticket-type',
  Gender = 'gender',
  AgeGroup = 'age-group'
}

@Component({
  selector: 'app-stats',
  standalone: false,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private api: ApiService) {
    Chart.register(...registerables);
  }
  token: any = null;
  FilterType = FilterType;

  // cuadros
  currentVisitors = 0;
  capacity = 0;
  occupancyPercent = 0;

  totalSales = 0;

  // filtros
  selectedFilter: FilterType = FilterType.DateRange;
  dateRange = { from: '', to: '' };

  // datos para gráfica
  chartData: ChartData[] = [];
  private chart!: Chart;

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
    this.loadCurrentVisitors();
    this.loadCapacity();
    this.loadTotalSales();
    this.initDateRange();
    this.loadChartData();
  }

  ngAfterViewInit() {
    const ctx = (document.getElementById('statisticsChart') as HTMLCanvasElement).getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Visitantes', data: [], fill: false, tension: 0.3 }] },
      options: {
        scales: {
          x: { title: { display: true, text: '' } },
          y: { title: { display: true, text: 'Cantidad' } }
        }
      }
    });
  }

  ngOnDestroy() {
    this.chart.destroy();
  }

  async loadCurrentVisitors() {
    this.api.getActiveVisitorsCount(this.token).subscribe({
      next: (res: any) => {
        this.currentVisitors = res.count;
        this.calculateOccupancy();
      },
      error: (error: any) => {
        console.error('Error loading current visitors:', error);
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
        console.error('Error loading capacity:', error);
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
        console.error('Error loading total sales:', error);
      }
    })
  }

  initDateRange() {
    const today = new Date();
    const prior = new Date();
    prior.setDate(today.getDate() - 7);
    this.dateRange.from = prior.toISOString().slice(0, 10);
    this.dateRange.to = today.toISOString().slice(0, 10);
  }

  changeFilter(filter: FilterType) {
    this.selectedFilter = filter;
    this.loadChartData();
  }

  onDateRangeChange() {
    this.loadChartData();
  }

  private loadChartData() {
    switch (this.selectedFilter) {
      case FilterType.DateRange:
        this.api.getDailyVisitors(this.dateRange.from, this.dateRange.to, this.token)
          .subscribe({
            next: (res: any) => {
              console.log('Daily visitors data:', res.data);
              this.chartData = res.data.map((d: any) => ({
                label: d.date,
                value: d.count
              }));
              this.renderChart('Fecha');
            },
            error: (err: any) => console.error('Error loading daily visitors:', err)
          });
        break;

      case FilterType.TicketType:
        this.api.getVisitorsByPriceTypeTotal(this.token)
          .subscribe({
            next: (res: any) => {
              this.chartData = res.data.map((d: any) => ({ label: d.ticketType, value: d.count }));
              this.renderChart('Tipo de boleto');
            },
            error: err => console.error(err)
          });
        break;

      case FilterType.Gender:
        this.api.getVisitorsByGenderTotal(this.token)
          .subscribe({
            next: (res: any) => {
              this.chartData = res.data.map((d: any) => ({ label: d.gender, value: d.count }));
              this.renderChart('Género');
            },
            error: err => console.error(err)
          });
        break;

      case FilterType.AgeGroup:
        this.api.getVisitorsByAgeGroupTotal(this.token)
          .subscribe({
            next: (res: any) => {
              this.chartData = res.data.map((d: any) => ({ label: d.ageGroup, value: d.count }));
              this.renderChart('Grupo de edad');
            },
            error: err => console.error(err)
          });
        break;
    }
  }


  private renderChart(xLabel: string) {
    const labels = this.chartData.map(d => d.label);
    const data = this.chartData.map(d => d.value);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;

    const scales: any = this.chart.options.scales;
    if (scales?.x?.title) {
      scales.x.title.display = true;
      scales.x.title.text = xLabel;
    }
    this.chart.update();
  }

}
