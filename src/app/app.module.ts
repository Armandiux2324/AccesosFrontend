import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { AdminSidebarComponent } from './shared/admin-sidebar/admin-sidebar.component';
import { SellerSidebarComponent } from './shared/seller-sidebar/seller-sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    SellerLayoutComponent,
    AdminSidebarComponent,
    SellerSidebarComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
