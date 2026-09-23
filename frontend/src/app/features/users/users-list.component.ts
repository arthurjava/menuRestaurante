import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  effect,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatOptionModule } from "@angular/material/core";
import { SelectionModel } from "@angular/cdk/collections";
import { ApiService } from "@core/services/api.service";
import { NotificationService } from "@core/services/notification.service";
import { LoadingService } from "@core/services/loading.service";
import { User } from "@core/models/user.model";
import { AuthService } from "@core/services/auth.service";
import {
  TableComponent,
  ColumnDef,
  TableAction,
} from "@shared/components/table/table.component";
import {
  UserFormComponent,
  UserFormData,
} from "@shared/components/modal/user-form.component";
import { DelConfirmComponent } from "@shared/components/modal/del-confirm.component";
import { ButtonComponent } from "@shared/components/button/button.component";

interface UserWithRole extends User {
  roleLabel: string;
}

@Component({
  selector: "app-users-list",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
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
    MatOptionModule,
    TableComponent,
    UserFormComponent,
    DelConfirmComponent,
    ButtonComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-h2 font-bold text-text-primary">Usuários</h1>
          <p class="text-text-secondary mt-1">Gerencie os usuários do sistema</p>
        </div>
        <app-button
          variant="primary"
          icon="person_add"
          label="Novo Usuário"
          (clicked)="openCreateModal()"
        >
        </app-button>
      </div>

      <!-- Search & Filters -->
      <mat-card class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Buscar usuários...</mat-label>
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Buscar usuários..."
            />
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full sm:w-48">
            <mat-label>Perfil</mat-label>
            <mat-select [formControl]="roleFilterControl">
              @for (opt of roleOptions; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full sm:w-40">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilterControl">
              @for (opt of statusOptions; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button
            mat-stroked-button
            (click)="toggleFilters()"
            class="flex items-center gap-2"
          >
            <mat-icon>filter_list</mat-icon>
            Filtros
          </button>
        </div>

        @if (showFilters()) {
          <div class="mt-4 flex gap-4">
            <mat-form-field appearance="outline" class="w-full sm:w-56">
              <mat-label>Ordenar por</mat-label>
              <mat-select [formControl]="sortByControl">
                @for (opt of sortOptions; track opt.value) {
                  <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
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
        (actionClick)="onActionClick($event)"
      >
      </app-table>

      <!-- Create/Edit User Modal -->
      <app-user-form
        [isOpen]="modalOpen()"
        [title]="editingUser() ? 'Editar Usuário' : 'Novo Usuário'"
        [description]="
          editingUser()
            ? 'Atualize as informações do usuário'
            : 'Preencha os dados para criar um novo usuário'
        "
        [confirmLabel]="editingUser() ? 'Salvar alterações' : 'Criar usuário'"
        [confirmLoading]="modalLoading()"
        [roleOptions]="userRoleOptions"
        [initialData]="
          editingUser()
            ? {
                name: editingUser()!.name,
                email: editingUser()!.email,
                password: '',
                confirmPassword: '',
                role: editingUser()!.role,
                active: editingUser()!.active,
              }
            : null
        "
        [editing]="!!editingUser()"
        [size]="'md'"
        (isOpenChange)="modalOpen.set($event)"
        (confirmed)="onUserFormConfirmed($event)"
        (cancelled)="closeModal()"
      >
      </app-user-form>

      <!-- Delete Confirmation Modal -->
      <app-del-confirm
        [isOpen]="deleteModalOpen()"
        [title]="'Excluir Usuário'"
        [description]="deleteDescription()"
        [icon]="'warning'"
        [iconColor]="'text-yellow-600'"
        [confirmLabel]="'Excluir'"
        [confirmVariant]="'danger'"
        [confirmLoading]="deleteLoading()"
        [size]="'sm'"
        (isOpenChange)="deleteModalOpen.set($event)"
        (confirmed)="confirmDelete()"
        (cancelled)="closeDeleteModal()"
      >
      </app-del-confirm>

      <!-- Reset Password Modal -->
      <app-del-confirm
        [isOpen]="resetPasswordModalOpen()"
        [title]="'Redefinir Senha'"
        [description]="resetPasswordDescription()"
        [icon]="'key'"
        [iconColor]="'text-indigo-600'"
        [confirmLabel]="'Redefinir'"
        [confirmVariant]="'primary'"
        [confirmLoading]="resetPasswordLoading()"
        [size]="'sm'"
        (isOpenChange)="resetPasswordModalOpen.set($event)"
        (confirmed)="confirmResetPassword()"
        (cancelled)="closeResetPasswordModal()"
      >
        @if (newTempPassword()) {
          <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">Nova senha temporária:</p>
            <div class="flex items-center gap-2">
              <code
                class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-base"
                >{{ newTempPassword() }}</code
              >
              <button
                mat-stroked-button
                size="sm"
                (click)="copyTempPassword()"
                class="flex items-center gap-2"
              >
                <mat-icon>content_copy</mat-icon>
                Copiar
              </button>
            </div>
            <p class="text-xs text-gray-500">
              Copie e envie esta senha para o usuário. Ela deve ser alterada no
              primeiro login.
            </p>
          </div>
        }
      </app-del-confirm>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host ::ng-deep .mat-mdc-card {
        @apply shadow-card border border-border;
      }

      :host ::ng-deep .mat-mdc-form-field {
        @apply w-full;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);

  // State
  loading = signal(false);
  users = signal<UserWithRole[]>([]);
  searchControl = new FormControl("");
  roleFilterControl = new FormControl<"all" | "ADMIN" | "MANAGER" | "STAFF">(
    "all",
    { nonNullable: true },
  );
  statusFilterControl = new FormControl<"all" | "active" | "inactive">("all", {
    nonNullable: true,
  });
  sortByControl = new FormControl<"name" | "email" | "role" | "createdAt">(
    "name",
    { nonNullable: true },
  );
  showFilters = signal(false);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal("name");
  sortDirection = signal<"asc" | "desc">("asc");
  totalItems = signal(0);

  // Derived signals from FormControls
  searchTerm = signal("");
  roleFilter = signal<"all" | "ADMIN" | "MANAGER" | "STAFF">("all");
  statusFilter = signal<"all" | "active" | "inactive">("all");
  sortBy = signal<"name" | "email" | "role" | "createdAt">("name");

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

  // Table config
  columns: ColumnDef<UserWithRole>[] = [
    { key: "name", header: "Nome", sortable: true },
    { key: "email", header: "E-mail", sortable: true },
    {
      key: "roleLabel",
      header: "Perfil",
      sortable: true,
      width: "140px",
      align: "center",
    },
    {
      key: "active",
      header: "Status",
      sortable: true,
      width: "100px",
      align: "center",
      render: (u) => (u.active ? "Ativo" : "Inativo"),
    },
    {
      key: "createdAt",
      header: "Criado em",
      sortable: true,
      width: "160px",
      align: "center",
      render: (u) =>
        u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "-",
    },
  ];

  tableActions: TableAction<UserWithRole>[] = [
    {
      label: "Editar",
      icon: "edit",
      color: "primary",
      action: (user) => this.openEditModal(user),
    },
    {
      label: "Ativar/Desativar",
      icon: (user) => (user.active ? "toggle_on" : "toggle_off"),
      color: (user) => (user.active ? "secondary" : "primary"),
      action: (user) => this.toggleActive(user),
    },
    {
      label: "Redefinir Senha",
      icon: "key",
      color: "primary",
      disabled: (user) => user.id === this.authService.user()?.id,
      action: (user) => this.openResetPasswordModal(user),
    },
    {
      label: "Excluir",
      icon: "delete",
      color: "danger",
      disabled: (user) => user.id === this.authService.user()?.id,
      action: (user) => this.openDeleteModal(user),
    },
  ];

  tableConfig = {
    selectable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sorting: true,
    emptyMessage: "Nenhum usuário encontrado",
  };

  roleOptions = [
    { value: "all", label: "Todos" },
    { value: "ADMIN", label: "Administrador" },
    { value: "MANAGER", label: "Gerente" },
    { value: "STAFF", label: "Funcionário" },
  ];

  userRoleOptions = [
    { value: "ADMIN", label: "Administrador" },
    { value: "MANAGER", label: "Gerente" },
    { value: "STAFF", label: "Funcionário" },
  ];

  statusOptions = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "inactive", label: "Inativos" },
  ];

  sortOptions = [
    { value: "name", label: "Nome (A-Z)" },
    { value: "email", label: "E-mail" },
    { value: "role", label: "Perfil" },
    { value: "createdAt", label: "Data de criação" },
  ];

  filteredUsers = computed(() => {
    let filtered = this.users();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term),
      );
    }

    if (this.roleFilter() !== "all") {
      filtered = filtered.filter((user) => user.role === this.roleFilter());
    }

    if (this.statusFilter() !== "all") {
      filtered = filtered.filter(
        (user) => user.active === (this.statusFilter() === "active"),
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy()) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime();
          break;
      }
      return this.sortDirection() === "asc" ? comparison : -comparison;
    });

    return filtered;
  });

  deleteDescription = computed(() => {
    const user = this.userToDelete();
    return user
      ? `Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`
      : "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.";
  });

  resetPasswordDescription = computed(() => {
    const user = this.userToResetPassword();
    return user
      ? `Gerar nova senha temporária para "${user.name}"? A nova senha será exibida apenas uma vez.`
      : "Gerar nova senha temporária? A nova senha será exibida apenas uma vez.";
  });

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilterSubscriptions();
  }

  private setupFilterSubscriptions(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      this.searchTerm.set(value ?? "");
      this.pageIndex.set(0);
    });
    this.roleFilterControl.valueChanges.subscribe((value) => {
      this.roleFilter.set(value);
      this.pageIndex.set(0);
    });
    this.statusFilterControl.valueChanges.subscribe((value) => {
      this.statusFilter.set(value);
      this.pageIndex.set(0);
    });
    this.sortByControl.valueChanges.subscribe((value) => {
      this.sortBy.set(value);
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.apiService.listUsers().subscribe({
      next: (data: any[]) => {
        const roleLabels: Record<string, string> = {
          ADMIN: "Administrador",
          MANAGER: "Gerente",
          STAFF: "Funcionário",
        };
        this.users.set(
          data.map((item) => ({
            id: item.id,
            email: item.email,
            name: item.name,
            role: item.role,
            roleLabel: roleLabels[item.role] ?? item.role,
            active: item.active,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
        );
        this.totalItems.set(data.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
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

  onSortChange(event: { active: string; direction: "asc" | "desc" }): void {
    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction);
  }

  onActionClick(event: { action: string; row: UserWithRole }): void {
    // Handled by individual action
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(user: UserWithRole): void {
    this.editingUser.set(user);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingUser.set(null);
  }

  onUserFormConfirmed(formData: UserFormData): void {
    if (this.modalLoading()) return;

    this.modalLoading.set(true);
    const editing = this.editingUser();

    const userData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      active: formData.active,
    };

    if (formData.password) {
      userData.password = formData.password;
    }

    if (editing) {
      this.apiService.updateUser(editing.id, userData).subscribe({
        next: () => {
          this.notification.success("Usuário atualizado com sucesso!");
          this.loadUsers();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false),
      });
    } else {
      this.apiService.createUser(userData).subscribe({
        next: () => {
          this.notification.success("Usuário criado com sucesso!");
          this.loadUsers();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false),
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
        this.notification.success("Usuário excluído com sucesso!");
        this.loadUsers();
        this.closeDeleteModal();
        this.deleteLoading.set(false);
      },
      error: () => this.deleteLoading.set(false),
    });
  }

  toggleActive(user: UserWithRole): void {
    if (user.id === this.authService.user()?.id) return;

    this.apiService.toggleUserActive(user.id).subscribe({
      next: () => {
        this.notification.success(
          user.active ? "Usuário desativado" : "Usuário ativado",
        );
        this.loadUsers();
      },
      error: () => {},
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
      },
    });
  }

  copyTempPassword(): void {
    const password = this.newTempPassword();
    if (password) {
      navigator.clipboard.writeText(password);
      this.notification.success("Senha copiada para a área de transferência");
    }
  }
}
