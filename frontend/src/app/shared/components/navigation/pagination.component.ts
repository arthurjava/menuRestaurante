import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50];
  @Input() showPageSize = true;
  @Input() showTotal = true;
  @Input() maxPageLinks = 5;

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly totalPages = computed(() => Math.ceil(this.totalItems / this.pageSize));
  readonly startItem = computed(() => this.totalItems > 0 ? this.pageIndex * this.pageSize + 1 : 0);
  readonly endItem = computed(() => Math.min((this.pageIndex + 1) * this.pageSize, this.totalItems));

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.pageIndex;
    const maxLinks = this.maxPageLinks;
    const halfLinks = Math.floor(maxLinks / 2);

    let start = Math.max(0, current - halfLinks);
    let end = Math.min(total, start + maxLinks);

    if (end - start < maxLinks) {
      start = Math.max(0, end - maxLinks);
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  onPageChange(newPageIndex: number): void {
    const clampedIndex = Math.max(0, Math.min(newPageIndex, this.totalPages() - 1));
    if (clampedIndex !== this.pageIndex) {
      this.pageChange.emit({ pageIndex: clampedIndex, pageSize: this.pageSize });
    }
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSizeChange.emit(newPageSize);
    this.pageChange.emit({ pageIndex: 0, pageSize: newPageSize });
  }

  onFirstPage(): void {
    this.onPageChange(0);
  }

  onLastPage(): void {
    this.onPageChange(this.totalPages() - 1);
  }

  onPreviousPage(): void {
    this.onPageChange(this.pageIndex - 1);
  }

  onNextPage(): void {
    this.onPageChange(this.pageIndex + 1);
  }

  protected readonly hasPrevious = computed(() => this.pageIndex > 0);
  protected readonly hasNext = computed(() => this.pageIndex < this.totalPages() - 1);
}