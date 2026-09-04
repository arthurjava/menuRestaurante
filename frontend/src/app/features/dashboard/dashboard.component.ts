import { AuthService } from '../../core/auth/auth.service';
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { Category, Dish, User } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ApiService } from '../../core/services/api.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, CurrencyBrlPipe, BadgeComponent],
  template: `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral do seu restaurante</p>
        </div>
        <div class="flex gap-3">
          <app-button variant="primary" routerLink="/dishes/new">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Novo Prato
          </app-button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-button variant="outline" class="card p-6 flex flex-col items-start" routerLink="/categories">
          <svg class="w-10 h-10 text-primary-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          <span class="text-3xl font-bold text-gray-900">{{ stats().categories }}</span>
          <span class="text-gray-500">Categorias</span>
        </app-button>

        <app-button variant="outline" class="card p-6 flex flex-col items-start" routerLink="/dishes">
          <svg class="w-10 h-10 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span class="text-3xl font-bold text-gray-900">{{ stats().dishes }}</span>
          <span class="text-gray-500">Pratos</span>
        </app-button>

        <app-button variant="outline" class="card p-6 flex flex-col items-start" routerLink="/users" *ngIf="authService.isAdmin()">
          <svg class="w-10 h-10 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span class="text-3xl font-bold text-gray-900">{{ stats().users }}</span>
          <span class="text-gray-500">Usuários</span>
        </app-button>

        <app-button variant="outline" class="card p-6 flex flex-col items-start" routerLink="/settings/restaurant-info">
          <svg class="w-10 h-10 text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span class="text-3xl font-bold text-gray-900">{{ stats().activeCategories }}</span>
          <span class="text-gray-500">Categorias Ativas</span>
        </app-button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Pratos Recentes</h2>
          </div>
          <div class="divide-y divide-gray-200">
            @for (dish of recentDishes(); track dish.id) {
              <a [routerLink]="['/dishes', dish.id]" class="block px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div class="flex items-center gap-4">
                  @if (dish.imageUrl) {
                    <img [src]="dish.imageUrl" alt="" class="w-12 h-12 rounded-lg object-cover">
                  } @else {
                    <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  }
                  <div>
                    <p class="font-medium text-gray-900">{{ dish.name }}</p>
                    <p class="text-sm text-gray-500">{{ dish.categoryName }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">{{ dish.price | currencyBrl }}</p>
                  <app-badge [variant]="dish.active ? 'success' : 'gray'">{{ dish.active ? 'Ativo' : 'Inativo' }}</app-badge>
                </div>
              </a>
            }
            @if (recentDishes().length === 0) {
              <div class="empty-state px-6 py-8">
                <p class="empty-state-title">Nenhum prato cadastrado</p>
                <p class="empty-state-description">Comece adicionando seu primeiro prato</p>
                <app-button variant="primary" routerLink="/dishes/new" class="mt-4">Adicionar Prato</app-button>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Categorias</h2>
            <app-button variant="primary" size="sm" routerLink="/categories/new">Nova</app-button>
          </div>
          <div class="divide-y divide-gray-200">
            @for (category of recentCategories(); track category.id) {
              <a [routerLink]="['/categories', category.id, 'edit']" class="block px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div class="flex items-center gap-4">
                  @if (category.imageUrl) {
                    <img [src]="category.imageUrl" alt="" class="w-12 h-12 rounded-lg object-cover">
                  } @else {
                    <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                    </div>
                  }
                  <div>
                    <p class="font-medium text-gray-900">{{ category.name }}</p>
                    <p class="text-sm text-gray-500">{{ category.dishCount || 0 }} pratos</p>
                  </div>
                </div>
                <app-badge [variant]="category.active ? 'success' : 'gray'">{{ category.active ? 'Ativa' : 'Inativa' }}</app-badge>
              </a>
            }
            @if (recentCategories().length === 0) {
              <div class="empty-state px-6 py-8">
                <p class="empty-state-title">Nenhuma categoria cadastrada</p>
                <p class="empty-state-description">Organize seus pratos criando categorias</p>
                <app-button variant="primary" routerLink="/categories/new" class="mt-4">Criar Categoria</app-button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  loadingService = inject(LoadingService);

  stats = signal({ categories: 0, dishes: 0, users: 0, activeCategories: 0 });
  recentDishes = signal<Dish[]>([]);
  recentCategories = signal<Category[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadStats();
    await this.loadRecent();
  }

  async loadStats(): Promise<void> {
    try {
      const [categoriesRes, dishesRes, usersRes] = await Promise.all([
        this.apiService.getCategoriesAdmin({ page: 0, size: 1 }).toPromise(),
        this.apiService.getDishesAdmin({ page: 0, size: 1 }).toPromise(),
        this.authService.isAdmin() ? this.apiService.getUsers({ page: 0, size: 1 }).toPromise() : Promise.resolve({ totalElements: 0 })
      ]);

      this.stats.set({
        categories: categoriesRes?.totalElements || 0,
        dishes: dishesRes?.totalElements || 0,
        users: usersRes?.totalElements || 0,
        activeCategories: categoriesRes?.content.filter((c: Category) => c.active).length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async loadRecent(): Promise<void> {
    try {
      const [dishesRes, categoriesRes] = await Promise.all([
        this.apiService.getDishesAdmin({ page: 0, size: 5, sort: 'createdAt,desc' }).toPromise(),
        this.apiService.getCategoriesAdmin({ page: 0, size: 5, sort: 'createdAt,desc' }).toPromise()
      ]);

      this.recentDishes.set(dishesRes?.content || []);
      this.recentCategories.set(categoriesRes?.content || []);
    } catch (error) {
      console.error('Erro ao carregar recentes:', error);
    }
  }
}