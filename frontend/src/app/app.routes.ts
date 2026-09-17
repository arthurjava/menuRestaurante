import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'categories',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/categories/categories.routes').then(m => m.categoriesRoutes)
  },
  {
    path: 'dishes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/dishes/dishes.routes').then(m => m.dishesRoutes)
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes)
  },
  {
    path: 'menu',
    loadChildren: () => import('./features/menu/menu.routes').then(m => m.menuRoutes)
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.settingsRoutes)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];