import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

const CATEGORY_MAP: Record<string, [string, string]> = {
  child:     ['Niño', 'Niña'],
  adult:     ['Adulto', 'Adulta'],
  senior:    ['Adulto mayor', 'Adulta mayor'],
  disabled:  ['Discapacitado', 'Discapacitada'],
  companion: ['Acompañante (H)', 'Acompañante (M)']
};

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
  capacityObject: any = {};
  capacity: any = null;
  capacityId: any = null;
  priceIds: any[] = [];

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  childPrice     = 0;
  adultPrice     = 0;
  seniorPrice    = 0;
  disabledPrice  = 0;
  companionDiscount = 0;

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
    this.getPrices();
    this.getCapacity();
  }

  getPrices(){
    this.api.getPrices(this.token).subscribe({
      next: (data: any) => {
        this.prices = data.data;
        this.childPrice     = this.prices.find((p: { type: string; }) => p.type === 'Niño')?.price ?? 0;
        this.adultPrice     = this.prices.find((p: { type: string; }) => p.type === 'Adulto')?.price ?? 0;
        this.seniorPrice    = this.prices.find((p: { type: string; }) => p.type === 'Adulto mayor')?.price ?? 0;
        this.disabledPrice  = this.prices.find((p: { type: string; }) => p.type === 'Discapacitado')?.price ?? 0;
        this.companionDiscount = this.prices.find((p: { type: string; }) => p.type === 'Acompañante (H)')?.price ?? 0;
      },
      error: (err: any) => {
        console.error('Error fetching prices:', err);
      }
    });
  }

  getCapacity() {
    this.api.getCapacity(this.token).subscribe({
      next: (data: any) => {
        this.capacityObject = data.data;
        this.capacityId = data.data.id;
        this.capacity = data.data.capacity;
        console.log('Capacity fetched successfully:', this.capacity);
      },
      error: (err: any) => {
        console.error('Error fetching capacity:', err);
      }
    });
  }

  updatePrices() {
    const updates = this.prices.map((p: { id: any; price: any; }) => ({
      id: p.id,
      price: p.price
    }));

    const addPair = (key: keyof typeof CATEGORY_MAP, price: number) => {
      const [maleType, femaleType] = CATEGORY_MAP[key];
      [maleType, femaleType].forEach(typeName => {
        const rec = this.prices.find((p: { type: string; }) => p.type === typeName);
        if (rec) updates.push({ id: rec.id, price });
      });
    };

    addPair('child',     this.childPrice);
    addPair('adult',     this.adultPrice);
    addPair('senior',    this.seniorPrice);
    addPair('disabled',  this.disabledPrice);
    addPair('companion', this.companionDiscount);

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

  updateCapacity() {
    this.api.updateCapacity(this.capacityId, this.capacity, this.token).subscribe({
      next: () => {
        this.toastMessage = 'Capacidad actualizada correctamente';
        this.showSuccessToast = true;
        this.autoHideToast();
        this.getCapacity();
      },
      error: err => {
        this.toastMessage = 'Error al actualizar capacidad';
        this.showErrorToast = true;
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
