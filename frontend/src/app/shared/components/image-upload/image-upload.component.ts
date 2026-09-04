import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ImageFile {
  file: File;
  preview: string;
  primary?: boolean;
  id?: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div 
        class="drop-zone" 
        [class.active]="dragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input 
          #fileInput 
          type="file" 
          accept="image/*" 
          multiple 
           
          (change)="onFileSelect($event)"
          class="hidden"
        >
        <div class="drop-zone-icon">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p class="drop-zone-text">Clique ou arraste imagens aqui</p>
        <p class="drop-zone-hint">PNG, JPG até 5MB. Máximo {{ maxFiles() }} imagens.</p>
      </div>

      @if (images().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          @for (image of images(); track image.id || image.preview; let i = $index) {
            <div class="image-preview relative group">
              <img [src]="image.preview" [alt]="'Imagem ' + (i + 1)" />
              
              @if (image.primary) {
                <span class="absolute top-1 left-1 badge badge-success text-xs">Principal</span>
              }
              
              <button
                type="button"
                class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                (click)="removeImage(i); $event.stopPropagation()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              @if (!image.primary && allowPrimary()) {
                <button
                  type="button"
                  class="absolute bottom-1 left-1 bg-primary-600 text-white rounded-full p-1 text-xs hover:bg-primary-700 transition-colors opacity-0 group-hover:opacity-100"
                  (click)="setPrimary(i); $event.stopPropagation()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              }

              @if (reorderable()) {
                <button
                  type="button"
                  class="absolute bottom-1 right-1 bg-gray-600 text-white rounded-full p-1 text-xs hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                  (mousedown)="startDrag(i, $event)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                  </svg>
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ImageUploadComponent {
  images = input<ImageFile[]>([]);
  maxFiles = input(5);
  allowPrimary = input(true);
  reorderable = input(false);
  accept = input('image/*');

  imagesChange = output<ImageFile[]>();
  primaryChange = output<number>();
  reorder = output<ImageFile[]>();

  dragging = signal(false);
  dragIndex = signal<number | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging.set(false);
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);
    input.value = '';
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter(f => this.validateFile(f));
    const remainingSlots = this.maxFiles() - this.images().length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newImages: ImageFile[] = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      primary: this.images().length === 0 && this.allowPrimary()
    }));

    this.updateImages([...this.images(), ...newImages]);
  }

  private validateFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(`Tipo de arquivo inválido: ${file.name}. Use JPEG, PNG ou WebP.`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(`Arquivo muito grande: ${file.name}. Máximo 5MB.`);
      return false;
    }
    return true;
  }

  removeImage(index: number): void {
    const newImages = [...this.images()];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    this.updateImages(newImages);
  }

  setPrimary(index: number): void {
    const newImages = this.images().map((img, i) => ({
      ...img,
      primary: i === index
    }));
    this.updateImages(newImages);
    this.primaryChange.emit(index);
  }

  startDrag(index: number, event: MouseEvent): void {
    if (!this.reorderable()) return;
    this.dragIndex.set(index);
    event.preventDefault();
  }

  private updateImages(newImages: ImageFile[]): void {
    this.imagesChange.emit(newImages);
  }
}