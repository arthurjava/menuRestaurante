import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryImage {
  url: string;
  alt?: string;
  primary?: boolean;
}

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (images().length > 0) {
      <div class="space-y-3">
        <div class="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            [src]="selectedImage()"
            [alt]="selectedAlt()"
            class="w-full h-full object-cover"
            (error)="onImageError($event)"
          />
          @if (images().length > 1) {
            <button
              type="button"
              class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              (click)="openLightbox()"
              aria-label="Abrir em tela cheia"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </button>
          }
        </div>

        @if (images().length > 1) {
          <div class="flex gap-2 overflow-x-auto pb-2">
            @for (image of images(); track image.url; let i = $index) {
              <button
                type="button"
                class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
                [class.border-primary-500]="selectedIndex() === i"
                [class.border-transparent]="selectedIndex() !== i"
                (click)="selectImage(i)"
                [attr.aria-label]="'Imagem ' + (i + 1)"
                [attr.aria-current]="selectedIndex() === i ? 'true' : 'false'"
              >
                <img
                  [src]="image.url"
                  [alt]="image.alt || 'Miniatura ' + (i + 1)"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                @if (image.primary) {
                  <span class="absolute top-1 right-1 badge badge-success text-xs">Principal</span>
                }
              </button>
            }
          </div>
        }
      </div>
    }
  `
})
export class ImageGalleryComponent {
  images = input<GalleryImage[]>([]);
  imageSelect = output<number>();
  lightboxOpen = output<string[]>();

  selectedIndex = signal(0);

  selectedImage = computed(() => this.images()[this.selectedIndex()]?.url || '');
  selectedAlt = computed(() => this.images()[this.selectedIndex()]?.alt || '');

  selectImage(index: number): void {
    this.selectedIndex.set(index);
    this.imageSelect.emit(index);
  }

  openLightbox(): void {
    this.lightboxOpen.emit(this.images().map(img => img.url));
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2VtIG5hw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
  }
}