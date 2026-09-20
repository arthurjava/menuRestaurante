import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import {
  NotificationService,
  Notification,
  NotificationType,
} from "../../../core/services/notification.service";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @for (notification of notifications(); track notification.id) {
      <div
        class="fixed top-4 right-4 z-50 flex w-full max-w-sm items-center gap-3 p-4 rounded-xl shadow-lg animate-slide-in"
        [ngClass]="getNotificationClasses(notification.type)"
        role="alert"
        aria-live="polite"
      >
        <mat-icon class="text-current shrink-0">{{
          getIcon(notification.type)
        }}</mat-icon>
        <p class="flex-1 text-sm font-medium text-gray-900">
          {{ notification.message }}
        </p>
        <button
          type="button"
          class="text-current opacity-70 hover:opacity-100 transition-opacity"
          (click)="remove(notification.id)"
          aria-label="Fechar notificação"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }
  `,
  styles: [
    `
      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);

  notifications = computed(() => this.notificationService.notifications());

  getNotificationClasses(type: NotificationType): string {
    const baseClasses = "border-l-4";
    switch (type) {
      case "success":
        return `${baseClasses} border-green-500 bg-green-50 text-green-800`;
      case "error":
        return `${baseClasses} border-red-500 bg-red-50 text-red-800`;
      case "warning":
        return `${baseClasses} border-yellow-500 bg-yellow-50 text-yellow-800`;
      case "info":
        return `${baseClasses} border-blue-500 bg-blue-50 text-blue-800`;
      default:
        return `${baseClasses} border-gray-500 bg-gray-50 text-gray-800`;
    }
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "info";
    }
  }

  remove(id: string): void {
    this.notificationService.remove(id);
  }
}
