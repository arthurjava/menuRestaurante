import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">Criar conta</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Já tem conta? <a routerLink="/login" class="font-medium text-primary-600 hover:text-primary-500">Entre</a>
          </p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <app-input
            id="name"
            label="Nome completo"
            type="text"
            placeholder="João Silva"
            [formControl]="registerForm.get('name')"
            [error]="nameError()"
            [submitted]="submitted()"
            required
          ></app-input>

          <app-input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            [formControl]="registerForm.get('email')"
            [error]="emailError()"
            [submitted]="submitted()"
            required
          ></app-input>

          <app-input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            [formControl]="registerForm.get('password')"
            [error]="passwordError()"
            [submitted]="submitted()"
            required
          ></app-input>

          <app-input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            [formControl]="registerForm.get('confirmPassword')"
            [error]="confirmPasswordError()"
            [submitted]="submitted()"
            required
          ></app-input>

          <div class="flex items-start">
            <input type="checkbox" formControlName="terms" id="terms" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5" required>
            <label for="terms" class="ml-2 text-sm text-gray-600">
              Aceito os <a href="#" class="text-primary-600 hover:text-primary-500">Termos de Uso</a> e a <a href="#" class="text-primary-600 hover:text-primary-500">Política de Privacidade</a>
            </label>
          </div>

          <app-button
            type="submit"
            variant="primary"
            fullWidth="true"
            [loading]="loading()"
          >
            Criar conta
          </app-button>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  appName = 'Restaurante Cardápio';
  registerForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator() });
  }

  nameError = computed(() => {
    const control = this.registerForm.get('name');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['minlength']) return 'Nome deve ter pelo menos 2 caracteres';
    }
    return '';
  });

  emailError = computed(() => {
    const control = this.registerForm.get('email');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'E-mail é obrigatório';
      if (control.errors['email']) return 'E-mail inválido';
    }
    return '';
  });

  passwordError = computed(() => {
    const control = this.registerForm.get('password');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Senha é obrigatória';
      if (control.errors['minlength']) return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  });

  confirmPasswordError = computed(() => {
    const control = this.registerForm.get('confirmPassword');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Confirmação de senha é obrigatória';
      if (control.errors['passwordMismatch']) return 'As senhas não coincidem';
    }
    return '';
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const { confirmPassword, terms, ...data } = this.registerForm.value;
      await this.authService.register(data).toPromise();
      this.notificationService.success('Conta criada!', 'Bem-vindo ao Restaurante Cardápio');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.notificationService.error('Erro ao cadastrar', error.error?.error || 'Erro desconhecido');
    } finally {
      this.loading.set(false);
    }
  }
}