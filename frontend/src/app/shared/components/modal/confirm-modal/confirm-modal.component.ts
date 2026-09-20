import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BaseModalComponent } from '../base-modal';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: string;
  loading?: boolean;
  baseConfig?: Partial<{
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showHeader: boolean;
    showFooter: boolean;
    closable: boolean;
    closeOnBackdrop: boolean;
    closeOnEscape: boolean;
  }>;
}

const VARIANT_CONFIG: Record<ConfirmVariant, { icon: string; iconColor: string; confirmColor: string }> = {
  danger: { icon: 'warning', iconColor: 'bg-red-100 text-red-600', confirmColor: 'btn-danger' },
  warning: { icon: 'help_outline', iconColor: 'bg-yellow-100 text-yellow-600', confirmColor: 'btn-warning' },
  info: { icon: 'info', iconColor: 'bg-blue-100 text-blue-600', confirmColor: 'btn-primary' },
};

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [BaseModalComponent, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @Input() config: ConfirmModalConfig = {
    title: 'Confirmar',
    message: 'Tem certeza que deseja realizar esta ação?',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'danger',
  };

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly variantConfig = computed(() => {
    const variant = this.config.variant ?? 'danger';
    return VARIANT_CONFIG[variant];
  });

  protected readonly configSignal = computed(() => ({
    size: this.config.baseConfig?.size ?? 'sm',
    title: this.config.title,
    description: '',
    icon: this.config.icon ?? this.variantConfig().icon,
    iconColor: this.variantConfig().iconColor,
    showHeader: this.config.baseConfig?.showHeader ?? true,
    showFooter: this.config.baseConfig?.showFooter ?? true,
    closable: this.config.baseConfig?.closable ?? true,
    closeOnBackdrop: this.config.baseConfig?.closeOnBackdrop ?? !this.config.loading,
    closeOnEscape: this.config.baseConfig?.closeOnEscape ?? !this.config.loading,
  }));

  onConfirm(): void {
    if (!this.config.loading) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.config.loading) {
      this.isOpenChange.emit(false);
      this.cancelled.emit();
    }
  }
}