import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-list.component').then(m => m.UsersListComponent)
  }
];