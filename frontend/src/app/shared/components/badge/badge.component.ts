import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";

export type BadgeVariant =
  "success" | "warning" | "danger" | "info" | "gray" | "primary" | "secondary";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "pill" | "square";

@Component({
  selector: "app-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1"
      [class]="computedClasses()"
      [attr.aria-label]="ariaLabel()"
    >
      @if (icon()) {
        <span [class]="iconClasses()">{{ icon() }}</span>
      }
      @if (dot()) {
        <span class="dot" [class]="dotClasses()"></span>
      }
      <span [class]="textClasses()">{{ label() }}</span>
      @if (count() !== null && count() !== undefined) {
        <span class="count" [class]="countClasses()">{{ count() }}</span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .badge {
        @apply inline-flex items-center gap-1 font-medium;
      }

      /* Sizes */
      .size-sm {
        @apply px-2 py-0.5 text-xs;
      }
      .size-md {
        @apply px-2.5 py-1 text-xs;
      }
      .size-lg {
        @apply px-3 py-1 text-sm;
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

      /* Variants */
      .variant-success {
        @apply bg-green-100 text-green-800;
      }
      .variant-warning {
        @apply bg-yellow-100 text-yellow-800;
      }
      .variant-danger {
        @apply bg-red-100 text-red-800;
      }
      .variant-info {
        @apply bg-blue-100 text-blue-800;
      }
      .variant-gray {
        @apply bg-gray-100 text-gray-800;
      }
      .variant-primary {
        @apply bg-indigo-100 text-indigo-800;
      }
      .variant-secondary {
        @apply bg-gray-100 text-gray-700;
      }

      /* Icon */
      .icon {
        @apply flex items-center justify-center;
      }
      .size-sm .icon {
        @apply text-[10px];
      }
      .size-md .icon {
        @apply text-[11px];
      }
      .size-lg .icon {
        @apply text-[12px];
      }

      /* Dot */
      .dot {
        @apply w-1.5 h-1.5 rounded-full;
      }
      .size-sm .dot {
        @apply w-1 h-1;
      }
      .size-lg .dot {
        @apply w-2 h-2;
      }

      .dot-success {
        @apply bg-green-500;
      }
      .dot-warning {
        @apply bg-yellow-500;
      }
      .dot-danger {
        @apply bg-red-500;
      }
      .dot-info {
        @apply bg-blue-500;
      }
      .dot-gray {
        @apply bg-gray-500;
      }
      .dot-primary {
        @apply bg-indigo-500;
      }
      .dot-secondary {
        @apply bg-gray-500;
      }

      /* Count */
      .count {
        @apply px-1.5 py-0.5 rounded-full text-xs font-bold;
      }
      .size-sm .count {
        @apply px-1 py-0 text-[10px];
      }
      .size-lg .count {
        @apply px-2 py-0.5 text-xs;
      }

      .count-success {
        @apply bg-green-500 text-white;
      }
      .count-warning {
        @apply bg-yellow-500 text-white;
      }
      .count-danger {
        @apply bg-red-500 text-white;
      }
      .count-info {
        @apply bg-blue-500 text-white;
      }
      .count-gray {
        @apply bg-gray-500 text-white;
      }
      .count-primary {
        @apply bg-indigo-500 text-white;
      }
      .count-secondary {
        @apply bg-gray-500 text-white;
      }

      /* Text */
      .text-content {
        @apply whitespace-nowrap;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  label = input<string>("");
  variant = input<BadgeVariant>("gray");
  size = input<BadgeSize>("md");
  shape = input<BadgeShape>("pill");
  icon = input<string>("");
  dot = input<boolean>(false);
  count = input<number | null>(null);
  ariaLabel = input<string>("");

  computedClasses = computed(() => {
    const classes = ["badge"];
    classes.push(`size-${this.size()}`);
    classes.push(`shape-${this.shape()}`);
    classes.push(`variant-${this.variant()}`);
    return classes.join(" ");
  });

  iconClasses = computed(() => {
    return "icon";
  });

  dotClasses = computed(() => {
    return `dot dot-${this.variant()}`;
  });

  textClasses = computed(() => {
    return "text-content";
  });

  countClasses = computed(() => {
    return `count count-${this.variant()}`;
  });
}
