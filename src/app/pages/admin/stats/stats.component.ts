import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Chart, registerables } from 'chart.js';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ChartData { label: string; value: number; }

enum FilterType {
  DateRange = 'date-range',
  TicketType = 'ticket-type',
  Gender = 'gender',
  AgeGroup = 'age-group',
  Township = 'township'
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
  private refreshTimerId!: number;

  // cuadros
  currentVisitors = 0;
  capacity = 0;
  occupancyPercent = 0;

  totalSales = 0;
  salesFilter = false;
  salesRange = { from: '', to: '' };

  // filtros
  selectedFilter: FilterType = FilterType.DateRange;
  dateRange = { from: '', to: '' };

  // datos para gráfica
  chartData: ChartData[] = [];
  private chart!: Chart;

  ngOnInit() {
    this.token = localStorage.getItem('accessToken');
    this.initDateRange();
    this.refreshAll();
    this.refreshTimerId = window.setInterval(() => this.refreshAll(), 5_000);
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
    clearInterval(this.refreshTimerId);
    this.chart.destroy();
  }

  private refreshAll() {
    this.loadCurrentVisitors();
    this.loadCapacity();

    if (this.salesFilter && this.salesRange.from && this.salesRange.to) {
      this.applySalesFilter();
    } else {
      this.loadTotalSales();
    }

    this.loadChartData();
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

  initDateRange() {
    const today = new Date();
    const prior = new Date();
    prior.setDate(today.getDate() - 7);
    this.dateRange.from = prior.toISOString().slice(0, 10);
    this.dateRange.to = today.toISOString().slice(0, 10);

    this.salesRange.from = this.dateRange.from;
    this.salesRange.to = this.dateRange.to;
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

  applySalesFilter() {
    if (!this.salesRange.from || !this.salesRange.to) return;
    this.api.getSalesInDateRange(this.salesRange.from, this.salesRange.to, this.token)
      .subscribe({
        next: (res: any) => {
          this.totalSales = res.salesInRange;
        },
        error: err => console.error('Error loading sales in range:', err)
      });
  }

  resetSalesFilter() {
    this.salesFilter = false;
    this.loadTotalSales();
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

      case FilterType.Township:
        this.api.getVisitorsByTownship(this.token)
          .subscribe({
            next: (res: any) => {
              this.chartData = res.data.map((d: any) => ({ label: d.township, value: d.count }));
              this.renderChart('Municipio');
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

  //Funciones para exportar a Excel
  get currentFilterLabel(): string {
    switch (this.selectedFilter) {
      case this.FilterType.DateRange: return `Rango de fechas (${this.dateRange.from} → ${this.dateRange.to})`;
      case this.FilterType.TicketType: return 'Tipo de boleto';
      case this.FilterType.Gender: return 'Género';
      case this.FilterType.AgeGroup: return 'Grupo de edad';
      case this.FilterType.Township: return 'Municipio';
    }
  }

  async exportToExcel() {
    // Capturar gráfica como imagen
    const canvas = document.getElementById('statisticsChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Para fondo blanco de la imagen
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Convertir a base64
    const chartDataUrl = canvas.toDataURL('image/png');

    // Crea el workbook y la hoja
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Estadísticas');

    // Título del archivo
    ws.mergeCells('A1:C1');
    ws.getCell('A1').value = `Estadísticas - ${this.currentFilterLabel}`;
    ws.getCell('A1').font = { size: 16, bold: true };

    // Tabla de métricas (visitantes y ventas)
    ws.addRow([]);
    ws.addRow(['Visitantes actuales', this.currentVisitors]);
    ws.addRow(['Ventas en rango seleccionado', this.totalSales]);
    ws.addRow([]);

    // Insertar la imagen del gráfico generado la hoja
    const imgId = wb.addImage({
      base64: chartDataUrl,
      extension: 'png',
    });
    // Ajuste de posición: fila 6, columna A
    ws.addImage(imgId, {
      tl: { col: 0.5, row: 5 },  // top-left
      ext: { width: 600, height: 300 }
    });

    // Generar el archivo y ejecuta descarga del mismo
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `estadisticas_${this.currentFilterLabel.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
  }

}
