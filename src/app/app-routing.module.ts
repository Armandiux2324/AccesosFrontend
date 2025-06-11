import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Layouts
import { AdminLayoutComponent }  from './layouts/admin-layout/admin-layout.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'dashboard-admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/admin/dashboard-admin/dashboard-admin.module').then(m => m.DashboardAdminModule)
      },
      { 
        path: 'users', 
        loadChildren: () => import('./pages/admin/users/users.module').then(m => m.UsersModule) 
      },
      { 
        path: 'stats', 
        loadChildren: () => import('./pages/admin/stats/stats.module').then(m => m.StatsModule) 
      },
      { 
        path: 'config', 
        loadChildren: () => import('./pages/admin/config/config.module').then(m => m.ConfigModule) 
      },
      { path: 'sales', 
        loadChildren: () => import('./pages/admin/sales/sales.module').then(m => m.SalesModule) 
      },
    ]
  },

  {
    path: 'dashboard-seller',
    component: SellerLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/seller/dashboard-seller/dashboard-seller.module').then(m => m.DashboardSellerModule)
      },
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
