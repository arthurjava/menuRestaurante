import {
  Component,
  input,
  output,
  computed,
  HostBinding,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "warning"
  | "info"
  | "outline"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <button
      matButton
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="computedClasses()"
      [attr.aria-busy]="loading()"
      [attr.aria-label]="isIconOnly() ? label() : null"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <mat-spinner
          diameter="20"
          class="mr-2"
          aria-hidden="true"
        ></mat-spinner>
      }
      @if (icon()) {
        <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
      }
      @if (!isIconOnly()) {
        <span>{{ label() }}</span>
      }
    </button>
  `,
  styles: [
    `
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
        @apply p-2 min-w-0;
        height: 40px;
        width: 40px;
      }

      /* Variants */
      .variant-primary {
        @apply bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-active focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
        color: white !important;
      }
      .variant-secondary {
        @apply bg-surface-tertiary text-text-primary hover:bg-surface-hover focus:ring-neutral-400/40;
      }
      .variant-tertiary {
        @apply bg-transparent text-text-secondary hover:bg-surface-hover focus:ring-neutral-400/40;
      }
      .variant-danger {
        @apply bg-state-danger text-white hover:bg-state-danger-hover focus:ring-state-danger/40;
        color: white !important;
      }
      .variant-warning {
        @apply bg-state-warning text-state-on-warning hover:bg-state-warning-hover focus:ring-state-warning/40;
      }
      .variant-info {
        @apply bg-state-info text-white hover:bg-state-info-hover focus:ring-state-info/40;
        color: white !important;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  label = input.required<string>();
  variant = input<ButtonVariant>("primary");
  size = input<ButtonSize>("md");
  type = input<"button" | "submit" | "reset">("button");
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  /** Nome do ícone (Material Icons). Com size="icon", exibe somente o ícone. */
  icon = input<string>("");

  clicked = output<MouseEvent>();

  @HostBinding("class")
  get hostClasses(): string {
    return this.fullWidth() ? "w-full" : "";
  }

  /** Botão somente com ícone: ícone presente + tamanho "icon". */
  isIconOnly = computed(() => this.size() === "icon" && !!this.icon());

  computedClasses = computed(() => {
    const classes = ["btn"];
    // Fallback seguro: size="icon" sem ícone definido cai para "sm"
    // para não renderizar um botão vazio de 40x40 com texto transbordando.
    const effectiveSize =
      this.size() === "icon" && !this.icon() ? "sm" : this.size();
    classes.push(`btn-${effectiveSize}`);
    classes.push(`variant-${this.variant()}`);
    if (this.fullWidth()) classes.push("btn-full");
    return classes.join(" ");
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
