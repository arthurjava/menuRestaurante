import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'secondary' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill' | 'square';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 font-medium"
      [class]="computedClasses()"
      [attr.aria-label]="ariaLabel()"
    >
      @if (icon()) {
        <span class="icon" [class]="iconClasses()">{{ icon() }}</span>
      }
      @if (dot()) {
        <span class="dot" [class]="dotClasses()"></span>
      }
      <span class="text-content">{{ label() }}</span>
      @if (count() !== null && count() !== undefined) {
        <span class="count" [class]="countClasses()">{{ count() }}</span>
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .badge {
      @apply inline-flex items-center gap-1 font-medium;
    }

    /* Sizes */
    .size-sm {
      @apply px-2 py-0.5 text-xs;
      height: 20px;
    }
    .size-md {
      @apply px-2.5 py-1 text-xs;
      height: 24px;
    }
    .size-lg {
      @apply px-3 py-1 text-sm;
      height: 28px;
    }

    /* Shapes */
    .shape-rounded {
      @apply rounded-md;
    }
    .shape-pill {
      @apply rounded-full;
    }
    .shape-square {
      @apply rounded-none;
    }

    /* Variants - using semantic color tokens */
    .variant-primary {
      @apply bg-brand-primary-subtle text-brand-primary-hover;
    }
    .variant-secondary {
      @apply bg-surface-tertiary text-text-secondary;
    }
    .variant-success {
      @apply bg-state-success-subtle text-state-success-hover;
    }
    .variant-warning {
      @apply bg-state-warning-subtle text-state-warning-hover;
    }
    .variant-danger {
      @apply bg-state-danger-subtle text-state-danger-hover;
    }
    .variant-info {
      @apply bg-state-info-subtle text-state-info-hover;
    }
    .variant-neutral {
      @apply bg-surface-tertiary text-text-secondary;
    }
    .variant-gray {
      @apply bg-surface-tertiary text-text-tertiary;
    }

    /* Icon */
    .icon {
      @apply flex items-center justify-center;
    }
    .size-sm .icon { @apply text-[10px]; }
    .size-md .icon { @apply text-[11px]; }
    .size-lg .icon { @apply text-[12px]; }

    /* Dot */
    .dot {
      @apply w-1.5 h-1.5 rounded-full;
    }
    .size-sm .dot { @apply w-1 h-1; }
    .size-lg .dot { @apply w-2 h-2; }

    .dot-primary { @apply bg-brand-primary; }
    .dot-success { @apply bg-state-success; }
    .dot-warning { @apply bg-state-warning; }
    .dot-danger { @apply bg-state-danger; }
    .dot-info { @apply bg-state-info; }
    .dot-neutral { @apply bg-text-tertiary; }

    /* Count */
    .count {
      @apply px-1.5 py-0.5 rounded-full text-xs font-bold;
    }
    .size-sm .count { @apply px-1 py-0 text-[10px]; }
    .size-lg .count { @apply px-2 py-0.5 text-xs; }

    .count-primary { @apply bg-brand-primary text-white; }
    .count-success { @apply bg-state-success text-white; }
    .count-warning { @apply bg-state-warning text-white; }
    .count-danger { @apply bg-state-danger text-white; }
    .count-info { @apply bg-state-info text-white; }
    .count-neutral { @apply bg-text-tertiary text-white; }

    /* Text */
    .text-content {
      @apply whitespace-nowrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  label = input.required<string>();
  variant = input<BadgeVariant>('neutral');
  size = input<BadgeSize>('md');
  shape = input<BadgeShape>('pill');
  icon = input<string>('');
  dot = input<boolean>(false);
  count = input<number | null>(null);
  ariaLabel = input<string>('');

  @HostBinding('class')
  get hostClass(): string {
    return 'badge';
  }

  computedClasses = computed(() => {
    const classes = ['badge'];
    classes.push(`size-${this.size()}`);
    classes.push(`shape-${this.shape()}`);
    classes.push(`variant-${this.variant()}`);
    return classes.join(' ');
  });

  iconClasses = computed(() => 'icon');

  dotClasses = computed(() => {
    return `dot dot-${this.variant()}`;
  });

  textClasses = computed(() => 'text-content');

  countClasses = computed(() => {
    return `count count-${this.variant()}`;
  });
}