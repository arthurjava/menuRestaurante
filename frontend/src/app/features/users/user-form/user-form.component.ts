import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { User, UserRequest } from '../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, SelectComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">{{ isEditing() ? 'Editar' : 'Novo' }} Usuário</h1>
          <p class="page-subtitle">{{ isEditing() ? 'Atualize as informações do usuário' : 'Crie um novo usuário para o sistema' }}</p>
        </div>
        <app-button variant="secondary" routerLink="/users">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar
        </app-button>
      </div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="card p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <app-input
              id="name"
              label="Nome completo"
              placeholder="João Silva"
              [formControl]="userForm.get('name')"
              [error]="nameError()"
              [submitted]="submitted()"
              required
            ></app-input>
          </div>

          <div>
            <app-input
              id="email"
              label="E-mail"
              type="email"
              placeholder="joao@email.com"
              [formControl]="userForm.get('email')"
              [error]="emailError()"
              [submitted]="submitted()"
              required
            ></app-input>
          </div>

          @if (!isEditing()) {
            <div>
              <app-input
                id="password"
                label="Senha"
                type="password"
                placeholder="••••••••"
                [formControl]="userForm.get('password')"
                [error]="passwordError()"
                [submitted]="submitted()"
                required
              ></app-input>
            </div>

            <div>
              <app-input
                id="confirmPassword"
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                [formControl]="userForm.get('confirmPassword')"
                [error]="confirmPasswordError()"
                [submitted]="submitted()"
                required
              ></app-input>
            </div>
          } @else {
            <div>
              <app-input
                id="password"
                label="Nova senha (deixe em branco para não alterar)"
                type="password"
                placeholder="••••••••"
                [formControl]="userForm.get('password')"
                [error]="passwordError()"
                [submitted]="submitted()"
              ></app-input>
            </div>

            <div>
              <app-input
                id="confirmPassword"
                label="Confirmar nova senha"
                type="password"
                placeholder="••••••••"
                [formControl]="userForm.get('confirmPassword')"
                [error]="confirmPasswordError()"
                [submitted]="submitted()"
              ></app-input>
            </div>
          }

          <div>
            <app-select
              id="role"
              label="Perfil de acesso"
              placeholder="Selecione o perfil"
              [options]="roleOptions"
              [formControl]="userForm.get('role')"
              [error]="roleError()"
              [submitted]="submitted()"
              required
            ></app-select>
          </div>
        </div>

        @if (isEditing()) {
          <div class="flex items-center gap-4 pt-4 border-t border-gray-200">
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" formControlName="active" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
              <span class="ml-2 text-sm text-gray-700">Usuário ativo</span>
            </label>
          </div>
        }

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <app-button type="button" variant="secondary" routerLink="/users">Cancelar</app-button>
          <app-button type="submit" variant="primary" [loading]="loading()">
            {{ isEditing() ? 'Atualizar' : 'Criar' }} Usuário
          </app-button>
        </div>
      </form>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  loadingService = inject(LoadingService);

  userId = signal<string | null>(null);
  isEditing = computed(() => !!this.userId());
  loading = signal(false);
  submitted = signal(false);

  roleOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'STAFF', label: 'Equipe' }
  ];

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
    role: ['STAFF', [Validators.required]],
    active: [true]
  }, { validators: passwordMatchValidator() });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      await this.loadUser(id);
    }
  }

  async loadUser(id: string): Promise<void> {
    try {
      const user = await this.apiService.getUser(id).toPromise();
      if (user) {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active
        });
      }
      // Remove password validators for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar o usuário');
      this.router.navigate(['/users']);
    }
  }

  nameError = computed(() => {
    const control = this.userForm.get('name');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['minlength']) return 'Nome deve ter pelo menos 2 caracteres';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  emailError = computed(() => {
    const control = this.userForm.get('email');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'E-mail é obrigatório';
      if (control.errors['email']) return 'E-mail inválido';
    }
    return '';
  });

  passwordError = computed(() => {
    const control = this.userForm.get('password');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['minlength']) return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  });

  confirmPasswordError = computed(() => {
    const control = this.userForm.get('confirmPassword');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required'] && !this.isEditing()) return 'Confirmação de senha é obrigatória';
      if (control.errors['passwordMismatch']) return 'As senhas não coincidem';
    }
    return '';
  });

  roleError = computed(() => {
    const control = this.userForm.get('role');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Perfil é obrigatório';
    }
    return '';
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const { confirmPassword, ...data } = this.userForm.value;
      const userData: UserRequest = {
        name: data.name,
        email: data.email,
        password: data.password || undefined,
        role: data.role
      };

      if (this.isEditing()) {
        await this.apiService.updateUser(this.userId()!, userData).toPromise();
        this.notificationService.success('Sucesso', 'Usuário atualizado');
      } else {
        await this.apiService.createUser(userData).toPromise();
        this.notificationService.success('Sucesso', 'Usuário criado');
      }

      this.router.navigate(['/users']);
    } catch (error: any) {
      this.notificationService.error('Erro', error.error?.error || 'Não foi possível salvar o usuário');
    } finally {
      this.loading.set(false);
    }
  }
}