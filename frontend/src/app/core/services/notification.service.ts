import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications = signal<Notification[]>([]);

  readonly notifications = computed(() => this._notifications());

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private add(type: NotificationType, message: string, duration?: number): string {
    const id = this.generateId();
    const notification: Notification = { id, type, message, duration };
    this._notifications.update(notifications => [...notifications, notification]);

    if (duration !== 0) {
      setTimeout(() => this.remove(id), duration ?? 5000);
    }

    return id;
  }

  success(message: string, duration?: number): string {
    return this.add('success', message, duration);
  }

  error(message: string, duration?: number): string {
    return this.add('error', message, duration);
  }

  warning(message: string, duration?: number): string {
    return this.add('warning', message, duration);
  }

  info(message: string, duration?: number): string {
    return this.add('info', message, duration);
  }

  remove(id: string): void {
    this._notifications.update(notifications => notifications.filter(n => n.id !== id));
  }

  clear(): void {
    this._notifications.set([]);
  }
}