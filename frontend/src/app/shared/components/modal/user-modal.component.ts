import { Component, input, output, signal, effect, computed, ChangeDetectionStrategy, HostBinding, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  active: boolean;
}

export interface RoleOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ButtonComponent, InputComponent, SelectComponent],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" @fadeIn>
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          (click)="onBackdropClick()">
        </div>

        <!-- Modal Container -->
        <div
          class="relative w-full max-w-md bg-white rounded-xl shadow-xl transform transition-all"
          @slideUp>
          
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-indigo-600">person</mat-icon>
                <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
              </div>
              <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              (click)="cancel()"
              aria-label="Fechar modal">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="form" class="p-4 space-y-4" (ngSubmit)="onSubmit()">
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

            @if (!editing()) {
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
              [options]="roleOptions()"
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

          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <app-button
              variant="secondary"
              label="Cancelar"
              (clicked)="cancel()">
            </app-button>
            <app-button
              variant="primary"
              [label]="confirmLabel()"
              [loading]="confirmLoading()"
              [disabled]="form.invalid || confirmLoading()"
              type="submit"
              (clicked)="onSubmit()">
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host(.hidden) {
      display: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .fade-in { animation: fadeIn 0.2s ease-out; }
    .slide-up { animation: slideUp 0.2s ease-out; }
  `],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserModalComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();

  // Content
  title = input<string>('Novo Usuário');
  description = input<string>('Preencha os dados para criar um novo usuário');
  confirmLabel = input<string>('Criar usuário');
  confirmLoading = input<boolean>(false);

  // Data
  roleOptions = input<RoleOption[]>([
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'STAFF', label: 'Funcionário' }
  ]);
  editing = input<boolean>(false);

  // Events
  confirmed = output<UserFormData>();
  cancelled = output<void>();
  closed = output<void>();

  private fb = inject(FormBuilder);
  private _wasOpen = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(50)]],
    confirmPassword: [''],
    role: ['STAFF', [Validators.required]],
    active: [true]
  }, { validators: this.passwordMatchValidator });

  @HostBinding('class.hidden')
  get isHidden(): boolean {
    return !this.isOpen();
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open !== this._wasOpen()) {
        this._wasOpen.set(open);
        this.isOpenChange.emit(open);
      }
    });
  }

  onBackdropClick(): void {
    this.cancel();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  close(): void {
    this.isOpenChange.emit(false);
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.confirmLoading()) return;
    this.confirmed.emit(this.form.value as UserFormData);
  }

  passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (!password && !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  nameError = computed(() => {
    const control = this.form.get('name');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['minlength']) return 'Nome deve ter no mínimo 2 caracteres';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  emailError = computed(() => {
    const control = this.form.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'E-mail é obrigatório';
      if (control.errors['email']) return 'E-mail inválido';
    }
    return '';
  });

  passwordError = computed(() => {
    const control = this.form.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['minlength']) return 'Senha deve ter no mínimo 6 caracteres';
      if (control.errors['maxlength']) return 'Senha deve ter no máximo 50 caracteres';
    }
    return '';
  });

  confirmPasswordError = computed(() => {
    const formErrors = this.form.errors;
    const control = this.form.get('confirmPassword');
    if (control?.touched && formErrors?.['passwordMismatch']) {
      return 'As senhas não coincidem';
    }
    return '';
  });

  roleError = computed(() => {
    const control = this.form.get('role');
    if (control?.touched && control?.errors?.['required']) {
      return 'Perfil é obrigatório';
    }
    return '';
  });
}