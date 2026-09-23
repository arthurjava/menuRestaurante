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
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ApiService } from "@core/services/api.service";
import { NotificationService } from "@core/services/notification.service";
import { LoadingService } from "@core/services/loading.service";
import { AuthService } from "@core/services/auth.service";
import {
  ImageUploadService,
  UploadedImage,
} from "@core/services/image-upload.service";
import { ButtonComponent } from "@shared/components/button/button.component";
import { InputComponent } from "@shared/components/input/input.component";
import { SelectComponent } from "@shared/components/select/select.component";
import { ImageUploadComponent } from "@shared/components/image-upload/image-upload.component";

interface BusinessHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

interface ProfileData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    ImageUploadComponent,
  ],
  template: `
<div class="p-6 space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-h2 font-bold text-text-primary">Configurações</h1>
          <p class="text-text-secondary mt-1">Gerencie as configurações do restaurante</p>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms" class="w-full">
        <!-- Restaurant Info Tab -->
        <mat-tab label="Informações do Restaurante">
          <div class="p-6 space-y-6">
            <form [formGroup]="restaurantForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-input
                  formControlName="name"
                  label="Nome do Restaurante *"
                  type="text"
                  placeholder="Nome do restaurante"
                  [error]="restaurantNameError()"
                >
                </app-input>

                <app-input
                  formControlName="tagline"
                  label="Slogan"
                  type="text"
                  placeholder="Ex: O melhor da culinária"
                  [error]="taglineError()"
                >
                </app-input>
              </div>

              <div>
                <label class="label">Descrição</label>
                <textarea
                  formControlName="description"
                  class="input min-h-[100px] resize-y"
                  placeholder="Descreva seu restaurante, história, especialidades..."
                  [attr.aria-describedby]="
                    descriptionError() ? 'desc-error' : null
                  "
                ></textarea>
                @if (descriptionError()) {
                  <p id="desc-error" class="text-sm text-red-600 mt-1">
                    {{ descriptionError() }}
                  </p>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="label">Logo</label>
                  <app-image-upload
                    [maxFiles]="1"
                    [maxFileSizeMB]="2"
                    [existingImages]="getLogoExistingImages()"
                    (imagesChange)="onLogoChange($event)"
                    (uploadComplete)="onLogoUploadComplete($event)"
                    (uploadError)="onImageError($event)"
                  >
                  </app-image-upload>
                </div>

                <div>
                  <label class="label">Imagem de Capa (Banner)</label>
                  <app-image-upload
                    [maxFiles]="1"
                    [maxFileSizeMB]="5"
                    [existingImages]="getCoverExistingImages()"
                    (imagesChange)="onCoverChange($event)"
                    (uploadComplete)="onCoverUploadComplete($event)"
                    (uploadError)="onImageError($event)"
                  >
                  </app-image-upload>
                </div>
              </div>

              <div class="flex gap-3 pt-4 border-t border-gray-100">
                <app-button
                  variant="primary"
                  [label]="
                    savingRestaurantInfo()
                      ? 'Salvando...'
                      : 'Salvar Informações'
                  "
                  [loading]="savingRestaurantInfo()"
                  (clicked)="saveRestaurantInfo()"
                >
                </app-button>
                <app-button
                  variant="secondary"
                  label="Cancelar"
                  (clicked)="loadRestaurantInfo()"
                >
                </app-button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Business Hours Tab -->
        <mat-tab label="Horário de Funcionamento">
          <div class="p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Horários de Atendimento</h2>
              <app-button
                variant="outline"
                icon="add"
                label="Adicionar Horário"
                (clicked)="addBusinessHour()"
              >
              </app-button>
            </div>

            <form [formGroup]="businessHoursForm" class="space-y-4">
              <div class="space-y-3" formArrayName="hours">
                @for (
                  hour of businessHoursControls.controls;
                  track $index;
                  let i = $index
                ) {
                  <div
                    class="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg"
                    [formGroup]="hour"
                  >
                    <app-select
                      formControlName="dayOfWeek"
                      [options]="dayOptions"
                      placeholder="Dia da semana"
                      class="w-full sm:w-40"
                      [error]="dayError(i)"
                    >
                    </app-select>

                    <div class="flex-1 flex items-center gap-3">
                      <mat-slide-toggle formControlName="closed" class="mr-2">
                        <span class="text-sm text-gray-600">Fechado</span>
                      </mat-slide-toggle>

                      <div
                        class="flex-1 flex items-center gap-2"
                        [class.opacity-50]="hour.get('closed')?.value"
                      >
                        <label class="text-sm text-gray-600 whitespace-nowrap"
                          >Abre:</label
                        >
                        <input
                          type="time"
                          formControlName="openTime"
                          class="input w-32"
                          [disabled]="hour.get('closed')?.value"
                        />
                        <label class="text-sm text-gray-600 whitespace-nowrap"
                          >Fecha:</label
                        >
                        <input
                          type="time"
                          formControlName="closeTime"
                          class="input w-32"
                          [disabled]="hour.get('closed')?.value"
                        />
                      </div>
                    </div>

                    <app-button
                      variant="ghost"
                      size="sm"
                      color="red"
                      icon="delete"
                      label="Remover"
                      (clicked)="removeBusinessHour(i)"
                    >
                    </app-button>
                  </div>
                }
              </div>

              <div class="flex gap-3 pt-4 border-t border-gray-100">
                <app-button
                  variant="primary"
                  [label]="
                    savingBusinessHours() ? 'Salvando...' : 'Salvar Horários'
                  "
                  [loading]="savingBusinessHours()"
                  (clicked)="saveBusinessHours()"
                >
                </app-button>
                <app-button
                  variant="secondary"
                  label="Cancelar"
                  (clicked)="loadBusinessHours()"
                >
                </app-button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Contact Info Tab -->
        <mat-tab label="Informações de Contato">
          <div class="p-6 space-y-6">
            <form [formGroup]="contactForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-input
                  formControlName="phone"
                  label="Telefone *"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  [error]="phoneError()"
                >
                </app-input>

                <app-input
                  formControlName="email"
                  label="E-mail *"
                  type="email"
                  placeholder="contato@restaurante.com"
                  [error]="contactEmailError()"
                >
                </app-input>
              </div>

              <app-input
                formControlName="address"
                label="Endereço"
                type="text"
                placeholder="Rua, número, bairro, cidade, estado"
                [error]="addressError()"
              >
              </app-input>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-input
                  formControlName="website"
                  label="Site"
                  type="url"
                  placeholder="https://www.restaurante.com"
                  prefixIcon="language"
                  [error]="websiteError()"
                >
                </app-input>

                <div class="flex gap-4">
                  <app-input
                    formControlName="instagram"
                    label="Instagram"
                    type="text"
                    placeholder="@restaurante"
                    prefixIcon="camera_alt"
                    class="flex-1"
                  >
                  </app-input>
                  <app-input
                    formControlName="facebook"
                    label="Facebook"
                    type="text"
                    placeholder="facebook.com/restaurante"
                    prefixIcon="facebook"
                    class="flex-1"
                  >
                  </app-input>
                </div>
              </div>

              <div class="flex gap-3 pt-4 border-t border-gray-100">
                <app-button
                  variant="primary"
                  [label]="
                    savingContactInfo() ? 'Salvando...' : 'Salvar Contato'
                  "
                  [loading]="savingContactInfo()"
                  (clicked)="saveContactInfo()"
                >
                </app-button>
                <app-button
                  variant="secondary"
                  label="Cancelar"
                  (clicked)="loadContactInfo()"
                >
                </app-button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Profile Tab -->
        <mat-tab label="Meu Perfil">
          <div class="p-6 space-y-6 max-w-2xl">
            <form [formGroup]="profileForm" class="space-y-6">
              <div class="flex items-center gap-6">
                <div class="relative">
                  @if (profileAvatar()) {
                    <img
                      [src]="profileAvatar()"
                      alt="Avatar"
                      class="h-24 w-24 rounded-full object-cover"
                    />
                  } @else {
                    <div
                      class="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center"
                    >
                      <mat-icon class="text-indigo-600 text-3xl"
                        >person</mat-icon
                      >
                    </div>
                  }
                  <app-image-upload
                    [maxFiles]="1"
                    [maxFileSizeMB]="2"
                    [existingImages]="getAvatarExistingImages()"
                    (imagesChange)="onAvatarChange($event)"
                    (uploadComplete)="onAvatarUploadComplete($event)"
                    (uploadError)="onImageError($event)"
                  >
                  </app-image-upload>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold">Foto do Perfil</h3>
                  <p class="text-gray-500">JPG, PNG ou WebP. Máximo 2MB.</p>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-input
                  formControlName="name"
                  label="Nome *"
                  type="text"
                  placeholder="Seu nome"
                  [error]="profileNameError()"
                >
                </app-input>

                <app-input
                  formControlName="email"
                  label="E-mail *"
                  type="email"
                  placeholder="seu@email.com"
                  [error]="profileEmailError()"
                >
                </app-input>
              </div>

              <mat-divider></mat-divider>

              <h3 class="text-lg font-semibold">Alterar Senha</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <app-input
                  formControlName="currentPassword"
                  label="Senha Atual"
                  type="password"
                  placeholder="••••••••"
                  [error]="currentPasswordError()"
                >
                </app-input>

                <app-input
                  formControlName="newPassword"
                  label="Nova Senha"
                  type="password"
                  placeholder="••••••••"
                  [error]="newPasswordError()"
                >
                </app-input>

                <app-input
                  formControlName="confirmPassword"
                  label="Confirmar Nova Senha"
                  type="password"
                  placeholder="••••••••"
                  [error]="confirmPasswordError()"
                >
                </app-input>
              </div>

              <div class="flex gap-3 pt-4 border-t border-gray-100">
                <app-button
                  variant="primary"
                  [label]="savingProfile() ? 'Salvando...' : 'Salvar Perfil'"
                  [loading]="savingProfile()"
                  (clicked)="saveProfile()"
                >
                </app-button>
                <app-button
                  variant="secondary"
                  label="Cancelar"
                  (clicked)="loadProfile()"
                >
                </app-button>
              </div>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host ::ng-deep .mat-mdc-tab-group {
        @apply w-full;
      }

      :host ::ng-deep .mat-mdc-form-field {
        @apply w-full;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);
  private imageUploadService = inject(ImageUploadService);
  private fb = inject(FormBuilder);

  // State
  savingRestaurantInfo = signal(false);
  savingBusinessHours = signal(false);
  savingContactInfo = signal(false);
  savingProfile = signal(false);

  restaurantLogo = signal<string | null>(null);
  restaurantCover = signal<string | null>(null);
  profileAvatar = signal<string | null>(null);

  // Forms
  restaurantForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(100)]],
    tagline: ["", [Validators.maxLength(200)]],
    description: ["", [Validators.maxLength(1000)]],
  });

  businessHoursForm: FormGroup = this.fb.group({
    hours: this.fb.array([]),
  });

  contactForm: FormGroup = this.fb.group({
    phone: ["", [Validators.required, Validators.maxLength(20)]],
    email: ["", [Validators.required, Validators.email]],
    address: ["", [Validators.maxLength(200)]],
    website: ["", [Validators.maxLength(100)]],
    instagram: ["", [Validators.maxLength(50)]],
    facebook: ["", [Validators.maxLength(100)]],
  });

  profileForm: FormGroup = this.fb.group(
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
      currentPassword: [""],
      newPassword: ["", [Validators.minLength(6), Validators.maxLength(50)]],
      confirmPassword: [""],
    },
    { validators: this.passwordMatchValidator },
  );

  get businessHoursControls() {
    return this.businessHoursForm.get("hours") as any;
  }

  ngOnInit(): void {
    this.loadAllSettings();
    this.initializeBusinessHours();
  }

  loadAllSettings(): void {
    this.loadRestaurantInfo();
    this.loadBusinessHours();
    this.loadContactInfo();
    this.loadProfile();
  }

  initializeBusinessHours(): void {
    // Add default rows for each day
    DAYS_OF_WEEK.forEach((day) => {
      this.addBusinessHour(day.value);
    });
  }

  loadRestaurantInfo(): void {
    this.apiService.getRestaurantInfo().subscribe({
      next: (info: any) => {
        this.restaurantForm.patchValue({
          name: info.name ?? "",
          tagline: info.tagline ?? "",
          description: info.description ?? "",
        });
        this.restaurantLogo.set(info.logoUrl ?? null);
        this.restaurantCover.set(info.coverUrl ?? null);
      },
      error: () => {},
    });
  }

  loadBusinessHours(): void {
    this.apiService.getBusinessHours().subscribe({
      next: (hours: any[]) => {
        // Clear existing
        while (this.businessHoursControls.length) {
          this.businessHoursControls.removeAt(0);
        }
        // Add loaded hours
        hours.forEach((h) => {
          const group = this.fb.group({
            id: [h.id],
            dayOfWeek: [h.dayOfWeek, Validators.required],
            openTime: [h.openTime ?? "09:00"],
            closeTime: [h.closeTime ?? "22:00"],
            closed: [h.closed ?? false],
          });
          this.businessHoursControls.push(group);
        });
      },
      error: () => {
        // Reinitialize defaults
        this.initializeBusinessHours();
      },
    });
  }

  loadContactInfo(): void {
    this.apiService.getContactInfo().subscribe({
      next: (contact: any) => {
        this.contactForm.patchValue({
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          address: contact.address ?? "",
          website: contact.website ?? "",
          instagram: contact.instagram ?? "",
          facebook: contact.facebook ?? "",
        });
      },
      error: () => {},
    });
  }

  loadProfile(): void {
    const user = this.authService.user();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }
    this.apiService.getProfile().subscribe({
      next: (profile: any) => {
        this.profileAvatar.set(profile.avatarUrl ?? null);
      },
      error: () => {},
    });
  }

  // Restaurant Info
  saveRestaurantInfo(): void {
    if (this.restaurantForm.invalid || this.savingRestaurantInfo()) return;
    this.savingRestaurantInfo.set(true);

    this.apiService.updateRestaurantInfo(this.restaurantForm.value).subscribe({
      next: () => {
        this.notification.success("Informações do restaurante salvas!");
        this.savingRestaurantInfo.set(false);
      },
      error: () => this.savingRestaurantInfo.set(false),
    });
  }

  // Business Hours
  addBusinessHour(dayOfWeek?: number): void {
    const group = this.fb.group({
      dayOfWeek: [dayOfWeek ?? 0, Validators.required],
      openTime: ["09:00"],
      closeTime: ["22:00"],
      closed: [false],
    });
    this.businessHoursControls.push(group);
  }

  removeBusinessHour(index: number): void {
    this.businessHoursControls.removeAt(index);
  }

  dayError(index: number): string {
    const control = this.businessHoursControls.at(index)?.get("dayOfWeek");
    if (control?.touched && control?.errors?.["required"]) {
      return "Dia é obrigatório";
    }
    return "";
  }

  saveBusinessHours(): void {
    if (this.businessHoursForm.invalid || this.savingBusinessHours()) return;
    this.savingBusinessHours.set(true);

    const hours = this.businessHoursControls.value.map((h: any) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.closed ? null : h.openTime,
      closeTime: h.closed ? null : h.closeTime,
      closed: h.closed,
    }));

    this.apiService.updateBusinessHours(hours).subscribe({
      next: () => {
        this.notification.success("Horários salvos com sucesso!");
        this.savingBusinessHours.set(false);
      },
      error: () => this.savingBusinessHours.set(false),
    });
  }

  // Contact Info
  saveContactInfo(): void {
    if (this.contactForm.invalid || this.savingContactInfo()) return;
    this.savingContactInfo.set(true);

    this.apiService.updateContactInfo(this.contactForm.value).subscribe({
      next: () => {
        this.notification.success("Informações de contato salvas!");
        this.savingContactInfo.set(false);
      },
      error: () => this.savingContactInfo.set(false),
    });
  }

  // Profile
  saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) return;
    this.savingProfile.set(true);

    const formValue = this.profileForm.value;
    const profileData: any = {
      name: formValue.name,
      email: formValue.email,
    };

    if (formValue.currentPassword && formValue.newPassword) {
      profileData.currentPassword = formValue.currentPassword;
      profileData.newPassword = formValue.newPassword;
    }

    this.apiService.updateProfile(profileData).subscribe({
      next: () => {
        this.notification.success("Perfil atualizado com sucesso!");
        this.profileForm.patchValue({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        this.savingProfile.set(false);
      },
      error: () => this.savingProfile.set(false),
    });
  }

  // Image Upload Handlers
  onLogoChange(images: any[]): void {}
  onLogoUploadComplete(images: UploadedImage[]): void {
    if (images[0]) this.restaurantLogo.set(images[0].url);
  }

  onCoverChange(images: any[]): void {}
  onCoverUploadComplete(images: UploadedImage[]): void {
    if (images[0]) this.restaurantCover.set(images[0].url);
  }

  onAvatarChange(images: any[]): void {}
  onAvatarUploadComplete(images: UploadedImage[]): void {
    if (images[0]) this.profileAvatar.set(images[0].url);
  }

  onImageError(error: string): void {
    this.notification.error(error);
  }

  // Validation Helpers
  passwordMatchValidator(
    form: FormGroup,
  ): { passwordMismatch: boolean } | null {
    const newPassword = form.get("newPassword")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    if (!newPassword && !confirmPassword) return null;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  restaurantNameError = computed(() => {
    const control = this.restaurantForm.get("name");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Nome é obrigatório";
      if (control.errors["maxlength"])
        return "Nome deve ter no máximo 100 caracteres";
    }
    return "";
  });

  taglineError = computed(() => {
    const control = this.restaurantForm.get("tagline");
    if (control?.touched && control?.errors?.["maxlength"]) {
      return "Slogan deve ter no máximo 200 caracteres";
    }
    return "";
  });

  descriptionError = computed(() => {
    const control = this.restaurantForm.get("description");
    if (control?.touched && control?.errors?.["maxlength"]) {
      return "Descrição deve ter no máximo 1000 caracteres";
    }
    return "";
  });

  phoneError = computed(() => {
    const control = this.contactForm.get("phone");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Telefone é obrigatório";
      if (control.errors["maxlength"])
        return "Telefone deve ter no máximo 20 caracteres";
    }
    return "";
  });

  contactEmailError = computed(() => {
    const control = this.contactForm.get("email");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "E-mail é obrigatório";
      if (control.errors["email"]) return "E-mail inválido";
    }
    return "";
  });

  addressError = computed(() => {
    const control = this.contactForm.get("address");
    if (control?.touched && control?.errors?.["maxlength"]) {
      return "Endereço deve ter no máximo 200 caracteres";
    }
    return "";
  });

  websiteError = computed(() => {
    const control = this.contactForm.get("website");
    if (control?.touched && control?.errors?.["maxlength"]) {
      return "URL deve ter no máximo 100 caracteres";
    }
    return "";
  });

  profileNameError = computed(() => {
    const control = this.profileForm.get("name");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Nome é obrigatório";
      if (control.errors["minlength"])
        return "Nome deve ter no mínimo 2 caracteres";
      if (control.errors["maxlength"])
        return "Nome deve ter no máximo 100 caracteres";
    }
    return "";
  });

  profileEmailError = computed(() => {
    const control = this.profileForm.get("email");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "E-mail é obrigatório";
      if (control.errors["email"]) return "E-mail inválido";
    }
    return "";
  });

  currentPasswordError = computed(() => {
    const control = this.profileForm.get("currentPassword");
    const newPassword = this.profileForm.get("newPassword")?.value;
    if (newPassword && control?.touched && control?.errors?.["required"]) {
      return "Senha atual é obrigatória para alterar a senha";
    }
    return "";
  });

  newPasswordError = computed(() => {
    const control = this.profileForm.get("newPassword");
    if (control?.touched && control?.errors) {
      if (control.errors["minlength"])
        return "Nova senha deve ter no mínimo 6 caracteres";
      if (control.errors["maxlength"])
        return "Nova senha deve ter no máximo 50 caracteres";
    }
    return "";
  });

  confirmPasswordError = computed(() => {
    const formErrors = this.profileForm.errors;
    const control = this.profileForm.get("confirmPassword");
    if (control?.touched && formErrors?.["passwordMismatch"]) {
      return "As senhas não coincidem";
    }
    return "";
  });

  dayOptions = DAYS_OF_WEEK.map((d) => ({ value: d.value, label: d.label }));

  getLogoExistingImages(): UploadedImage[] {
    const logo = this.restaurantLogo();
    return logo
      ? [
          {
            id: "logo",
            url: logo,
            filename: "logo",
            displayOrder: 0,
            isMain: true,
          },
        ]
      : [];
  }

  getCoverExistingImages(): UploadedImage[] {
    const cover = this.restaurantCover();
    return cover
      ? [
          {
            id: "cover",
            url: cover,
            filename: "cover",
            displayOrder: 0,
            isMain: true,
          },
        ]
      : [];
  }

  getAvatarExistingImages(): UploadedImage[] {
    const avatar = this.profileAvatar();
    return avatar
      ? [
          {
            id: "avatar",
            url: avatar,
            filename: "avatar",
            displayOrder: 0,
            isMain: true,
          },
        ]
      : [];
  }
}
