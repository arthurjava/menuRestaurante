import { Component, input, output, computed, effect, signal, inject, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div
      class="fixed inset-0 z-50 overflow-y-auto"
      [style.display]="isOpen() ? 'block' : 'none'">
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          (click)="onBackdropClick()"
          [@fadeIn]>
        </div>

        <!-- Modal Container -->
        <div
          class="relative w-full bg-white rounded-xl shadow-xl transform transition-all"
          [class]="modalSizeClass()"
          [@slideUp]
          (@slideUp.done)="onAnimationDone($event)">
        
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
            <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
          </div>
          <button
            type="button"
            class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            (click)="close()"
            aria-label="Fechar modal">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form [formGroup]="form" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nome completo</mat-label>
              <input matInput formControlName="name" placeholder="João Silva" maxlength="100">
              @if (form.get('name')?.touched && form.get('name')?.errors) {
                <mat-error>
                  @if (form.get('name')?.errors?.['required']) { Nome é obrigatório }
                  @if (form.get('name')?.errors?.['minlength']) { Nome deve ter no mínimo 2 caracteres }
                  @if (form.get('name')?.errors?.['maxlength']) { Nome deve ter no máximo 100 caracteres }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>E-mail</mat-label>
              <input matInput formControlName="email" type="email" placeholder="joao@email.com">
              @if (form.get('email')?.touched && form.get('email')?.errors) {
                <mat-error>
                  @if (form.get('email')?.errors?.['required']) { E-mail é obrigatório }
                  @if (form.get('email')?.errors?.['email']) { E-mail inválido }
                </mat-error>
              }
            </mat-form-field>

            @if (!editing()) {
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Senha</mat-label>
                <input matInput formControlName="password" type="password" placeholder="••••••••" minlength="6" maxlength="50">
                @if (form.get('password')?.touched && form.get('password')?.errors) {
                  <mat-error>
                    @if (form.get('password')?.errors?.['minlength']) { Senha deve ter no mínimo 6 caracteres }
                    @if (form.get('password')?.errors?.['maxlength']) { Senha deve ter no máximo 50 caracteres }
                  </mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Confirmar senha</mat-label>
                <input matInput formControlName="confirmPassword" type="password" placeholder="••••••••">
                @if (form.get('confirmPassword')?.touched && form.errors?.['passwordMismatch']) {
                  <mat-error>As senhas não coincidem</mat-error>
                }
              </mat-form-field>
            } @else {
              <div class="text-sm text-gray-500 mb-2">
                Deixe a senha em branco para manter a atual
              </div>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nova senha (opcional)</mat-label>
                <input matInput formControlName="password" type="password" placeholder="••••••••" minlength="6" maxlength="50">
                @if (form.get('password')?.touched && form.get('password')?.errors) {
                  <mat-error>
                    @if (form.get('password')?.errors?.['minlength']) { Senha deve ter no mínimo 6 caracteres }
                    @if (form.get('password')?.errors?.['maxlength']) { Senha deve ter no máximo 50 caracteres }
                  </mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Confirmar nova senha</mat-label>
                <input matInput formControlName="confirmPassword" type="password" placeholder="••••••••">
                @if (form.get('confirmPassword')?.touched && form.errors?.['passwordMismatch']) {
                  <mat-error>As senhas não coincidem</mat-error>
                }
              </mat-form-field>
            }

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Perfil</mat-label>
              <mat-select formControlName="role" [compareWith]="compareByValue">
                @for (opt of roleOptions(); track opt.value) {
                  <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                }
              </mat-select>
              @if (form.get('role')?.touched && form.get('role')?.errors?.['required']) {
                <mat-error>Perfil é obrigatório</mat-error>
              }
            </mat-form-field>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer flex-1">
                <mat-slide-toggle formControlName="active"></mat-slide-toggle>
                <span class="text-sm text-gray-600">Usuário ativo</span>
              </label>
            </div>
          </form>
        </div>

        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            mat-stroked-button
            class="text-gray-600 hover:text-gray-900"
            (click)="cancel()">
            Cancelar
          </button>
          <button
            type="button"
            mat-flat-button
            color="primary"
            [disabled]="form.invalid || confirmLoading()"
            (click)="onSubmit()">
            @if (confirmLoading()) {
              <mat-spinner diameter="20" class="mr-2"></mat-spinner>
            }
            {{ confirmLabel() }}
          </button>
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

    .modal-sm { @apply max-w-sm; }
    .modal-md { @apply max-w-md; }
    .modal-lg { @apply max-w-lg; }
    .modal-xl { @apply max-w-xl; }
    .modal-full { @apply max-w-4xl; }

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

    :host ::ng-deep .mat-mdc-form-field {
      @apply w-full;
    }
  `],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  title = input<string>('Novo Usuário');
  description = input<string>('Preencha os dados para criar um novo usuário');
  confirmLabel = input<string>('Criar usuário');
  confirmLoading = input<boolean>(false);
  roleOptions = input<RoleOption[]>([
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'STAFF', label: 'Funcionário' }
  ]);
  initialData = input<UserFormData | null>(null);
  editing = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  confirmed = output<UserFormData>();
  cancelled = output<void>();

  private _wasOpen = signal(false);
  private fb = inject(FormBuilder);

  form = this.fb.group({
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

  modalSizeClass = computed(() => {
    const sizes = {
      sm: 'modal-sm',
      md: 'modal-md',
      lg: 'modal-lg',
      xl: 'modal-xl',
      full: 'modal-full'
    };
    return sizes[this.size()];
  });

  compareByValue = (a: string, b: string) => a === b;

  passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (!password && !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open !== this._wasOpen()) {
        this._wasOpen.set(open);
        this.isOpenChange.emit(open);
      }
    });

    effect(() => {
      const data = this.initialData();
      if (data && this.isOpen()) {
        this.form.patchValue(data);
      } else if (!data && this.isOpen()) {
        this.form.reset({ name: '', email: '', password: '', confirmPassword: '', role: 'STAFF', active: true });
      }
    });
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.isOpenChange.emit(false);
    this.cancelled.emit();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  onSubmit(): void {
    if (this.form.invalid || this.confirmLoading()) return;
    this.confirmed.emit(this.form.value as UserFormData);
  }

  onAnimationDone(event: any): void {
    // Animation callback if needed
  }
}