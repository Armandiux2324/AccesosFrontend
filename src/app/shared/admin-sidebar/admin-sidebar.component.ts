import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: false,
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  redirectToDashboard() {
    this.router.navigate(['/dashboard-admin']);
  }

  redirectToUsers(){
    this.router.navigate(['/dashboard-admin/users']);
  }

  redirectToStats(){
    this.router.navigate(['/dashboard-admin/stats']);
  }

  redirectToConfig(){
    this.router.navigate(['/dashboard-admin/config']);
  }

  redirectToSales(){
    this.router.navigate(['/dashboard-admin/sales']);
  }

}
