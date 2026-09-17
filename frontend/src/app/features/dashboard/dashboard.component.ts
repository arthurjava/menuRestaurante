import { Component, signal, computed, inject, OnInit, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface DashboardStats {
  totalCategories: number;
  totalDishes: number;
  activeDishes: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'category_created' | 'dish_created' | 'dish_updated' | 'user_created' | 'image_uploaded';
  description: string;
  timestamp: string;
  userName: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    ButtonComponent,
    BadgeComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-1">Visão geral do sistema</p>
        </div>
        <div class="flex gap-3">
          <app-button
            variant="primary"
            icon="add"
            label="Novo Prato"
            (clicked)="navigateTo('/dishes/new')">
          </app-button>
        </div>
      </div>

      <!-- Stats Grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (item of statCards; track item.label) {
            <mat-card class="animate-pulse">
              <mat-card-content class="h-24"></mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (stat of stats(); track stat.label) {
            <mat-card class="stat-card">
              <mat-card-content class="flex items-center gap-4 p-6">
                <div [class]="stat.iconBg" class="p-3 rounded-xl">
                  <mat-icon [class]="stat.iconColor">{{ stat.icon }}</mat-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                  @if (stat.change !== undefined) {
                    <p class="text-xs" [class]="stat.change >= 0 ? 'text-green-600' : 'text-red-600'">
                      <mat-icon class="inline align-middle text-xs">{{ stat.change >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                      {{ Math.abs(stat.change) }}%
                    </p>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      <!-- Quick Actions & Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <mat-card class="lg:col-span-1">
          <mat-card-header>
            <mat-card-title class="text-lg font-semibold">Ações Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content class="space-y-3">
            <app-button
              variant="outline"
              fullWidth
              icon="restaurant_menu"
              label="Gerenciar Categorias"
              (clicked)="navigateTo('/categories')">
            </app-button>
            <app-button
              variant="outline"
              fullWidth
              icon="restaurant"
              label="Gerenciar Pratos"
              (clicked)="navigateTo('/dishes')">
            </app-button>
            <app-button
              variant="outline"
              fullWidth
              icon="people"
              label="Gerenciar Usuários"
              (clicked)="navigateTo('/users')">
            </app-button>
            <app-button
              variant="outline"
              fullWidth
              icon="settings"
              label="Configurações"
              (clicked)="navigateTo('/settings')">
            </app-button>
            <app-button
              variant="outline"
              fullWidth
              icon="menu_book"
              label="Ver Cardápio Público"
              (clicked)="navigateTo('/menu')">
            </app-button>
          </mat-card-content>
        </mat-card>

        <!-- Recent Activity -->
        <mat-card class="lg:col-span-2">
          <mat-card-header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <mat-card-title class="text-lg font-semibold">Atividade Recente</mat-card-title>
            <app-button
              variant="ghost"
              size="sm"
              label="Ver tudo"
              (clicked)="navigateTo('/activity')">
            </app-button>
          </mat-card-header>
          <mat-card-content>
            @if (activity().length === 0) {
              <div class="text-center py-8 text-gray-500">
                <mat-icon class="text-3xl mb-2">history</mat-icon>
                <p>Nenhuma atividade recente</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (item of activity(); track item.id) {
                  <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div [class]="getActivityIconBg(item.type)" class="p-2 rounded-lg flex-shrink-0">
                      <mat-icon [class]="getActivityIconColor(item.type)" class="text-sm">
                        {{ getActivityIcon(item.type) }}
                      </mat-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900">{{ item.description }}</p>
                      <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <mat-icon class="text-[10px]">person</mat-icon>
                        {{ item.userName }}
                        <span class="mx-1">•</span>
                        <mat-icon class="text-[10px]">access_time</mat-icon>
                        {{ formatTime(item.timestamp) }}
                      </p>
                    </div>
                    <app-badge
                      [label]="getActivityLabel(item.type)"
                      [variant]="getActivityVariant(item.type)"
                      size="sm">
                    </app-badge>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      @apply border border-gray-100 hover:shadow-md transition-shadow;
    }

    .animate-pulse {
      @apply bg-gray-100;
    }

    :host ::ng-deep .mat-mdc-card {
      @apply shadow-sm border border-gray-100;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  loading = signal(true);
  statsData = signal<DashboardStats | null>(null);

  stats = computed(() => {
    const data = this.statsData();
    if (!data) return this.statCards;

    return [
      {
        label: 'Categorias',
        value: data.totalCategories,
        icon: 'category',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        change: 5
      },
      {
        label: 'Total de Pratos',
        value: data.totalDishes,
        icon: 'restaurant',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        change: 12
      },
      {
        label: 'Pratos Ativos',
        value: data.activeDishes,
        icon: 'check_circle',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        change: 8
      },
      {
        label: 'Usuários',
        value: data.totalUsers,
        icon: 'people',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        change: -2
      }
    ];
  });

  activity = computed(() => this.statsData()?.recentActivity ?? []);

  statCards = [
    { label: 'Categorias', value: 0, icon: 'category', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Total de Pratos', value: 0, icon: 'restaurant', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Pratos Ativos', value: 0, icon: 'check_circle', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { label: 'Usuários', value: 0, icon: 'people', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' }
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    
    // Simulate loading stats (replace with actual API calls)
    setTimeout(() => {
      this.statsData.set({
        totalCategories: 8,
        totalDishes: 45,
        activeDishes: 38,
        totalUsers: 12,
        recentActivity: [
          {
            id: '1',
            type: 'dish_created',
            description: 'Novo prato "Salmão Grelhado" adicionado à categoria "Pratos Principais"',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            userName: 'João Silva'
          },
          {
            id: '2',
            type: 'category_created',
            description: 'Categoria "Sobremesas" criada',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            userName: 'Maria Santos'
          },
          {
            id: '3',
            type: 'image_uploaded',
            description: '3 imagens enviadas para o prato "Risoto de Camarão"',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            userName: 'João Silva'
          },
          {
            id: '4',
            type: 'user_created',
            description: 'Novo usuário "Carlos Oliveira" cadastrado como Gerente',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            userName: 'Admin'
          }
        ]
      });
      this.loading.set(false);
    }, 500);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'category_created': return 'category';
      case 'dish_created': return 'add_circle';
      case 'dish_updated': return 'edit';
      case 'user_created': return 'person_add';
      case 'image_uploaded': return 'photo';
      default: return 'info';
    }
  }

  getActivityIconBg(type: string): string {
    switch (type) {
      case 'category_created': return 'bg-blue-100';
      case 'dish_created': return 'bg-green-100';
      case 'dish_updated': return 'bg-indigo-100';
      case 'user_created': return 'bg-purple-100';
      case 'image_uploaded': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  }

  getActivityIconColor(type: string): string {
    switch (type) {
      case 'category_created': return 'text-blue-600';
      case 'dish_created': return 'text-green-600';
      case 'dish_updated': return 'text-indigo-600';
      case 'user_created': return 'text-purple-600';
      case 'image_uploaded': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  getActivityLabel(type: string): string {
    switch (type) {
      case 'category_created': return 'Categoria';
      case 'dish_created': return 'Prato criado';
      case 'dish_updated': return 'Prato atualizado';
      case 'user_created': return 'Usuário';
      case 'image_uploaded': return 'Imagem';
      default: return 'Atividade';
    }
  }

  getActivityVariant(type: string): 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary' | 'secondary' {
    switch (type) {
      case 'category_created': return 'primary';
      case 'dish_created': return 'success';
      case 'dish_updated': return 'info';
      case 'user_created': return 'secondary';
      case 'image_uploaded': return 'warning';
      default: return 'gray';
    }
  }
}