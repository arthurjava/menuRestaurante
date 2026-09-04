import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  #loadingCount = signal(0);
  #loadingMap = signal<Record<string, boolean>>({});

  isLoading = computed(() => this.#loadingCount() > 0);
  loadingMap = this.#loadingMap.asReadonly();

  start(key?: string): void {
    this.#loadingCount.update(c => c + 1);
    if (key) {
      this.#loadingMap.update(m => ({ ...m, [key]: true }));
    }
  }

  stop(key?: string): void {
    this.#loadingCount.update(c => Math.max(0, c - 1));
    if (key) {
      this.#loadingMap.update(m => ({ ...m, [key]: false }));
    }
  }

  isLoadingKey(key: string): boolean {
    return this.#loadingMap()[key] === true;
  }
}