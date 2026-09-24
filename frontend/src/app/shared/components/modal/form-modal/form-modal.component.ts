import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { BaseModalComponent } from "../base-modal";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

export interface FormModalConfig<T = any> {
  formBuilder: () => FormGroup;
  initialData?: T;
  confirmLabel: string;
  confirmLoading?: boolean;
  validateOnSubmit?: (form: FormGroup) => boolean;
  baseConfig?: Partial<{
    size: "sm" | "md" | "lg" | "xl" | "full";
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    showHeader: boolean;
    showFooter: boolean;
    closable: boolean;
    closeOnBackdrop: boolean;
    closeOnEscape: boolean;
  }>;
}

@Component({
  selector: "app-form-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseModalComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./form-modal.component.html",
  styleUrl: "./form-modal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormModalComponent<T = any> implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @Input() config: FormModalConfig<T> = {
    formBuilder: () => inject(FormBuilder).group({}),
    confirmLabel: "Salvar",
  };

  @Output() confirmed = new EventEmitter<T>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() headerActions = new EventEmitter<void>();
  @Output() footerActions = new EventEmitter<void>();

  readonly form = signal<FormGroup | null>(null);
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.form.set(null);
  }

  private initializeForm(): void {
    const form = this.config.formBuilder();
    this.form.set(form);

    if (this.config.initialData) {
      form.patchValue(this.config.initialData);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    const currentForm = this.form();

    if (!currentForm) return;

    const isValid = this.config.validateOnSubmit
      ? this.config.validateOnSubmit(currentForm)
      : currentForm.valid;

    if (!isValid) {
      this.markAllAsTouched(currentForm);
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.confirmed.emit(currentForm.getRawValue() as T);
    }, 0);
  }

  onCancel(): void {
    this.isOpenChange.emit(false);
    this.cancelled.emit();
  }

  onBackdropClose(): void {
    if (!this.isSubmitting()) {
      this.onCancel();
    }
  }

  private markAllAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  protected readonly configSignal = computed(() => ({
    size: this.config.baseConfig?.size ?? "md",
    title: this.config.baseConfig?.title ?? "",
    description: this.config.baseConfig?.description ?? "",
    icon: this.config.baseConfig?.icon ?? "",
    iconColor: this.config.baseConfig?.iconColor ?? "",
    showHeader: this.config.baseConfig?.showHeader ?? true,
    showFooter: this.config.baseConfig?.showFooter ?? true,
    closable: this.config.baseConfig?.closable ?? true,
    closeOnBackdrop:
      this.config.baseConfig?.closeOnBackdrop ?? !this.isSubmitting(),
    closeOnEscape:
      this.config.baseConfig?.closeOnEscape ?? !this.isSubmitting(),
  }));

  protected readonly confirmLoading = computed(
    () => this.config.confirmLoading ?? this.isSubmitting(),
  );
}
