import { Routes } from '@angular/router';

export const menuRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./menu.component').then(m => m.MenuComponent)
  }
];