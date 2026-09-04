import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => string | number;
  class?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  class?: string;
  handler: (row: T) => void;
  disabled?: (row: T) => boolean;
  visible?: (row: T) => boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th 
                [class]="column.class"
                [class.cursor-pointer]="column.sortable"
                (click)="column.sortable && sort.emit({ key: column.key, direction: getNextSortDirection(column.key) })"
              >
                <div class="flex items-center gap-1">
                  {{ column.header }}
                  @if (column.sortable) {
                    <span class="text-gray-400">
                      @if (sortKey() === column.key) {
                        @if (sortDirection() === 'asc') {
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                        } @else {
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        }
                      } @else {
                        <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                      }
                    </span>
                  }
                </div>
              </th>
            }
            @if (actions().length > 0) {
              <th class="text-right">Ações</th>
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (row of data(); track $index) {
            <tr [class]="getRowClass()(row)">
              @for (column of columns(); track column.key) {
                <td [class]="column.class">
                  @if (column.render) {
                    {{ column.render(row) }}
                  } @else {
                    {{ getValue(row, column.key) }}
                  }
                </td>
              }
              @if (actions().length > 0) {
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    @for (action of actions(); track action.label) {
                      @if (!action.visible || action.visible(row)) {
                        <button
                          type="button"
                          [disabled]="action.disabled?.(row) || false"
                          [class]="action.class || 'text-primary-600 hover:text-primary-900'"
                          (click)="action.handler(row)"
                          class="p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          @if (action.icon) {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon"></path>
                            </svg>
                          } @else {
                            {{ action.label }}
                          }
                        </button>
                      }
                    }
                  </div>
                </td>
              }
            </tr>
          }
          @if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + (actions().length > 0 ? 1 : 0)" class="empty-state">
                <div class="empty-state-icon">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p class="empty-state-title">Nenhum registro encontrado</p>
                <p class="empty-state-description">{{ emptyMessage() }}</p>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    @if (pagination()) {
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-700">
          Mostrando {{ startItem() }} a {{ endItem() }} de {{ pagination()!.totalElements }} resultados
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn-secondary"
            [disabled]="pagination()!.page === 0"
            (click)="pageChange.emit(pagination()!.page - 1)"
          >
            Anterior
          </button>
          <button
            type="button"
            class="btn-secondary"
            [disabled]="pagination()!.page >= pagination()!.totalPages - 1"
            (click)="pageChange.emit(pagination()!.page + 1)"
          >
            Próxima
          </button>
        </div>
      </div>
    }
  `
})
export class TableComponent<T> {
  data = input<T[]>([]);
  columns = input<TableColumn<T>[]>([]);
  actions = input<TableAction<T>[]>([]);
  pagination = input<{ page: number; size: number; totalElements: number; totalPages: number } | null>(null);
  trackByFn = input<(item: T) => any>((item: T) => item);
  sortKey = input<string>('');
  sortDirection = input<'asc' | 'desc'>('asc');
  emptyMessage = input('Nenhum dado disponível');
  getRowClass = input<(row: T) => string>(() => '');

  sort = output<{ key: string; direction: 'asc' | 'desc' }>();
  pageChange = output<number>();
  rowClick = output<T>();

  startItem = computed(() => {
    const p = this.pagination();
    if (!p) return 0;
    return p.page * p.size + 1;
  });

  endItem = computed(() => {
    const p = this.pagination();
    if (!p) return 0;
    return Math.min((p.page + 1) * p.size, p.totalElements);
  });

  getValue(row: T, key: string): any {
    return key.split('.').reduce((obj: any, k) => obj?.[k], row);
  }

  getNextSortDirection(key: string): 'asc' | 'desc' {
    if (this.sortKey() === key) {
      return this.sortDirection() === 'asc' ? 'desc' : 'asc';
    }
    return 'asc';
  }
}