import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-sidebar',
  standalone: false,
  templateUrl: './seller-sidebar.component.html',
  styleUrl: './seller-sidebar.component.scss'
})
export class SellerSidebarComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  redirectToDashboard() {
    this.router.navigate(['/dashboard-seller']);
  }

  redirectToSales(){
    this.router.navigate(['/dashboard-seller/sales']);
  }

}
