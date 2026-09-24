import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from "@angular/animations";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actionLabel?: string;
  action?: () => void;
  persistent?: boolean;
  createdAt: number;
}

const TYPE_CONFIG: Record<
  ToastType,
  { icon: string; color: string; bgColor: string }
> = {
  success: {
    icon: "check_circle",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
  error: {
    icon: "error",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  warning: {
    icon: "warning",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  info: {
    icon: "info",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
};

@Component({
  selector: "app-toast-container",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressBarModule],
  templateUrl: "./toast-container.component.html",
  styleUrl: "./toast-container.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("toastList", [
      transition(":enter", [
        query(
          ":enter",
          [
            style({ opacity: 0, transform: "translateX(100px)" }),
            stagger(100, [
              animate(
                "300ms ease-out",
                style({ opacity: 1, transform: "translateX(0)" }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
      transition(":leave", [
        query(
          ":leave",
          [
            stagger(50, [
              animate(
                "200ms ease-in",
                style({ opacity: 0, transform: "translateX(100px)" }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
    trigger("toastItem", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100px) scale(0.95)" }),
        animate(
          "300ms ease-out",
          style({ opacity: 1, transform: "translateX(0) scale(1)" }),
        ),
      ]),
      transition(":leave", [
        animate(
          "200ms ease-in",
          style({ opacity: 0, transform: "translateX(100px) scale(0.95)" }),
        ),
      ]),
    ]),
  ],
})
export class ToastContainerComponent {
  @Input() toasts: Toast[] = [];
  @Output() dismiss = new EventEmitter<string>();
  @Output() action = new EventEmitter<{ id: string; action: () => void }>();

  readonly trackById = (index: number, toast: Toast) => toast.id;

  getTypeConfig(type: ToastType) {
    return TYPE_CONFIG[type];
  }

  onDismiss(id: string): void {
    this.dismiss.emit(id);
  }

  onAction(toast: Toast): void {
    if (toast.action) {
      this.action.emit({ id: toast.id, action: toast.action });
      if (!toast.persistent) {
        this.dismiss.emit(toast.id);
      }
    }
  }

  getProgress(toast: Toast): number {
    if (toast.persistent || !toast.duration) return 100;
    const elapsed = Date.now() - toast.createdAt;
    return Math.max(0, 100 - (elapsed / toast.duration) * 100);
  }
}
