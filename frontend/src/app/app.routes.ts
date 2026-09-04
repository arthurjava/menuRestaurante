import { Routes } from '@angular/router';
import { authGuard, adminGuard, managerGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'categories',
    canActivate: [managerGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      }
    ]
  },
  {
    path: 'dishes',
    canActivate: [managerGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dishes/dish-list/dish-list.component').then(m => m.DishListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/dishes/dish-form/dish-form.component').then(m => m.DishFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/dishes/dish-form/dish-form.component').then(m => m.DishFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/dishes/dish-detail/dish-detail.component').then(m => m.DishDetailComponent)
      }
    ]
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      }
    ]
  },
  {
    path: 'settings',
    canActivate: [managerGuard],
    children: [
      {
        path: '',
        redirectTo: 'restaurant-info',
        pathMatch: 'full'
      },
      {
        path: 'restaurant-info',
        loadComponent: () => import('./features/settings/restaurant-info/restaurant-info.component').then(m => m.RestaurantInfoComponent)
      },
      {
        path: 'business-hours',
        loadComponent: () => import('./features/settings/business-hours/business-hours.component').then(m => m.BusinessHoursComponent)
      },
      {
        path: 'contact-info',
        loadComponent: () => import('./features/settings/contact-info/contact-info.component').then(m => m.ContactInfoComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: '/menu'
  }
];