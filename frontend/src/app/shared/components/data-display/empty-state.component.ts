import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type EmptyStateVariant = 'default' | 'search' | 'filter' | 'error' | 'offline';

export interface EmptyStatePreset {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
}

const PRESETS: Record<EmptyStateVariant, EmptyStatePreset> = {
  default: { icon: 'inbox', title: 'Nenhum registro encontrado', description: 'Comece criando um novo item.' },
  search: { icon: 'search_off', title: 'Nenhum resultado encontrado', description: 'Tente alterar os termos da busca.' },
  filter: { icon: 'filter_alt_off', title: 'Nenhum resultado para os filtros', description: 'Ajuste ou limpe os filtros aplicados.' },
  error: { icon: 'error_outline', title: 'Erro ao carregar', description: 'Não foi possível carregar os dados. Tente novamente.' },
  offline: { icon: 'wifi_off', title: 'Você está offline', description: 'Verifique sua conexão e tente novamente.' },
};

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nenhum registro encontrado';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  @Input() variant: EmptyStateVariant = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() illustration = false;

  @Output() actionClick = new EventEmitter<void>();

  readonly preset = computed(() => PRESETS[this.variant]);

  readonly effectiveIcon = computed(() => this.icon || this.preset().icon);
  readonly effectiveTitle = computed(() => this.title || this.preset().title);
  readonly effectiveDescription = computed(() => this.description || this.preset().description);
  readonly effectiveActionLabel = computed(() => this.actionLabel || this.preset().actionLabel);

  onAction(): void {
    if (this.effectiveActionLabel()) {
      this.actionClick.emit();
    }
  }

  protected readonly sizeClasses = computed(() => ({
    sm: 'py-6 px-4',
    md: 'py-12 px-4',
    lg: 'py-16 px-6',
  }));

  protected readonly iconSizeClasses = computed(() => ({
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-7xl',
  }));

  protected readonly titleSizeClasses = computed(() => ({
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }));
}