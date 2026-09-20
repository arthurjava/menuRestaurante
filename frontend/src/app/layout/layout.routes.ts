import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { authGuard } from '../core/auth.guard';
import { roleGuard } from '../core/role.guard';

export const layoutRoutes: Routes = [
  // Public routes (no auth required)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: '/menu', pathMatch: 'full' },
      {
        path: 'menu',
        loadComponent: () => import('../features/menu/menu.component').then(m => m.MenuComponent),
      },
      {
        path: 'auth',
        children: [
          { path: 'login', loadComponent: () => import('../features/auth/login/login.component').then(m => m.LoginComponent) },
          { path: 'register', loadComponent: () => import('../features/auth/register/register.component').then(m => m.RegisterComponent) },
        ],
      },
    ],
  },

  // Admin routes (auth + role required)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('../features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('../features/categories/categories-list.component').then(m => m.CategoriesListComponent) },
        ],
      },
      {
        path: 'dishes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('../features/dishes/dishes-list.component').then(m => m.DishesListComponent) },
        ],
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('../features/users/users-list.component').then(m => m.UsersListComponent) },
        ],
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('../features/settings/settings.component').then(m => m.SettingsComponent) },
        ],
      },
    ],
  },

  // Redirect legacy routes to new structure
  { path: 'dashboard', redirectTo: '/admin/dashboard' },
  { path: 'categories', redirectTo: '/admin/categories' },
  { path: 'dishes', redirectTo: '/admin/dishes' },
  { path: 'users', redirectTo: '/admin/users' },
  { path: 'settings', redirectTo: '/admin/settings' },

  // Fallback
  { path: '**', redirectTo: '/menu' },
];