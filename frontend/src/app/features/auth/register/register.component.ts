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
import { MatSelectModule } from "@angular/material/select";
import { AuthService, RegisterRequest } from "@core/services/auth.service";
import { NotificationService } from "@core/services/notification.service";
import { ButtonComponent } from "@shared/components/button/button.component";
import { InputComponent } from "@shared/components/input/input.component";
import { SelectComponent } from "@shared/components/select/select.component";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12"
    >
      <mat-card class="w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-h2 font-bold text-text-primary">Criar Conta</h1>
          <p class="text-text-secondary mt-2">
            Cadastre-se para acessar o sistema
          </p>
        </div>

        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
          class="space-y-5"
        >
          <app-input
            formControlName="name"
            label="Nome completo"
            type="text"
            placeholder="João Silva"
            prefixIcon="person"
            [error]="nameError()"
            autocomplete="name"
          >
          </app-input>

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
            autocomplete="new-password"
          >
          </app-input>

          <app-input
            formControlName="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            prefixIcon="lock_outline"
            [error]="confirmPasswordError()"
            autocomplete="new-password"
          >
          </app-input>

          <div>
            <label class="label">Perfil</label>
            <app-select
              formControlName="role"
              [options]="roleOptions"
              placeholder="Selecione o perfil"
              [error]="roleError()"
              prefixIcon="badge"
            >
            </app-select>
          </div>

          <div class="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              formControlName="terms"
              class="w-4 h-4 mt-0.5 text-brand-primary rounded border-border focus:ring-brand-primary/40"
            />
            <label for="terms" class="text-body-sm text-text-secondary">
              Aceito os
              <a href="#" class="text-brand-primary hover:underline"
                >Termos de Uso</a
              >
              e a
              <a href="#" class="text-brand-primary hover:underline"
                >Política de Privacidade</a
              >
            </label>
          </div>

          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [fullWidth]="true"
            [label]="loading() ? 'Criando conta...' : 'Criar conta'"
            [loading]="loading()"
            [disabled]="registerForm.invalid || loading()"
          >
          </app-button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-text-secondary">
            Já tem uma conta?
            <a
              routerLink="/auth/login"
              class="text-brand-primary hover:text-brand-primary-hover font-medium ml-1"
            >
              Entrar
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

      ::ng-deep .mat-mdc-select {
        @apply w-full;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  loading = signal(false);

  roleOptions = [
    { value: "STAFF", label: "Funcionário" },
    { value: "MANAGER", label: "Gerente" },
    { value: "ADMIN", label: "Administrador" },
  ];

  registerForm: FormGroup = this.fb.group(
    {
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
        ],
      ],
      confirmPassword: ["", [Validators.required]],
      role: ["STAFF", [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(
    form: FormGroup,
  ): { passwordMismatch: boolean } | null {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  nameError = computed(() => {
    const control = this.registerForm.get("name");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Nome é obrigatório";
      if (control.errors["minlength"])
        return "Nome deve ter no mínimo 2 caracteres";
      if (control.errors["maxlength"])
        return "Nome deve ter no máximo 100 caracteres";
    }
    return "";
  });

  emailError = computed(() => {
    const control = this.registerForm.get("email");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "E-mail é obrigatório";
      if (control.errors["email"]) return "E-mail inválido";
    }
    return "";
  });

  passwordError = computed(() => {
    const control = this.registerForm.get("password");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Senha é obrigatória";
      if (control.errors["minlength"])
        return "Senha deve ter no mínimo 6 caracteres";
      if (control.errors["maxlength"])
        return "Senha deve ter no máximo 50 caracteres";
    }
    return "";
  });

  confirmPasswordError = computed(() => {
    const control = this.registerForm.get("confirmPassword");
    const formErrors = this.registerForm.errors;
    if (control?.touched && control?.errors) {
      if (control.errors["required"])
        return "Confirmação de senha é obrigatória";
    }
    if (control?.touched && formErrors?.["passwordMismatch"]) {
      return "As senhas não coincidem";
    }
    return "";
  });

  roleError = computed(() => {
    const control = this.registerForm.get("role");
    if (control?.touched && control?.errors?.["required"]) {
      return "Selecione um perfil";
    }
    return "";
  });

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading()) return;

    this.loading.set(true);
    const data: RegisterRequest = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
    };

    this.authService.register(data).subscribe({
      next: (response) => {
        if (response) {
          this.notification.success("Conta criada com sucesso!");
          this.router.navigate(["/auth/login"]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
