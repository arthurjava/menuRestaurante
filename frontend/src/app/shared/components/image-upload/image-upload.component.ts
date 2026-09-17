import { Component, input, output, signal, computed, effect, viewChild, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ImageUploadService, UploadedImage } from '../../../core/services/image-upload.service';
import { ButtonComponent } from '../button/button.component';

export interface ImageFile {
  file: File;
  preview: string;
  progress: number;
  uploaded: boolean;
  serverId?: string;
  isMain: boolean;
  error?: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    DragDropModule,
    ButtonComponent
  ],
  template: `
    <div class="image-upload">
      <!-- Drop Zone -->
      <div
        class="drop-zone"
        [class.dragover]="isDragover()"
        [class.has-images]="images().length > 0"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        role="button"
        tabindex="0"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="$event.preventDefault(); fileInput.click()"
        aria-label="Área de upload de imagens">
        
        <input
          #fileInput
          type="file"
          accept="image/*"
          multiple
          (change)="onFileSelect($event)"
          class="sr-only"
          [attr.max]="maxFiles()"
        />

        @if (images().length === 0) {
          <div class="drop-zone-content">
            <mat-icon class="text-4xl text-gray-300">cloud_upload</mat-icon>
            <p class="mt-2 text-gray-600">
              Arraste e solte imagens aqui ou clique para selecionar
            </p>
            <p class="text-sm text-gray-400 mt-1">
              JPEG, PNG, WebP • Máx. {{ maxFileSizeMB() }}MB • Até {{ maxFiles() }} arquivos
            </p>
          </div>
        }
      </div>

      <!-- Image Previews -->
      @if (images().length > 0) {
        <div class="image-previews" cdkDropList (cdkDropListDropped)="onReorder($event)">
          @for (image of images(); track $index) {
            <div
              class="image-preview"
              [class.main]="image.isMain"
              [class.uploading]="!image.uploaded && !image.error"
              [class.error]="!!image.error"
              cdkDrag
              [cdkDragData]="$index">
              
              <div class="image-container relative">
                @if (image.uploaded && image.serverId) {
                  <img [src]="image.preview" [alt]="'Imagem ' + ($index + 1)" class="w-full h-32 object-cover rounded-lg" />
                } @else {
                  <img [src]="image.preview" [alt]="'Imagem ' + ($index + 1)" class="w-full h-32 object-cover rounded-lg" />
                }

                <!-- Progress Bar -->
                @if (!image.uploaded && !image.error) {
                  <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                    <div class="h-full bg-indigo-600 transition-all duration-300" [style.width.%]="image.progress"></div>
                  </div>
                }

                <!-- Main Badge -->
                @if (image.isMain) {
                  <div class="absolute top-2 left-2">
                    <span class="badge badge-info">Principal</span>
                  </div>
                }

                <!-- Error Badge -->
                @if (image.error) {
                  <div class="absolute top-2 left-2">
                    <span class="badge badge-danger">Erro</span>
                  </div>
                }

                <!-- Actions Overlay -->
                <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg p-2">
                  @if (!image.isMain) {
                    <button
                      type="button"
                      class="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
                      (click)="setAsMain($index)"
                      matTooltip="Definir como principal"
                      aria-label="Definir como principal">
                      <mat-icon class="text-indigo-600">star</mat-icon>
                    </button>
                  } @else {
                    <button
                      type="button"
                      class="p-2 bg-white rounded-lg shadow"
                      disabled
                      matTooltip="Imagem principal">
                      <mat-icon class="text-yellow-500">star</mat-icon>
                    </button>
                  }

                  <button
                    type="button"
                    class="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
                    (click)="removeImage($index)"
                    matTooltip="Remover"
                    aria-label="Remover imagem">
                    <mat-icon class="text-red-600">delete</mat-icon>
                  </button>
                </div>
              </div>

              @if (image.error) {
                <p class="text-xs text-red-600 mt-1 text-center">{{ image.error }}</p>
              }
            </div>
          }
        </div>

        <!-- Upload Button -->
        @if (hasPendingUploads()) {
          <div class="upload-actions">
            <app-button
              variant="primary"
              [label]="'Enviar ' + pendingCount() + ' imagem(ns)'"
              [loading]="uploading()"
              (clicked)="uploadAll()">
            </app-button>
            <app-button
              variant="secondary"
              [label]="'Limpar tudo'"
              (clicked)="clearAll()">
            </app-button>
          </div>
        }
      }

      <!-- Hidden input for accessibility -->
      <input #fileInput type="file" accept="image/*" multiple class="sr-only" (change)="onFileSelect($event)" />
    </div>
  `,
  styles: [`
    .image-upload {
      @apply w-full;
    }

    .drop-zone {
      @apply border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50;
    }

    .drop-zone.dragover {
      @apply border-indigo-500 bg-indigo-50 bg-opacity-50;
    }

    .drop-zone.has-images {
      @apply border-transparent p-0 min-h-0;
    }

    .drop-zone-content {
      @apply py-8;
    }

    .image-previews {
      @apply flex flex-wrap gap-3 p-3;
    }

    .image-preview {
      @apply relative w-32 h-32 flex-shrink-0 cursor-grab;
    }

    .image-preview:active {
      @apply cursor-grabbing;
    }

    .image-preview.main {
      @apply ring-2 ring-indigo-500 ring-offset-2;
    }

    .image-preview.uploading {
      @apply opacity-75;
    }

    .image-preview.error {
      @apply ring-2 ring-red-500 ring-offset-2;
    }

    .image-container {
      @apply relative w-full h-full rounded-lg overflow-hidden;
    }

    .image-container img {
      @apply w-full h-full object-cover;
    }

    .badge {
      @apply inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium;
    }

    .badge-info {
      @apply bg-blue-100 text-blue-800;
    }

    .badge-danger {
      @apply bg-red-100 text-red-800;
    }

    .upload-actions {
      @apply flex items-center justify-end gap-3 p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl;
    }

    /* CDK Drag styles */
    .cdk-drag-preview {
      @apply shadow-lg-custom;
    }

    .cdk-drag-placeholder {
      @apply opacity-0;
    }

    .cdk-drag-animating {
      @apply transition-transform duration-200;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadComponent {
  private imageUploadService = inject(ImageUploadService);

  // Inputs
  dishId = input<string>('');
  maxFiles = input<number>(5);
  maxFileSizeMB = input<number>(5);
  existingImages = input<UploadedImage[]>([]);
  uploadUrl = input<string>('');

  // Outputs
  imagesChange = output<ImageFile[]>();
  uploadComplete = output<UploadedImage[]>();
  uploadError = output<string>();
  mainImageChange = output<number>();

  // Internal state
  images = signal<ImageFile[]>([]);
  isDragover = signal(false);
  uploading = signal(false);

  computedHasPending = computed(() => 
    this.images().some(img => !img.uploaded && !img.error)
  );

  pendingCount = computed(() => 
    this.images().filter(img => !img.uploaded && !img.error).length
  );

  hasPendingUploads = computed(() => this.pendingCount() > 0);

  constructor() {
    effect(() => {
      const existing = this.existingImages();
      if (existing.length > 0) {
        const converted: ImageFile[] = existing.map((img, index) => ({
          file: new File([], img.filename),
          preview: img.url,
          progress: 100,
          uploaded: true,
          serverId: img.id,
          isMain: img.isMain
        }));
        this.images.set(converted);
        this.imagesChange.emit(this.images());
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(input.files);
    }
    input.value = '';
  }

  private processFiles(files: FileList): void {
    const currentCount = this.images().length;
    const availableSlots = this.maxFiles() - currentCount;

    if (availableSlots <= 0) {
      this.uploadError.emit(`Máximo de ${this.maxFiles()} imagens permitidas`);
      return;
    }

    const filesArray = Array.from(files).slice(0, availableSlots);
    const newImages: ImageFile[] = [];

    for (const file of filesArray) {
      const validation = this.imageUploadService.validateImageFile(file);
      if (!validation.valid) {
        this.uploadError.emit(validation.error!);
        continue;
      }

      this.imageUploadService.createImagePreview(file).then(preview => {
        newImages.push({
          file,
          preview,
          progress: 0,
          uploaded: false,
          isMain: this.images().length === 0 && newImages.length === 0
        });
        this.images.update(current => [...current, ...newImages]);
        this.imagesChange.emit(this.images());
      });
    }
  }

  async uploadAll(): Promise<void> {
    if (!this.dishId() || this.pendingCount() === 0) return;

    this.uploading.set(true);
    const pendingImages = this.images().filter(img => !img.uploaded && !img.error);

    try {
      for (let i = 0; i < pendingImages.length; i++) {
        const img = pendingImages[i];
        const index = this.images().findIndex(x => x === img);
        
        this.uploading.set(true);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          this.images.update(current => {
            const updated = [...current];
            if (updated[index]) {
              updated[index] = { ...updated[index], progress: Math.min(updated[index].progress + 10, 90) };
            }
            return updated;
          });
        }, 100);

        try {
          // Upload using service
          const formData = new FormData();
          formData.append('files', img.file);
          
          const response = await this.imageUploadService.uploadImages(this.dishId(), new DataTransfer().files).toPromise();
          
          clearInterval(progressInterval);
          
          this.images.update(current => {
            const updated = [...current];
            if (updated[index]) {
              updated[index] = {
                ...updated[index],
                progress: 100,
                uploaded: true,
                serverId: response?.[0]?.id,
                error: undefined
              };
            }
            return updated;
          });
        } catch (error) {
          clearInterval(progressInterval);
          this.images.update(current => {
            const updated = [...current];
            if (updated[index]) {
              updated[index] = {
                ...updated[index],
                progress: 0,
                error: 'Falha no upload. Tente novamente.'
              };
            }
            return updated;
          });
        }
      }

      this.uploadComplete.emit(
        this.images().filter(img => img.uploaded).map(img => ({
          id: img.serverId!,
          url: img.preview,
          filename: img.file.name,
          displayOrder: 0,
          isMain: img.isMain
        }))
      );
    } finally {
      this.uploading.set(false);
    }
  }

  removeImage(index: number): void {
    const image = this.images()[index];
    
    if (image.uploaded && image.serverId && this.dishId()) {
      this.imageUploadService.removeImage(image.serverId).subscribe({
        next: () => this.removeImageLocal(index),
        error: () => this.uploadError.emit('Erro ao remover imagem')
      });
    } else {
      this.removeImageLocal(index);
    }
  }

  private removeImageLocal(index: number): void {
    const wasMain = this.images()[index]?.isMain;
    this.images.update(current => current.filter((_, i) => i !== index));
    
    // If removed was main, set first as main
    if (wasMain && this.images().length > 0) {
      this.images.update(current => 
        current.map((img, i) => ({ ...img, isMain: i === 0 }))
      );
      this.mainImageChange.emit(0);
    }
    
    this.imagesChange.emit(this.images());
  }

  setAsMain(index: number): void {
    this.images.update(current => 
      current.map((img, i) => ({ ...img, isMain: i === index }))
    );
    this.mainImageChange.emit(index);
    this.imagesChange.emit(this.images());
  }

  onReorder(event: CdkDragDrop<ImageFile[]>): void {
    this.images.update(current => {
      const updated = [...current];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated;
    });
    this.imagesChange.emit(this.images());
  }

  clearAll(): void {
    this.images.set([]);
    this.imagesChange.emit([]);
  }
}