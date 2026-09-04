import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
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
          <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">Entrar no {{ appName }}</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ou <a routerLink="/register" class="font-medium text-primary-600 hover:text-primary-500">crie uma conta</a>
          </p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <app-input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            [formControl]="loginForm.get('email')"
            [error]="emailError()"
            [submitted]="submitted()"
            required
          ></app-input>

          <app-input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            [formControl]="loginForm.get('password')"
            [error]="passwordError()"
            [submitted]="submitted()"
            required
          ></app-input>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" formControlName="rememberMe" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
              <span class="ml-2 text-sm text-gray-600">Lembrar-me</span>
            </label>
            <a routerLink="/forgot-password" class="text-sm text-primary-600 hover:text-primary-500">Esqueci a senha</a>
          </div>

          <app-button
            type="submit"
            variant="primary"
            fullWidth="true"
            [loading]="loading()"
          >
            Entrar
          </app-button>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Não tem conta?
            <a routerLink="/register" class="font-medium text-primary-600 hover:text-primary-500 ml-1">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  appName = 'Restaurante Cardápio';
  loginForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  emailError = computed(() => {
    const control = this.loginForm.get('email');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'E-mail é obrigatório';
      if (control.errors['email']) return 'E-mail inválido';
    }
    return '';
  });

  passwordError = computed(() => {
    const control = this.loginForm.get('password');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Senha é obrigatória';
      if (control.errors['minlength']) return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      await this.authService.login(this.loginForm.value).toPromise();
      this.notificationService.success('Bem-vindo!', `Olá, ${this.authService.user()?.name}`);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.notificationService.error('Erro ao entrar', error.error?.error || 'Credenciais inválidas');
    } finally {
      this.loading.set(false);
    }
  }
}