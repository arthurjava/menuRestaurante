import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type StatusVariant = 'active' | 'inactive' | 'pending' | 'draft' | 'archived' | 'success' | 'warning' | 'danger' | 'info' | 'default';

export interface StatusConfig {
  label: string;
  class: string;
  icon?: string;
  dotColor?: string;
}

const STATUS_CONFIGS: Record<StatusVariant, StatusConfig> = {
  active: { label: 'Ativo', class: 'badge-success', icon: 'check_circle', dotColor: '#16a34a' },
  inactive: { label: 'Inativo', class: 'badge-gray', icon: 'cancel', dotColor: '#9ca3af' },
  pending: { label: 'Pendente', class: 'badge-warning', icon: 'schedule', dotColor: '#ca8a04' },
  draft: { label: 'Rascunho', class: 'badge-gray', icon: 'edit', dotColor: '#6b7280' },
  archived: { label: 'Arquivado', class: 'badge-gray', icon: 'archive', dotColor: '#9ca3af' },
  success: { label: 'Sucesso', class: 'badge-success', icon: 'check_circle', dotColor: '#16a34a' },
  warning: { label: 'Atenção', class: 'badge-warning', icon: 'warning', dotColor: '#ca8a04' },
  danger: { label: 'Erro', class: 'badge-danger', icon: 'error', dotColor: '#dc2626' },
  info: { label: 'Info', class: 'badge-info', icon: 'info', dotColor: '#2563eb' },
  default: { label: '', class: 'badge-gray', dotColor: '#6b7280' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() status: StatusVariant = 'default';
  @Input() customLabel = '';
  @Input() showIcon = true;
  @Input() showDot = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() clickable = false;
  @Input() tooltip = '';

  readonly config = computed(() => STATUS_CONFIGS[this.status]);
  readonly effectiveLabel = computed(() => this.customLabel || this.config().label);

  protected readonly sizeClasses = computed(() => ({
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }));

  protected readonly iconSizeClasses = computed(() => ({
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }));

  protected readonly dotSizeClasses = computed(() => ({
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }));
}