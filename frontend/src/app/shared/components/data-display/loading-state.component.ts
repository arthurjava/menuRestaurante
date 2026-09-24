import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";

export type LoadingVariant = "spinner" | "skeleton" | "bar" | "dots" | "pulse";
export type LoadingSize = "sm" | "md" | "lg" | "xl";

export interface SkeletonConfig {
  variant: "text" | "card" | "table" | "avatar" | "button" | "image";
  count?: number;
  lines?: number;
  width?: string;
  height?: string;
}

@Component({
  selector: "app-loading-state",
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatProgressBarModule],
  templateUrl: "./loading-state.component.html",
  styleUrl: "./loading-state.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  @Input() variant: LoadingVariant = "spinner";
  @Input() size: LoadingSize = "md";
  @Input() message = "";
  @Input() showMessage = true;
  @Input() overlay = false;
  @Input() skeleton: SkeletonConfig = { variant: "text", count: 3 };
  @Input() color: "primary" | "accent" | "warn" = "primary";

  readonly sizeClasses = computed(() => ({
    spinner: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
      xl: "h-12 w-12",
    },
    message: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    container: {
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    },
  }));

  readonly skeletonCount = computed(() =>
    Array.from({ length: this.skeleton.count || 3 }, (_, i) => i),
  );

  protected readonly spinnerDiameter = computed(() => {
    const sizes = { sm: 24, md: 32, lg: 40, xl: 48 };
    return sizes[this.size];
  });

  getColorValue(): string {
    switch (this.color) {
      case "primary":
        return "#4f46e5";
      case "accent":
        return "#e91e63";
      case "warn":
        return "#dc2626";
      default:
        return "#4f46e5";
    }
  }
}
