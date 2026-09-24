import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  HostListener,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  isMain?: boolean;
}
@Component({
  selector: "app-image-gallery",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="image-gallery">
      @if (images().length > 0) {
        <!-- Main Image -->
        <div class="main-image-container" (click)="openFullscreen(0)">
          <img
            [src]="currentImage().url"
            [alt]="currentImage().alt"
            crossorigin="anonymous"
            class="main-image"
            loading="lazy"
          />
          @if (images().length > 1) {
            <button
              type="button"
              class="fullscreen-btn"
              (click)="openFullscreen(currentIndex())"
              aria-label="Ver em tela cheia"
              matTooltip="Ver em tela cheia"
            >
              <span aria-hidden="true">⛶</span>
            </button>
          }
          @if (currentImage().isMain) {
            <span class="main-badge">Principal</span>
          }
        </div>

        <!-- Thumbnails -->
        @if (images().length > 1) {
          <div class="thumbnails" role="list" aria-label="Miniaturas">
            @for (image of images(); track image.id; let i = $index) {
              <button
                type="button"
                class="thumbnail"
                [class.active]="currentIndex() === i"
                [class.main]="image.isMain"
                (click)="setCurrent(i)"
                (keydown.enter)="setCurrent(i)"
                (keydown.space)="$event.preventDefault(); setCurrent(i)"
                role="listitem"
                [attr.aria-label]="
                  'Imagem ' + (i + 1) + (image.isMain ? ' (principal)' : '')
                "
                [attr.aria-current]="currentIndex() === i ? 'true' : 'false'"
              >
                <img
                  [src]="image.thumbnailUrl ?? image.url"
                  [alt]="image.alt"
                  crossorigin="anonymous"
                  loading="lazy"
                />
                @if (image.isMain) {
                  <span class="thumbnail-main-indicator"> </span>
                }
              </button>
            }
          </div>
        }
      } @else {
        <!-- Empty State -->
        <div class="empty-gallery">
          <p class="mt-2 text-gray-500">{{ emptyMessage() }}</p>
        </div>
      }
    </div>

    <!-- Fullscreen Modal -->
    @if (fullscreenOpen()) {
      <div
        class="fullscreen-overlay"
        (click)="closeFullscreen()"
        role="dialog"
        aria-modal="true"
        aria-label="Visualização em tela cheia"
      >
        <button
          type="button"
          class="fullscreen-close"
          (click)="closeFullscreen()"
          aria-label="Fechar"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <button
          type="button"
          class="fullscreen-nav prev"
          (click)="navigate(-1)"
          [disabled]="currentFullscreenIndex() === 0"
          aria-label="Imagem anterior"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div class="fullscreen-image-container">
          <img
            [src]="images()[currentFullscreenIndex()]?.url"
            [alt]="images()[currentFullscreenIndex()]?.alt"
            crossorigin="anonymous"
            class="fullscreen-image"
          />
        </div>

        <button
          type="button"
          class="fullscreen-nav next"
          (click)="navigate(1)"
          [disabled]="currentFullscreenIndex() === images().length - 1"
          aria-label="Próxima imagem"
        >
          <span aria-hidden="true">›</span>
        </button>

        <div class="fullscreen-counter">
          {{ currentFullscreenIndex() + 1 }} / {{ images().length }}
        </div>
      </div>
    }
  `,
  styles: [
    `
      .image-gallery {
        @apply w-full;
      }
      .main-image-container {
        @apply relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-pointer;
      }
      .main-image {
        @apply w-full h-full object-cover transition-transform duration-300 hover:scale-105;
      }
      .fullscreen-btn {
        @apply absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-900;
      }
      .main-image-container:hover .fullscreen-btn {
        @apply opacity-100;
      }
      .main-badge {
        @apply absolute bottom-3 left-3 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full;
      }
      .thumbnails {
        @apply flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin-custom;
      }
      .thumbnail {
        @apply relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent transition-all duration-200 cursor-pointer hover:border-indigo-300;
      }
      .thumbnail.active {
        @apply border-indigo-500 ring-2 ring-indigo-500 ring-offset-2;
      }
      .thumbnail.main {
        @apply border-yellow-400;
      }
      .thumbnail img {
        @apply w-full h-full object-cover;
      }
      .thumbnail-main-indicator {
        @apply absolute bottom-1 right-1 p-1 bg-yellow-500 text-white rounded-full;
      }
      .empty-gallery {
        @apply aspect-[4/3] rounded-xl bg-gray-100 flex flex-col items-center justify-center text-center p-8;
      }
      /* Fullscreen */
      .fullscreen-overlay {
        @apply fixed inset-0 bg-black/95 z-50 flex items-center justify-center;
      }
      .fullscreen-close {
        @apply absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10;
      }
      .fullscreen-nav {
        @apply absolute top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed;
      }
      .fullscreen-nav.prev {
        @apply left-4;
      }
      .fullscreen-nav.next {
        @apply right-4;
      }
      .fullscreen-image-container {
        @apply max-h-[80vh] max-w-[90vw] flex items-center justify-center;
      }
      .fullscreen-image {
        @apply max-h-[80vh] max-w-[90vw] object-contain;
      }
      .fullscreen-counter {
        @apply absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm;
      }
      @media (max-width: 640px) {
        .fullscreen-nav {
          @apply p-2;
        }
        .fullscreen-nav.prev {
          @apply left-2;
        }
        .fullscreen-nav.next {
          @apply right-2;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
  images = input<GalleryImage[]>([]);
  emptyMessage = input<string>("Nenhuma imagem disponível");
  aspectRatio = input<string>("4/3");
  imageSelected = output<number>();
  currentIndex = signal(0);
  fullscreenOpen = signal(false);
  currentFullscreenIndex = signal(0);
  currentImage = computed(() => {
    const idx = this.currentIndex();
    return this.images()[idx] ?? this.images()[0];
  });
  constructor() {
    effect(() => {
      if (
        this.images().length > 0 &&
        this.currentIndex() >= this.images().length
      ) {
        this.currentIndex.set(0);
      }
    });
  }
  setCurrent(index: number): void {
    if (index >= 0 && index < this.images().length) {
      this.currentIndex.set(index);
      this.imageSelected.emit(index);
    }
  }
  openFullscreen(index: number): void {
    this.currentFullscreenIndex.set(index);
    this.fullscreenOpen.set(true);
    document.body.style.overflow = "hidden";
  }
  closeFullscreen(): void {
    this.fullscreenOpen.set(false);
    document.body.style.overflow = "";
  }
  navigate(direction: number): void {
    const newIndex = this.currentFullscreenIndex() + direction;
    if (newIndex >= 0 && newIndex < this.images().length) {
      this.currentFullscreenIndex.set(newIndex);
    }
  }
  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.fullscreenOpen()) {
      this.closeFullscreen();
    }
  }
  @HostListener("document:keydown.arrow-left")
  onArrowLeft(): void {
    if (this.fullscreenOpen()) {
      this.navigate(-1);
    }
  }
  @HostListener("document:keydown.arrow-right")
  onArrowRight(): void {
    if (this.fullscreenOpen()) {
      this.navigate(1);
    }
  }
}
