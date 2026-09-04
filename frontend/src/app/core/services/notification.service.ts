import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  #toasts = signal<Toast[]>([]);
  #idCounter = 0;

  toasts = this.#toasts.asReadonly();

  private addToast(type: ToastType, title: string, message?: string): void {
    const id = ++this.#idCounter;
    const toast: Toast = { id, type, title, message };
    this.#toasts.update(toasts => [...toasts, toast]);
    
    setTimeout(() => this.remove(id), 5000);
  }

  success(title: string, message?: string): void {
    this.addToast('success', title, message);
  }

  error(title: string, message?: string): void {
    this.addToast('error', title, message);
  }

  warning(title: string, message?: string): void {
    this.addToast('warning', title, message);
  }

  info(title: string, message?: string): void {
    this.addToast('info', title, message);
  }

  remove(id: number): void {
    this.#toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.#toasts.set([]);
  }
}