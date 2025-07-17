import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

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

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  childPrice     = 0;
  adultPrice     = 0;
  seniorPrice    = 0;
  disabledPrice  = 0;
  studentPrice  = 0;

  ngOnInit() {
    this.token = localStorage.getItem('accessToken');
    this.getPrices();
    this.getSettings();
  }

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
        console.error('Error fetching prices:', err);
      }
    });
  }

  getSettings() {
    this.api.getSettings(this.token).subscribe({
      next: (data: any) => {
        this.settingsObject = data.data;
        this.settingsId = data.data.id;
        this.capacity = data.data.capacity;
        this.companion_discount = data.data.companion_discount;
        this.initialCapacity = data.data.capacity;
        this.initialCompanionDiscount = data.data.companion_discount;
        console.log('Settings fetched:', this.settingsObject);
      },
      error: (err: any) => {
        console.error('Error fetching settings:', err);
      }
    });
  }

  updatePrices() {
    const updates = this.prices.map((price: any) => ({
      id:    price.id,
      price: price.price
    }));
    console.log('Updating prices:', updates);

    this.api.updatePrices(updates, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Precios actualizados correctamente';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.getPrices();
      },
      error: err => {
        this.toastMessage = 'Error al actualizar precios';
        this.showErrorToast = true;
        this.autoHideToast();
        console.error(err);
      }
    });
  }

  updateSettings() {
    this.api.updateSettings(this.settingsId, this.capacity, this.companion_discount, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Cambios guardados correctamente';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.getSettings();
      },
      error: err => {
        this.toastMessage = 'Error al guardar cambios';
        this.showErrorToast = true;
        this.autoHideToast();
      }
    });
  }

  get isPricesChanged(): boolean {
    return this.prices.some((p: any, i: number) => p.price !== this.initialPrices[i]);
  }

  get isSettingsChanged(): boolean {
    return this.capacity !== this.initialCapacity || this.companion_discount !== this.initialCompanionDiscount;
  }

  private autoHideToast() {
    setTimeout(() => {
      this.showSuccessToast = false;
      this.showErrorToast = false;
    }, 3000);
  }

}
