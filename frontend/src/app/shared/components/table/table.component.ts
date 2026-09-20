import {
  Component,
  input,
  output,
  computed,
  signal,
  effect,
  inject,
  viewChild,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from "@angular/material/paginator";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SelectionModel } from "@angular/cdk/collections";
import { ButtonComponent } from "../button/button.component";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => string | number | Date;
  sticky?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: string | ((row: T) => string);
  color?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | ((row: T) => "primary" | "secondary" | "danger" | "ghost");
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  action: (row: T) => void;
}

export interface TableConfig {
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  sorting?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

@Component({
  selector: "app-table",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ButtonComponent,
  ],
  template: `
    <div class="table-container">
      @if (loading()) {
        <div class="flex items-center justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <table
          mat-table
          [dataSource]="dataSource()"
          class="mat-elevation-z0 w-full"
          role="grid"
        >
          @if (config().selectable) {
            <!-- Checkbox Column -->
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef class="w-12">
                <mat-checkbox
                  [checked]="isAllSelected()"
                  [indeterminate]="isIndeterminate()"
                  (change)="toggleAllRows($event)"
                  aria-label="Selecionar todas as linhas"
                >
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row" class="w-12">
                <mat-checkbox
                  [checked]="selection.isSelected(row)"
                  (change)="toggleRow(row, $event)"
                  (click)="$event.stopPropagation()"
                  aria-label="Selecionar linha"
                >
                </mat-checkbox>
              </td>
            </ng-container>
          }

          <!-- Data Columns -->
          @for (column of columns(); track column.key) {
            <ng-container
              [matColumnDef]="column.key"
              [sticky]="column.sticky ?? false"
            >
              <th
                mat-header-cell
                *matHeaderCellDef
                [class]="getHeaderClasses(column)"
                [style.width]="column.width"
                [style.min-width]="column.width"
                [style.max-width]="column.width"
              >
                <span>{{ column.header }}</span>
              </th>
              <td
                mat-cell
                *matCellDef="let row"
                [class]="getCellClasses(column)"
                [style.width]="column.width"
                [style.min-width]="column.width"
                [style.max-width]="column.width"
              >
                @if (column.render) {
                  <span [class]="getCellAlign(column)">{{
                    column.render(row)
                  }}</span>
                } @else {
                  <span [class]="getCellAlign(column)">{{
                    getCellValue(row, column.key)
                  }}</span>
                }
              </td>
            </ng-container>
          }

          <!-- Actions Column -->
          @if (actions().length > 0) {
            <ng-container matColumnDef="actions">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="w-48 text-right pr-6"
              >
                Ações
              </th>
              <td mat-cell *matCellDef="let row" class="w-48 text-right pr-6">
                <div class="flex items-center justify-end gap-1">
                  @for (action of actions(); track action.label) {
                    @if (!action.hidden?.(row)) {
                      <app-button
                        [variant]="getActionColor(action, row)"
                        [size]="'icon'"
                        [icon]="getActionIcon(action, row)"
                        [label]="action.label"
                        [disabled]="action.disabled?.(row) ?? false"
                        [matTooltip]="action.label"
                        (clicked)="action.action(row)"
                      >
                      </app-button>
                    }
                  }
                </div>
              </td>
            </ng-container>
          }

          <!-- Row Definition -->
          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns()"
            class="bg-gray-50"
          ></tr>
          <tr
            mat-row
            *matRowDef="
              let row;
              columns: displayedColumns();
              let even = even;
              let odd = odd
            "
            [class]="getRowClasses(row, even, odd)"
            (click)="onRowClick(row)"
            [attr.tabindex]="rowClickable() ? 0 : null"
            (keydown.enter)="onRowClick(row)"
          ></tr>

          <!-- Empty State -->
          <tr class="mat-row" *matNoDataRow>
            <td
              [attr.colspan]="displayedColumns().length"
              class="text-center py-12"
            >
              <div class="flex flex-col items-center gap-2 text-gray-500">
                <mat-icon class="text-4xl">inbox</mat-icon>
                <p>
                  {{ config().emptyMessage ?? "Nenhum registro encontrado" }}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Paginator -->
        @if (config().pagination) {
          <mat-paginator
            #paginator
            [length]="totalItems()"
            [pageSize]="config().pageSize ?? 10"
            [pageSizeOptions]="config().pageSizeOptions ?? [5, 10, 25, 50]"
            [showFirstLastButtons]="true"
            (page)="onPageChange($event)"
            class="mt-4"
          >
          </mat-paginator>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .table-container {
        @apply overflow-x-auto rounded-xl border border-gray-100 bg-white;
      }

      ::ng-deep .mat-mdc-table {
        @apply w-full;
      }

      ::ng-deep .mat-mdc-header-cell {
        @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200;
      }

      ::ng-deep .mat-mdc-cell {
        @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100;
      }

      ::ng-deep .mat-mdc-row:hover {
        @apply bg-gray-50;
      }

      ::ng-deep .mat-mdc-row.selected {
        @apply bg-indigo-50;
      }

      ::ng-deep .mat-mdc-paginator {
        @apply border-t border-gray-100 bg-white;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> {
  columns = input<ColumnDef<T>[]>([]);
  data = input<T[]>([]);
  actions = input<TableAction<T>[]>([]);
  config = input<TableConfig>({});
  totalItems = input<number>(0);
  pageIndex = input<number>(0);
  pageSize = input<number>(10);
  sortActive = input<string>("");
  sortDirection = input<"asc" | "desc">("asc");
  loading = input<boolean>(false);

  rowClickable = input<boolean>(false);

  // Events
  rowClick = output<T>();
  selectionChange = output<T[]>();
  pageChange = output<PageEvent>();
  sortChange = output<{ active: string; direction: "asc" | "desc" }>();
  actionClick = output<{ action: string; row: T }>();

  // Internal
  selection = new SelectionModel<T>(true, []);
  dataSource = signal<MatTableDataSource<T>>(new MatTableDataSource<T>([]));

  paginator = viewChild<MatPaginator>(MatPaginator);

  displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.key);
    if (this.config().selectable) cols.unshift("select");
    if (this.actions().length > 0) cols.push("actions");
    return cols;
  });

  constructor() {
    effect(() => {
      const ds = new MatTableDataSource<T>(this.data());
      ds.paginator = this.paginator();
      this.dataSource.set(ds);
    });

    effect(() => {
      if (this.paginator()) {
        this.dataSource().paginator = this.paginator()!;
      }
    });
  }

  isAllSelected = computed(() => {
    const data = this.dataSource().connect().value;
    return data.length > 0 && this.selection.selected.length === data.length;
  });

  isIndeterminate = computed(() => {
    return this.selection.selected.length > 0 && !this.isAllSelected();
  });

  toggleAllRows(event: any): void {
    const data = this.dataSource().connect().value;
    if (event.checked) {
      this.selection.select(...data);
    } else {
      this.selection.clear();
    }
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: T, event: any): void {
    event.checked ? this.selection.select(row) : this.selection.deselect(row);
    this.selectionChange.emit(this.selection.selected);
  }

  onRowClick(row: T): void {
    if (this.rowClickable()) {
      this.rowClick.emit(row);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  getCellValue(row: T, key: string): any {
    const keys = key.split(".");
    let value: any = row;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }

  getHeaderClasses(column: ColumnDef<T>): string {
    const classes = [];
    if (column.align) classes.push(`text-${column.align}`);
    return classes.join(" ");
  }

  getCellClasses(column: ColumnDef<T>): string {
    const classes = [];
    if (column.align) classes.push(`align-${column.align}`);
    return classes.join(" ");
  }

  getCellAlign(column: ColumnDef<T>): string {
    return column.align ? `text-${column.align}` : "text-left";
  }

  getRowClasses(row: T, even: boolean, odd: boolean): string {
    const classes = [];
    if (this.selection.isSelected(row)) classes.push("selected");
    if (even) classes.push("even");
    if (odd) classes.push("odd");
    if (this.rowClickable()) classes.push("cursor-pointer");
    return classes.join(" ");
  }

  getActionIcon(action: TableAction<T>, row: T): string {
    if (typeof action.icon === "function") {
      return action.icon(row);
    }
    return action.icon ?? "";
  }

  getActionColor(
    action: TableAction<T>,
    row: T,
  ): "primary" | "secondary" | "danger" | "ghost" {
    if (typeof action.color === "function") {
      return action.color(row);
    }
    return action.color ?? "ghost";
  }
}
