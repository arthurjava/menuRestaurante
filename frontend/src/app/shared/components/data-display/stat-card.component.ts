import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type StatCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface StatCardAction {
  label: string;
  icon?: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() variant: StatCardVariant = 'default';
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() trendValue = '';
  @Input() trendLabel = '';
  @Input() description = '';
  @Input() actions: StatCardAction[] = [];
  @Input() loading = false;
  @Input() clickable = false;
  @Input() href = '';

  readonly variantClasses = computed(() => ({
    default: 'bg-white border-gray-100',
    primary: 'bg-primary-50 border-primary-100',
    success: 'bg-success-50 border-success-100',
    warning: 'bg-warning-50 border-warning-100',
    danger: 'bg-danger-50 border-danger-100',
    info: 'bg-info-50 border-info-100',
  }));

  readonly iconColorClasses = computed(() => ({
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
    info: 'bg-info-100 text-info-600',
  }));

  readonly trendIcon = computed(() => {
    switch (this.trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'remove';
    }
  });

  readonly trendColorClass = computed(() => {
    switch (this.trend) {
      case 'up': return 'text-success-600';
      case 'down': return 'text-danger-600';
      default: return 'text-gray-500';
    }
  });

  getBorderColor(variant: StatCardVariant): string {
    const borders: Record<StatCardVariant, string> = {
      default: 'border-gray-100',
      primary: 'border-primary-100',
      success: 'border-success-100',
      warning: 'border-warning-100',
      danger: 'border-danger-100',
      info: 'border-info-100',
    };
    return borders[variant];
  }

  getActionButtonClass(variant: string): string {
    const variants: Record<string, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
    };
    return `btn-sm ${variants[variant] || 'btn-outline'}`;
  }
}