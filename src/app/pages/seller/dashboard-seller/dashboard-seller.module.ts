import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardSellerRoutingModule } from './dashboard-seller-routing.module';
import { DashboardSellerComponent } from './dashboard-seller.component';


@NgModule({
  declarations: [
    DashboardSellerComponent
  ],
  imports: [
    CommonModule,
    DashboardSellerRoutingModule
  ]
})
export class DashboardSellerModule { }
