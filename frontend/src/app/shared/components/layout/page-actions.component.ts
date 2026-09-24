import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
export type ButtonVariant =
  "primary" | "secondary" | "danger" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface PageAction {
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  action: () => void;
  fullWidth?: boolean;
}

@Component({
  selector: "app-page-actions",
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: "./page-actions.component.html",
  styleUrl: "./page-actions.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageActionsComponent {
  @Input() actions: PageAction[] = [];
  @Input() alignment: "start" | "center" | "end" | "stretch" = "end";
  @Input() gap = "gap-3";
  @Input() wrap = true;

  @ContentChild("customActions") customActionsTemplate!: TemplateRef<any>;

  readonly hasCustomActions = computed(() => !!this.customActionsTemplate);

  onActionClick(action: PageAction): void {
    if (!action.disabled && !action.loading) {
      action.action();
    }
  }

  getButtonClasses(action: PageAction): string {
    const base = "btn flex items-center gap-1.5";
    const sizeClasses: Record<ButtonSize, string> = {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
      icon: "btn-icon",
    };
    const variantClasses: Record<ButtonVariant, string> = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-danger",
      outline: "btn-outline",
      ghost: "btn-ghost",
    };
    const widthClass = action.fullWidth ? "w-full sm:w-auto" : "";
    return `${base} ${sizeClasses[action.size || "md"]} ${variantClasses[action.variant || "primary"]} ${widthClass}`.trim();
  }

  protected readonly computedAlignment = computed(() => {
    const alignMap = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      stretch: "justify-stretch",
    };
    return alignMap[this.alignment];
  });
}
