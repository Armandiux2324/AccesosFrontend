import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardSellerComponent } from './dashboard-seller.component';

const routes: Routes = [{ path: '', component: DashboardSellerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardSellerRoutingModule { }
