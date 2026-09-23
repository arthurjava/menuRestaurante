import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { EmptyStateComponent } from '../data-display';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ButtonComponent } from '../button/button.component';

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => TemplateRef<any>;
  sticky?: boolean;
}

export interface TableAction<T = any> {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'outline' | 'ghost';
  tooltip?: string;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  action: (row: T) => void;
  divider?: boolean;
}

export interface DataTableConfig<T = any> {
  rowClickable?: boolean;
  selectable?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  pagination?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description?: string;
    actionLabel?: string;
    action?: () => void;
  };
  loadingTemplate?: TemplateRef<any>;
  trackBy?: (index: number, item: T) => any;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    EmptyStateComponent,
    ButtonComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = any> {
  @Input() columns: ColumnDef<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() config: DataTableConfig<T> = {};
  @Input() loading = false;
  @Input() totalItems = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50];

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  @ContentChild('customCell') customCellTemplate!: TemplateRef<any>;
  @ContentChild('customRow') customRowTemplate!: TemplateRef<any>;

  readonly selection = signal<T[]>([]);

  readonly displayedColumns = computed(() => {
    const cols = this.columns.map(c => c.key);
    const cfg = this.config;
    if (cfg.selectable) cols.unshift('select');
    if (this.actions.length > 0) cols.push('actions');
    return cols;
  });

  trackByFn = (index: number, item: T): any => {
    if (this.config.trackBy) {
      return this.config.trackBy(index, item);
    }
    return (item as any).id ?? index;
  };

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T): void {
    if (this.config.rowClickable) {
      this.rowClick.emit(row);
    }
  }

  onSelectionChange(row: T, event: MatCheckboxChange): void {
    const checked = event.checked;
    this.selection.update((current: T[]) =>
      checked ? [...current, row] : current.filter((r: T) => r !== row)
    );
    this.selectionChange.emit(this.selection());
  }

  onSelectAll(event: MatCheckboxChange): void {
    const checked = event.checked;
    if (checked) {
      this.selection.set([...this.data]);
    } else {
      this.selection.set([]);
    }
    this.selectionChange.emit(this.selection());
  }

  isSelected(row: T): boolean {
    return this.selection().some((r: T) => r === row);
  }

  onActionClick(action: TableAction<T>, row: T, event: Event): void {
    event.stopPropagation();
    if (!action.disabled?.(row)) {
      action.action(row);
    }
  }

  isActionVisible(action: TableAction<T>, row: T): boolean {
    return !action.hidden?.(row);
  }

  getHeaderClasses(column: ColumnDef<T>): string {
    const classes = ['text-left'];
    if (column.align) classes.push(`text-${column.align}`);
    if (column.sticky) classes.push('sticky-start');
    return classes.join(' ');
  }

  getCellClasses(column: ColumnDef<T>): string {
    const classes = [];
    if (column.align) classes.push(`text-${column.align}`);
    return classes.join(' ');
  }

  getCellValue(row: T, key: string): string {
    const value = (row as any)[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  getActionButtonClass(action: TableAction<T>): string {
    const base = 'p-1.5 rounded-lg transition-colors duration-fast';
    const variants: Record<string, string> = {
      primary: 'text-brand-primary hover:bg-brand-primary-subtle',
      secondary: 'text-text-secondary hover:bg-surface-hover',
      danger: 'text-state-danger hover:bg-state-danger-subtle',
      warning: 'text-state-warning hover:bg-state-warning-subtle',
      info: 'text-state-info hover:bg-state-info-subtle',
      outline: 'text-text-secondary hover:bg-surface-hover',
      ghost: 'text-text-tertiary hover:bg-surface-hover',
    };
    return `${base} ${variants[action.variant || 'secondary']}`;
  }

  protected readonly hasActions = computed(() => this.actions.length > 0);
  protected readonly allSelected = computed(() =>
    this.data.length > 0 && this.selection().length === this.data.length
  );
  protected readonly someSelected = computed(() =>
    this.selection().length > 0 && this.selection().length < this.data.length
  );
}