import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

export interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  preview: string;
  isMain: boolean;
  uploading: boolean;
  progress: number;
  error?: string;
}

export interface ImageUploadFieldConfig {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  allowReorder?: boolean;
  allowMainSelection?: boolean;
  showDelete?: boolean;
  compact?: boolean;
}

@Component({
  selector: 'app-image-upload-field',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, MatMenuModule, DragDropModule],
  templateUrl: './image-upload-field.component.html',
  styleUrl: './image-upload-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadFieldComponent {
  @Input() images: UploadedImage[] = [];
  @Input() config: ImageUploadFieldConfig = {};
  @Input() label = 'Imagens';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() errorMessage = '';

  @Output() imagesChange = new EventEmitter<UploadedImage[]>();
  @Output() mainImageChange = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly defaultConfig = signal<ImageUploadFieldConfig>({
    maxFiles: 10,
    maxSizeMB: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowReorder: true,
    allowMainSelection: true,
    showDelete: true,
    compact: false,
  });

  readonly mergedConfig = computed(() => ({
    ...this.defaultConfig(),
    ...this.config,
  }));

  readonly mainImageId = computed(() => this.images.find(img => img.isMain)?.id || '');

  readonly canAddMore = computed(() => this.images.length < this.mergedConfig().maxFiles!);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  private processFiles(files: File[]): void {
    if (this.disabled) return;

    const validFiles = files.filter(file => this.validateFile(file));
    const remainingSlots = this.mergedConfig().maxFiles! - this.images.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const newImage: UploadedImage = {
        id: crypto.randomUUID(),
        file,
        url: '',
        preview: URL.createObjectURL(file),
        isMain: this.images.length === 0,
        uploading: false,
        progress: 0,
      };
      this.images = [...this.images, newImage];
    });

    this.emitChange();
  }

  validateFile(file: File): boolean {
    const config = this.mergedConfig();
    
    if (!config.acceptedTypes!.includes(file.type)) {
      this.errorMessage = `Tipo de arquivo não suportado: ${file.type}`;
      return false;
    }

    const maxSizeBytes = config.maxSizeMB! * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.errorMessage = `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máx: ${config.maxSizeMB}MB)`;
      return false;
    }

    return true;
  }

  removeImage(imageId: string): void {
    const image = this.images.find(img => img.id === imageId);
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }
    const wasMain = image?.isMain;
    this.images = this.images.filter(img => img.id !== imageId);
    
    if (wasMain && this.images.length > 0) {
      this.images[0] = { ...this.images[0], isMain: true };
    }
    
    this.emitChange();
  }

  setMainImage(imageId: string): void {
    this.images = this.images.map(img => ({
      ...img,
      isMain: img.id === imageId,
    }));
    this.emitChange();
    this.mainImageChange.emit(imageId);
  }

  onReorder(event: CdkDragDrop<UploadedImage[]>): void {
    if (!this.mergedConfig().allowReorder) return;
    const newImages = [...this.images];
    moveItemInArray(newImages, event.previousIndex, event.currentIndex);
    this.images = newImages;
    this.emitChange();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  private emitChange(): void {
    this.imagesChange.emit([...this.images]);
  }

  protected readonly maxFiles = computed(() => this.mergedConfig().maxFiles);
  protected readonly compact = computed(() => this.mergedConfig().compact);
}