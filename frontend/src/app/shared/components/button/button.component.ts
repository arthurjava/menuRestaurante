import {
  Component,
  input,
  output,
  computed,
  HostBinding,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'info' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <button
      matButton
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="computedClasses()"
      [attr.aria-busy]="loading()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <mat-spinner diameter="20" class="mr-2" aria-hidden="true"></mat-spinner>
      } @else if (icon() && !loading()) {
        <mat-icon class="mr-2" aria-hidden="true">{{ icon() }}</mat-icon>
      }
      <span>{{ label() }}</span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    button {
      @apply inline-flex items-center justify-center font-medium rounded-lg transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
      font-weight: 500;
    }

    /* Sizes */
    .btn-sm {
      @apply px-3 py-1.5 text-sm gap-1.5;
      height: 32px;
    }
    .btn-md {
      @apply px-4 py-2 text-sm gap-2;
      height: 40px;
    }
    .btn-lg {
      @apply px-6 py-3 text-base gap-2;
      height: 48px;
    }
    .btn-icon {
      @apply p-2;
      height: 40px;
      width: 40px;
    }

    /* Variants */
    .variant-primary {
      @apply bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary/40;
    }
    .variant-secondary {
      @apply bg-surface-tertiary text-text-primary hover:bg-surface-hover focus:ring-neutral-400/40;
    }
    .variant-tertiary {
      @apply bg-transparent text-text-secondary hover:bg-surface-hover focus:ring-neutral-400/40;
    }
    .variant-danger {
      @apply bg-state-danger text-white hover:bg-state-danger-hover focus:ring-state-danger/40;
    }
    .variant-warning {
      @apply bg-state-warning text-state-on-warning hover:bg-state-warning-hover focus:ring-state-warning/40;
    }
    .variant-info {
      @apply bg-state-info text-white hover:bg-state-info-hover focus:ring-state-info/40;
    }
    .variant-outline {
      @apply border border-border bg-surface-primary text-text-primary hover:bg-surface-hover focus:ring-neutral-400/40;
    }
    .variant-ghost {
      @apply bg-transparent text-text-secondary hover:bg-surface-hover focus:ring-neutral-400/40;
    }

    .btn-full {
      @apply w-full;
    }

    mat-spinner {
      @apply h-5 w-5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  label = input.required<string>();
  icon = input<string>('');
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  @HostBinding('class')
  get hostClasses(): string {
    return this.fullWidth() ? 'w-full' : '';
  }

  computedClasses = computed(() => {
    const classes = ['btn'];
    classes.push(`btn-${this.size()}`);
    classes.push(`variant-${this.variant()}`);
    if (this.fullWidth()) classes.push('btn-full');
    return classes.join(' ');
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}