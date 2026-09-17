import { Component, signal, computed, inject, OnInit, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { User } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { TableComponent, ColumnDef, TableAction } from '@shared/components/table/table.component';

interface UserWithRole extends User {
  roleLabel: string;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    BadgeComponent,
    ModalComponent,
    TableComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Usuários</h1>
          <p class="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
        </div>
        <app-button
          variant="primary"
          icon="person_add"
          label="Novo Usuário"
          (clicked)="openCreateModal()">
        </app-button>
      </div>

      <!-- Search & Filters -->
      <mat-card class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <app-input
            placeholder="Buscar usuários..."
            prefixIcon="search"
            [value]="searchTerm()"
            (valueChange)="onSearch($event)"
            class="flex-1">
          </app-input>

          <app-select
            [options]="roleOptions"
            placeholder="Perfil"
            [value]="roleFilter()"
            (valueChange)="onRoleFilterChange($event)"
            class="w-full sm:w-48">
          </app-select>

          <app-select
            [options]="statusOptions"
            placeholder="Status"
            [value]="statusFilter()"
            (valueChange)="onStatusFilterChange($event)"
            class="w-full sm:w-40">
          </app-select>

          <app-button
            variant="outline"
            icon="filter_list"
            label="Filtros"
            (clicked)="toggleFilters()">
          </app-button>
        </div>

        @if (showFilters()) {
          <div class="mt-4 flex gap-4">
            <app-select
              [options]="sortOptions"
              placeholder="Ordenar por"
              [value]="sortBy()"
              (valueChange)="onSortByChange($event)"
              class="w-full sm:w-56">
            </app-select>
          </div>
        }
      </mat-card>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="filteredUsers()"
        [actions]="tableActions"
        [config]="tableConfig"
        [loading]="loading()"
        [totalItems]="totalItems()"
        [pageIndex]="pageIndex()"
        [pageSize]="pageSize()"
        [sortActive]="sortActive()"
        [sortDirection]="sortDirection()"
        (rowClick)="onRowClick($event)"
        (selectionChange)="onSelectionChange($event)"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (actionClick)="onActionClick($event)">
      </app-table>

      <!-- Create/Edit Modal -->
      <app-modal
        [isOpen]="modalOpen()"
        [title]="editingUser() ? 'Editar Usuário' : 'Novo Usuário'"
        [description]="editingUser() ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'"
        [confirmLabel]="editingUser() ? 'Salvar alterações' : 'Criar usuário'"
        [confirmLoading]="modalLoading()"
        [size]="'md'"
        (isOpenChange)="closeModal()"
        (confirmed)="saveUser()"
        (cancelled)="closeModal()">
        <form [formGroup]="userForm" class="space-y-4">
          <app-input
            formControlName="name"
            label="Nome completo"
            type="text"
            placeholder="João Silva"
            [error]="nameError()">
          </app-input>

          <app-input
            formControlName="email"
            label="E-mail"
            type="email"
            placeholder="joao@email.com"
            [error]="emailError()">
          </app-input>

          @if (!editingUser()) {
            <app-input
              formControlName="password"
              label="Senha"
              type="password"
              placeholder="••••••••"
              [error]="passwordError()">
            </app-input>

            <app-input
              formControlName="confirmPassword"
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              [error]="confirmPasswordError()">
            </app-input>
          } @else {
            <div class="text-sm text-gray-500">
              Deixe a senha em branco para manter a atual
            </div>
            <app-input
              formControlName="password"
              label="Nova senha (opcional)"
              type="password"
              placeholder="••••••••"
              [error]="passwordError()">
            </app-input>

            <app-input
              formControlName="confirmPassword"
              label="Confirmar nova senha"
              type="password"
              placeholder="••••••••"
              [error]="confirmPasswordError()">
            </app-input>
          }

          <app-select
            formControlName="role"
            label="Perfil"
            [options]="userRoleOptions"
            placeholder="Selecione o perfil"
            [error]="roleError()">
          </app-select>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer flex-1">
              <input type="checkbox" formControlName="active" class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
              <span class="text-sm text-gray-600">Usuário ativo</span>
            </label>
          </div>
        </form>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="deleteModalOpen()"
        title="Excluir Usuário"
        [description]="'Tem certeza que deseja excluir o usuário \"' + userToDelete()?.name + '\"? Esta ação não pode ser desfeita.'"
        icon="warning"
        iconColor="text-yellow-600"
        confirmLabel="Excluir"
        confirmVariant="danger"
        [confirmLoading]="deleteLoading()"
        size="sm"
        (isOpenChange)="closeDeleteModal()"
        (confirmed)="confirmDelete()"
        (cancelled)="closeDeleteModal()">
      </app-modal>

      <!-- Reset Password Modal -->
      <app-modal
        [isOpen]="resetPasswordModalOpen()"
        title="Redefinir Senha"
        [description]="'Gerar nova senha temporária para \"' + userToResetPassword()?.name + '\"? A nova senha será exibida apenas uma vez.'"
        icon="key"
        iconColor="text-indigo-600"
        confirmLabel="Redefinir"
        confirmVariant="primary"
        [confirmLoading]="resetPasswordLoading()"
        size="sm"
        (isOpenChange)="closeResetPasswordModal()"
        (confirmed)="confirmResetPassword()"
        (cancelled)="closeResetPasswordModal()">
        @if (newTempPassword()) {
          <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">Nova senha temporária:</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-base">{{ newTempPassword() }}</code>
              <app-button
                variant="secondary"
                size="sm"
                icon="content_copy"
                label="Copiar"
                (clicked)="copyTempPassword()">
              </app-button>
            </div>
            <p class="text-xs text-gray-500">Copie e envie esta senha para o usuário. Ela deve ser alterada no primeiro login.</p>
          </div>
        }
      </app-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .mat-mdc-card {
      @apply shadow-sm border border-gray-100;
    }

    :host ::ng-deep .mat-mdc-form-field {
      @apply w-full;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // State
  loading = signal(false);
  users = signal<UserWithRole[]>([]);
  searchTerm = signal('');
  roleFilter = signal<'all' | 'ADMIN' | 'MANAGER' | 'STAFF'>('all');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  showFilters = signal(false);
  sortBy = signal<'name' | 'email' | 'role' | 'createdAt'>('name');
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  totalItems = signal(0);

  // Modal state
  modalOpen = signal(false);
  modalLoading = signal(false);
  editingUser = signal<UserWithRole | null>(null);

  // Delete modal
  deleteModalOpen = signal(false);
  deleteLoading = signal(false);
  userToDelete = signal<UserWithRole | null>(null);

  // Reset password modal
  resetPasswordModalOpen = signal(false);
  resetPasswordLoading = signal(false);
  userToResetPassword = signal<UserWithRole | null>(null);
  newTempPassword = signal<string | null>(null);

  // Form
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(50)]],
    confirmPassword: [''],
    role: ['STAFF', [Validators.required]],
    active: [true]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (!password && !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Table config
  columns: ColumnDef<UserWithRole>[] = [
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'email', header: 'E-mail', sortable: true },
    { key: 'roleLabel', header: 'Perfil', sortable: true, width: '140px', align: 'center' },
    { key: 'active', header: 'Status', sortable: true, width: '100px', align: 'center', render: (u) => u.active ? 'Ativo' : 'Inativo' },
    { key: 'createdAt', header: 'Criado em', sortable: true, width: '160px', align: 'center', render: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-' }
  ];

  tableActions: TableAction<UserWithRole>[] = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      action: (user) => this.openEditModal(user)
    },
    {
      label: 'Ativar/Desativar',
      icon: (user) => user.active ? 'toggle_on' : 'toggle_off',
      color: (user) => user.active ? 'secondary' : 'primary',
      action: (user) => this.toggleActive(user)
    },
    {
      label: 'Redefinir Senha',
      icon: 'key',
      color: 'primary',
      disabled: (user) => user.id === this.authService.user()?.id,
      action: (user) => this.openResetPasswordModal(user)
    },
    {
      label: 'Excluir',
      icon: 'delete',
      color: 'danger',
      disabled: (user) => user.id === this.authService.user()?.id,
      action: (user) => this.openDeleteModal(user)
    }
  ];

  tableConfig = {
    selectable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sorting: true,
    emptyMessage: 'Nenhum usuário encontrado'
  };

  roleOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'STAFF', label: 'Funcionário' }
  ];

  userRoleOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'STAFF', label: 'Funcionário' }
  ];

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' }
  ];

  sortOptions = [
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'email', label: 'E-mail' },
    { value: 'role', label: 'Perfil' },
    { value: 'createdAt', label: 'Data de criação' }
  ];

  filteredUsers = computed(() => {
    let filtered = this.users();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter() !== 'all') {
      filtered = filtered.filter(user => user.role === this.roleFilter());
    }

    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(user => user.active === (this.statusFilter() === 'active'));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
          break;
      }
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.apiService.listUsers().subscribe({
      next: (data: any[]) => {
        const roleLabels: Record<string, string> = {
          ADMIN: 'Administrador',
          MANAGER: 'Gerente',
          STAFF: 'Funcionário'
        };
        this.users.set(data.map(item => ({
          id: item.id,
          email: item.email,
          name: item.name,
          role: item.role,
          roleLabel: roleLabels[item.role] ?? item.role,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })));
        this.totalItems.set(data.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  onRoleFilterChange(value: string): void {
    this.roleFilter.set(value as any);
    this.pageIndex.set(0);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as any);
    this.pageIndex.set(0);
  }

  onSortByChange(value: string): void {
    this.sortBy.set(value as any);
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  onRowClick(user: UserWithRole): void {
    this.openEditModal(user);
  }

  onSelectionChange(selection: UserWithRole[]): void {
    // Handle bulk actions
  }

  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(event: { active: string; direction: 'asc' | 'desc' }): void {
    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction);
  }

  onActionClick(event: { action: string; row: UserWithRole }): void {
    // Handled by individual action
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.userForm.reset({ name: '', email: '', password: '', confirmPassword: '', role: 'STAFF', active: true });
    this.modalOpen.set(true);
  }

  openEditModal(user: UserWithRole): void {
    this.editingUser.set(user);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      active: user.active
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingUser.set(null);
    this.userForm.reset({ name: '', email: '', password: '', confirmPassword: '', role: 'STAFF', active: true });
  }

  saveUser(): void {
    if (this.userForm.invalid || this.modalLoading()) return;

    this.modalLoading.set(true);
    const formValue = this.userForm.value;
    const editing = this.editingUser();

    const userData: any = {
      name: formValue.name,
      email: formValue.email,
      role: formValue.role,
      active: formValue.active
    };

    if (formValue.password) {
      userData.password = formValue.password;
    }

    if (editing) {
      this.apiService.updateUser(editing.id, userData).subscribe({
        next: () => {
          this.notification.success('Usuário atualizado com sucesso!');
          this.loadUsers();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false)
      });
    } else {
      this.apiService.createUser(userData).subscribe({
        next: () => {
          this.notification.success('Usuário criado com sucesso!');
          this.loadUsers();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false)
      });
    }
  }

  openDeleteModal(user: UserWithRole): void {
    if (user.id === this.authService.user()?.id) return;
    this.userToDelete.set(user);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user || this.deleteLoading()) return;

    this.deleteLoading.set(true);
    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        this.notification.success('Usuário excluído com sucesso!');
        this.loadUsers();
        this.closeDeleteModal();
        this.deleteLoading.set(false);
      },
      error: () => this.deleteLoading.set(false)
    });
  }

  toggleActive(user: UserWithRole): void {
    if (user.id === this.authService.user()?.id) return;
    
    this.apiService.toggleUserActive(user.id).subscribe({
      next: () => {
        this.notification.success(user.active ? 'Usuário desativado' : 'Usuário ativado');
        this.loadUsers();
      },
      error: () => {}
    });
  }

  openResetPasswordModal(user: UserWithRole): void {
    if (user.id === this.authService.user()?.id) return;
    this.userToResetPassword.set(user);
    this.newTempPassword.set(null);
    this.resetPasswordModalOpen.set(true);
  }

  closeResetPasswordModal(): void {
    this.resetPasswordModalOpen.set(false);
    this.userToResetPassword.set(null);
    this.newTempPassword.set(null);
  }

  confirmResetPassword(): void {
    const user = this.userToResetPassword();
    if (!user || this.resetPasswordLoading()) return;

    this.resetPasswordLoading.set(true);
    this.apiService.resetPassword(user.id).subscribe({
      next: (response: { tempPassword: string }) => {
        this.newTempPassword.set(response.tempPassword);
        this.resetPasswordLoading.set(false);
      },
      error: () => {
        this.resetPasswordLoading.set(false);
      }
    });
  }

  copyTempPassword(): void {
    const password = this.newTempPassword();
    if (password) {
      navigator.clipboard.writeText(password);
      this.notification.success('Senha copiada para a área de transferência');
    }
  }

  // Validation helpers
  nameError = computed(() => {
    const control = this.userForm.get('name');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['minlength']) return 'Nome deve ter no mínimo 2 caracteres';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  emailError = computed(() => {
    const control = this.userForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'E-mail é obrigatório';
      if (control.errors['email']) return 'E-mail inválido';
    }
    return '';
  });

  passwordError = computed(() => {
    const control = this.userForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['minlength']) return 'Senha deve ter no mínimo 6 caracteres';
      if (control.errors['maxlength']) return 'Senha deve ter no máximo 50 caracteres';
    }
    return '';
  });

  confirmPasswordError = computed(() => {
    const formErrors = this.userForm.errors;
    const control = this.userForm.get('confirmPassword');
    if (control?.touched && formErrors?.['passwordMismatch']) {
      return 'As senhas não coincidem';
    }
    return '';
  });

  roleError = computed(() => {
    const control = this.userForm.get('role');
    if (control?.touched && control?.errors?.['required']) {
      return 'Perfil é obrigatório';
    }
    return '';
  });
}