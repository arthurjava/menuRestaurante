import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AuthService, LoginRequest } from "@core/services/auth.service";
import { NotificationService } from "@core/services/notification.service";
import { ButtonComponent } from "@shared/components/button/button.component";
import { InputComponent } from "@shared/components/input/input.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ButtonComponent,
    InputComponent,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12"
    >
      <mat-card class="w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-h2 font-bold text-text-primary">Entrar no Sistema</h1>
          <p class="text-text-secondary mt-2">
            Acesse sua conta para gerenciar o cardápio
          </p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <app-input
            formControlName="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            prefixIcon="email"
            [error]="emailError()"
            autocomplete="email"
          >
          </app-input>

          <app-input
            formControlName="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            prefixIcon="lock"
            [error]="passwordError()"
            autocomplete="current-password"
          >
          </app-input>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                formControlName="rememberMe"
                class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-600">Lembrar-me</span>
            </label>
            <a
              routerLink="/auth/forgot-password"
              class="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Esqueceu a senha?
            </a>
          </div>

          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [fullWidth]="true"
            [label]="loading() ? 'Entrando...' : 'Entrar'"
            [loading]="loading()"
            [disabled]="loginForm.invalid || loading()"
          >
          </app-button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Não tem uma conta?
            <a
              routerLink="/auth/register"
              class="text-indigo-600 hover:text-indigo-500 font-medium ml-1"
            >
              Cadastre-se
            </a>
          </p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-card {
        @apply shadow-card border border-border;
      }

      ::ng-deep .mat-mdc-form-field {
        @apply w-full;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  loading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  emailError = computed(() => {
    const control = this.loginForm.get("email");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "E-mail é obrigatório";
      if (control.errors["email"]) return "E-mail inválido";
    }
    return "";
  });

  passwordError = computed(() => {
    const control = this.loginForm.get("password");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Senha é obrigatória";
      if (control.errors["minlength"])
        return "Senha deve ter no mínimo 6 caracteres";
    }
    return "";
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading()) return;

    this.loading.set(true);
    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response) {
          this.notification.success("Login realizado com sucesso!");
          this.router.navigate(["/dashboard"]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
