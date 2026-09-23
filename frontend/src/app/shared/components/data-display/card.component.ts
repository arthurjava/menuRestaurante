import {
  Component,
  input,
  computed,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <article class="card" [class]="computedClasses()">
      @if (headerTemplate() || title() || subtitle() || actionsTemplate()) {
        <header class="card-header flex items-center justify-between">
          <div class="flex-1">
            @if (title()) {
              <h3 class="section-title">{{ title() }}</h3>
            }
            @if (subtitle()) {
              <p class="text-body-sm text-text-secondary mt-0.5">{{ subtitle() }}</p>
            }
            @if (headerTemplate()) {
              <ng-template [ngTemplateOutlet]="headerTemplate()"></ng-template>
            }
          </div>
          @if (actionsTemplate()) {
            <div class="flex items-center gap-2 ml-4">
              <ng-template [ngTemplateOutlet]="actionsTemplate()"></ng-template>
            </div>
          }
        </header>
      }

      <div class="card-body">
        @if (contentTemplate()) {
          <ng-template [ngTemplateOutlet]="contentTemplate()"></ng-template>
        } @else {
          <ng-content></ng-content>
        }
      </div>

      @if (footerTemplate() || footerActionsWithDefaults().length > 0) {
        <footer class="card-footer flex items-center justify-end gap-3">
          @if (footerTemplate()) {
            <div class="flex-1">
              <ng-template [ngTemplateOutlet]="footerTemplate()"></ng-template>
            </div>
          }
          @for (action of footerActionsWithDefaults(); track action.label) {
            <app-button
              [variant]="action.variant"
              [size]="action.size"
              [icon]="action.icon"
              [label]="action.label"
              [loading]="action.loading"
              [disabled]="action.disabled"
              (clicked)="action.action($event)">
            </app-button>
          }
        </footer>
      }
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  variant = input<CardVariant>('default');
  hoverable = input<boolean>(false);
  padded = input<boolean>(true);

  headerTemplate = input<TemplateRef<any> | null>(null);
  contentTemplate = input<TemplateRef<any> | null>(null);
  footerTemplate = input<TemplateRef<any> | null>(null);
  actionsTemplate = input<TemplateRef<any> | null>(null);

footerActions = input<Array<{
    label: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    action: (event: MouseEvent) => void;
  }>>([]);

  protected readonly footerActionsWithDefaults = computed(() => 
    this.footerActions().map(action => ({
      label: action.label,
      variant: action.variant ?? 'primary',
      size: action.size ?? 'md',
      icon: action.icon ?? '',
      loading: action.loading ?? false,
      disabled: action.disabled ?? false,
      action: action.action,
    }))
  );

  @ContentChild('cardHeader') headerTemplateRef!: TemplateRef<any>;
  @ContentChild('cardContent') contentTemplateRef!: TemplateRef<any>;
  @ContentChild('cardFooter') footerTemplateRef!: TemplateRef<any>;
  @ContentChild('cardActions') actionsTemplateRef!: TemplateRef<any>;

  computedClasses = computed(() => {
    const classes = ['card'];
    if (this.hoverable()) classes.push('card-hover');
    if (!this.padded()) classes.push('p-0');
    switch (this.variant()) {
      case 'outlined':
        classes.push('border-2');
        break;
      case 'elevated':
        classes.push('shadow-lg');
        break;
      case 'filled':
        classes.push('bg-surface-secondary');
        break;
    }
    return classes.join(' ');
  });
}