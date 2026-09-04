import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { User } from '../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TableComponent, TableColumn, TableAction } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent, InputComponent, TableComponent, ModalComponent, BadgeComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Usuários</h1>
          <p class="page-subtitle">Gerencie os usuários do sistema</p>
        </div>
        <app-button variant="primary" routerLink="/users/new">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Novo Usuário
        </app-button>
      </div>

      <div class="card">
        <div class="p-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <app-input
                id="search"
                placeholder="Buscar usuários..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
              ></app-input>
            </div>
          </div>
        </div>

        <app-table
          [data]="users()"
          [columns]="columns"
          [actions]="actions"
          [pagination]="pagination()"
          [trackByFn]="trackById"
          [emptyMessage]="'Nenhum usuário encontrado'"
          (pageChange)="onPageChange($event)"
          (sort)="onSort($event)"
        ></app-table>
      </div>
    </div>

    <app-modal
      [isOpen]="deleteModalOpen()"
      title="Excluir usuário"
      (close)="deleteModalOpen.set(false)"
    >
      <p class="text-gray-600">Tem certeza que deseja excluir o usuário <strong>{{ userToDelete()?.name }}</strong> (<strong>{{ userToDelete()?.email }}</strong>)? Esta ação não pode ser desfeita.</p>
      <div slot="footer" class="flex justify-end gap-3">
        <app-button variant="secondary" (click)="deleteModalOpen.set(false)">Cancelar</app-button>
        <app-button variant="danger" (click)="confirmDelete()" [loading]="deleting()">Excluir</app-button>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="toggleActiveModalOpen()"
      title="{{ userToToggleActive()?.active ? 'Desativar' : 'Ativar' }} usuário"
      (close)="toggleActiveModalOpen.set(false)"
    >
      <p class="text-gray-600">Tem certeza que deseja {{ userToToggleActive()?.active ? 'desativar' : 'ativar' }} o usuário <strong>{{ userToToggleActive()?.name }}</strong>?</p>
      <div slot="footer" class="flex justify-end gap-3">
        <app-button variant="secondary" (click)="toggleActiveModalOpen.set(false)">Cancelar</app-button>
        <app-button variant="primary" (click)="confirmToggleActive()" [loading]="togglingActive()">{{ userToToggleActive()?.active ? 'Desativar' : 'Ativar' }}</app-button>
      </div>
    </app-modal>
  `
})
export class UserListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  loadingService = inject(LoadingService);

  users = signal<User[]>([]);
  pagination = signal({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  searchTerm = '';
  sortKey = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  deleteModalOpen = signal(false);
  userToDelete = signal<User | null>(null);
  deleting = signal(false);

  toggleActiveModalOpen = signal(false);
  userToToggleActive = signal<User | null>(null);
  togglingActive = signal(false);

  columns: TableColumn<User>[] = [
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'email', header: 'E-mail', sortable: true },
    { key: 'role', header: 'Perfil', sortable: true, render: (user) => `<app-badge [variant]="getRoleVariant(user.role)">{{ getRoleLabel(user.role) }}</app-badge>` },
    { key: 'active', header: 'Status', render: (user) => user.active ? '<app-badge variant="success">Ativo</app-badge>' : '<app-badge variant="gray">Inativo</app-badge>' },
    { key: 'createdAt', header: 'Criado em', sortable: true, render: (user) => new Date(user.createdAt).toLocaleDateString('pt-BR') }
  ];

  actions: TableAction<User>[] = [
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
      handler: (user) => window.location.href = `/users/${user.id}/edit`
    },
    {
      label: 'Ativar/Desativar',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      handler: (user) => this.openToggleActiveModal(user),
      class: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Excluir',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      handler: (user) => this.openDeleteModal(user),
      class: 'text-red-600 hover:text-red-900'
    }
  ];

  trackById = (index: number, item: User) => item.id;

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      STAFF: 'Equipe'
    };
    return labels[role] || role;
  }

  getRoleVariant(role: string): BadgeVariant {
    const variants: Record<string, BadgeVariant> = {
      ADMIN: 'danger',
      MANAGER: 'warning',
      STAFF: 'info'
    };
    return variants[role] || 'gray';
  }

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      const res = await this.apiService.getUsers({
        page: this.pagination().page,
        size: this.pagination().size,
        sort: `${this.sortKey},${this.sortDirection}`
      }).toPromise();

      this.users.set(res?.content || []);
      this.pagination.update(p => ({
        ...p,
        totalElements: res?.totalElements || 0,
        totalPages: res?.totalPages || 0
      }));
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar os usuários');
    }
  }

  onSearchChange(): void {
    this.pagination.update(p => ({ ...p, page: 0 }));
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadUsers();
  }

  onSort(event: { key: string; direction: 'asc' | 'desc' }): void {
    this.sortKey = event.key;
    this.sortDirection = event.direction;
    this.loadUsers();
  }

  openDeleteModal(user: User): void {
    this.userToDelete.set(user);
    this.deleteModalOpen.set(true);
  }

  async confirmDelete(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;

    this.deleting.set(true);
    try {
      await this.apiService.deleteUser(user.id).toPromise();
      this.notificationService.success('Sucesso', 'Usuário excluído');
      this.deleteModalOpen.set(false);
      this.loadUsers();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível excluir o usuário');
    } finally {
      this.deleting.set(false);
    }
  }

  openToggleActiveModal(user: User): void {
    this.userToToggleActive.set(user);
    this.toggleActiveModalOpen.set(true);
  }

  async confirmToggleActive(): Promise<void> {
    const user = this.userToToggleActive();
    if (!user) return;

    this.togglingActive.set(true);
    try {
      await this.apiService.toggleUserActive(user.id).toPromise();
      this.notificationService.success('Sucesso', `Usuário ${user.active ? 'desativado' : 'ativado'}`);
      this.toggleActiveModalOpen.set(false);
      this.loadUsers();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível alterar o status');
    } finally {
      this.togglingActive.set(false);
    }
  }
}