import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Toast } from 'bootstrap'; 

@Component({
  selector: 'app-config',
  standalone: false,
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent implements OnInit {
  constructor(private api: ApiService) { }

  token: any = null;
  prices: any = [];
  settingsObject: any = {};
  settingsId: any = null;
  capacity: any = null;
  companion_discount: any = null;
  priceIds: any[] = [];
  private initialPrices: number[] = [];
  private initialCapacity: number = 0;
  private initialCompanionDiscount: number = 0;

  toastMessage = '';

  childPrice     = 0;
  adultPrice     = 0;
  seniorPrice    = 0;
  disabledPrice  = 0;
  studentPrice  = 0;

  // Inicializar los precios y configuraciones
  ngOnInit() {
    this.token = localStorage.getItem('accessToken');
    this.getPrices();
    this.getSettings();
  }

  // Obtener precios y configuraciones desde la API enviando el token y asignarlos a las variables correspondientes
  getPrices(){
    this.api.getPrices(this.token).subscribe({
      next: (data: any) => {
        this.prices = data.data;
        this.initialPrices = this.prices.map((p: any) => p.price);
        this.childPrice = this.prices.find((p: { type: string; }) => p.type === 'Niño')?.price ?? 0;
        this.adultPrice = this.prices.find((p: { type: string; }) => p.type === 'Adulto')?.price ?? 0;
        this.seniorPrice = this.prices.find((p: { type: string; }) => p.type === 'Adulto mayor')?.price ?? 0;
        this.disabledPrice = this.prices.find((p: { type: string; }) => p.type === 'Discapacitado')?.price ?? 0;
        this.studentPrice = this.prices.find((p: { type: string; }) => p.type === 'Estudiante')?.price ?? 0;
      },
      error: (err: any) => {
        this.toastMessage = 'Error al obtener precios';
        this.showToast('error');
      }
    });
  }

  // Obtener configuraciones desde la API enviando el token y asignarlos a las variables correspondientes
  getSettings() {
    this.api.getSettings(this.token).subscribe({
      next: (data: any) => {
        this.settingsObject = data.data;
        this.settingsId = data.data.id;
        this.capacity = data.data.capacity;
        this.companion_discount = data.data.companion_discount;
        this.initialCapacity = data.data.capacity;
        this.initialCompanionDiscount = data.data.companion_discount;
      },
      error: (err: any) => {
        this.toastMessage = 'Error al obtener configuraciones';
        this.showToast('error');
      }
    });
  }

  // Actualizar precios y configuraciones enviando el token, el ID y el precio de los registros a editar
  updatePrices() {
    const updates = this.prices.map((price: any) => ({
      id:    price.id,
      price: price.price
    }));

    this.api.updatePrices(updates, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Precios actualizados correctamente';
        this.showToast('success');
        this.getPrices();
      },
      error: err => {
        this.toastMessage = 'Error al actualizar precios';
        this.showToast('error');
      }
    });
  }

  // Actualizar configuraciones enviando el ID, la capacidad y el descuento de acompañante
  updateSettings() {
    this.api.updateSettings(this.settingsId, this.capacity, this.companion_discount, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Cambios guardados correctamente';
        this.showToast('success');
        this.getSettings();
      },
      error: err => {
        this.toastMessage = 'Error al guardar cambios';
        this.showToast('error');
      }
    });
  }

  // Verificar si los precios o configuraciones han cambiado
  get isPricesChanged(): boolean {
    return this.prices.some((p: any, i: number) => p.price !== this.initialPrices[i]);
  }

  // Verificar si la capacidad o el descuento de acompañante han cambiado
  get isSettingsChanged(): boolean {
    return this.capacity !== this.initialCapacity || this.companion_discount !== this.initialCompanionDiscount;
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
