import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";

export type StatCardVariant =
  "default" | "primary" | "success" | "warning" | "danger" | "info";

export interface StatCardAction {
  label: string;
  icon?: string;
  action: () => void;
  variant?: "primary" | "secondary" | "outline";
}

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: "./stat-card.component.html",
  styleUrl: "./stat-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input() title = "";
  @Input() value: string | number = "";
  @Input() icon = "";
  @Input() variant: StatCardVariant = "default";
  @Input() trend: "up" | "down" | "neutral" = "neutral";
  @Input() trendValue = "";
  @Input() trendLabel = "";
  @Input() description = "";
  @Input() actions: StatCardAction[] = [];
  @Input() loading = false;
  @Input() clickable = false;
  @Input() href = "";

  readonly variantClasses = computed(() => ({
    default: "bg-surface-primary border-border",
    primary: "bg-brand-primary-subtle border-brand-primary-border",
    success: "bg-state-success-subtle border-state-success-border",
    warning: "bg-state-warning-subtle border-state-warning-border",
    danger: "bg-state-danger-subtle border-state-danger-border",
    info: "bg-state-info-subtle border-state-info-border",
  }));

  readonly iconColorClasses = computed(() => ({
    default: "bg-surface-tertiary text-text-secondary",
    primary: "bg-brand-primary-subtle text-brand-primary-hover",
    success: "bg-state-success-subtle text-state-success-hover",
    warning: "bg-state-warning-subtle text-state-warning-hover",
    danger: "bg-state-danger-subtle text-state-danger-hover",
    info: "bg-state-info-subtle text-state-info-hover",
  }));

  readonly trendIcon = computed(() => {
    switch (this.trend) {
      case "up":
        return "trending_up";
      case "down":
        return "trending_down";
      default:
        return "remove";
    }
  });

  readonly trendColorClass = computed(() => {
    switch (this.trend) {
      case "up":
        return "text-success-600";
      case "down":
        return "text-danger-600";
      default:
        return "text-gray-500";
    }
  });

  getBorderColor(variant: StatCardVariant): string {
    const borders: Record<StatCardVariant, string> = {
      default: "border-gray-100",
      primary: "border-primary-100",
      success: "border-success-100",
      warning: "border-warning-100",
      danger: "border-danger-100",
      info: "border-info-100",
    };
    return borders[variant];
  }

  getActionButtonClass(variant: string): string {
    const variants: Record<string, string> = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
    };
    return `btn-sm ${variants[variant] || "btn-outline"}`;
  }
}
