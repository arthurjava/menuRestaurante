import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../button/button.component";

export type EmptyStateVariant =
  "default" | "search" | "filter" | "error" | "offline" | "success";

export interface EmptyStatePreset {
  title: string;
  description?: string;
  actionLabel?: string;
}

const PRESETS: Record<EmptyStateVariant, EmptyStatePreset> = {
  default: {
    title: "Nenhum registro encontrado",
    description: "Comece criando um novo item.",
  },
  search: {
    title: "Nenhum resultado encontrado",
    description: "Tente alterar os termos da busca.",
  },
  filter: {
    title: "Nenhum resultado para os filtros",
    description: "Ajuste ou limpe os filtros aplicados.",
  },
  error: {
    title: "Erro ao carregar",
    description: "Não foi possível carregar os dados. Tente novamente.",
  },
  offline: {
    title: "Você está offline",
    description: "Verifique sua conexão e tente novamente.",
  },
  success: {
    title: "Tudo certo!",
    description: "Não há itens pendentes no momento.",
  },
};

@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="empty-state" [class]="sizeClasses()">
      <div class="empty-state-icon" [class]="iconColorClass()">
        <span class="empty-state-symbol">{{ effectiveSymbol() }}</span>
      </div>
      <h3 class="empty-state-title">{{ effectiveTitle() }}</h3>
      @if (effectiveDescription()) {
        <p class="empty-state-description">{{ effectiveDescription() }}</p>
      }
      @if (effectiveActionLabel()) {
        <app-button
          variant="primary"
          [label]="effectiveActionLabel()"
          (clicked)="onAction()"
          class="mt-4"
        >
        </app-button>
      }
      @if (customContent()) {
        <div class="mt-4">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .empty-state-icon {
        @apply inline-flex items-center justify-center rounded-full mb-4;
        width: 64px;
        height: 64px;
      }

      .empty-state-symbol {
        @apply text-3xl font-bold;
      }

      .size-sm .empty-state-icon {
        @apply w-12 h-12;
      }

      .size-sm .empty-state-symbol {
        @apply text-xl;
      }

      .size-lg .empty-state-icon {
        @apply w-20 h-20;
      }

      .size-lg .empty-state-symbol {
        @apply text-5xl;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  icon = input<string>("");
  title = input<string>("");
  description = input<string>("");
  actionLabel = input<string>("");
  variant: EmptyStateVariant = "default";
  size = input<"sm" | "md" | "lg">("md");
  illustration = input<boolean>(false);

  actionClick = output<void>();

  preset = computed(() => PRESETS[this.variant]);

  effectiveTitle = computed(() => this.title() || this.preset().title);
  effectiveDescription = computed(
    () => this.description() || this.preset().description,
  );
  effectiveActionLabel = computed(
    () => this.actionLabel() || this.preset().actionLabel || "",
  );

  effectiveSymbol = computed(() => {
    const symbols: Record<EmptyStateVariant, string> = {
      default: "•",
      search: "?",
      filter: "⌕",
      error: "⚠",
      offline: "⛶",
      success: "✓",
    };
    return symbols[this.variant];
  });

  sizeClasses = computed(() => ({
    sm: "py-6 px-4",
    md: "py-12 px-4",
    lg: "py-16 px-6",
  }));

  iconColorClass = computed(() => {
    const colors: Record<EmptyStateVariant, string> = {
      default: "bg-surface-tertiary text-text-tertiary",
      search: "bg-primary-50 text-primary-600",
      filter: "bg-info-50 text-info-600",
      error: "bg-danger-50 text-danger-600",
      offline: "bg-warning-50 text-warning-600",
      success: "bg-success-50 text-success-600",
    };
    return colors[this.variant];
  });

  onAction(): void {
    if (this.effectiveActionLabel()) {
      this.actionClick.emit();
    }
  }

  customContent = computed(() => false);
}
