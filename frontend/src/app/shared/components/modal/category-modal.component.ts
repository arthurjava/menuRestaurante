import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy, HostBinding, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';

export interface CategoryFormData {
  name: string;
  description: string;
  active: boolean;
  displayOrder: number;
  displayInMenu: boolean;
}

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatCheckboxModule, ButtonComponent, InputComponent],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" @fadeIn>
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          (click)="onBackdropClick()">
        </div>

        <!-- Modal Container -->
        <div
          class="relative w-full max-w-md bg-white rounded-xl shadow-xl transform transition-all"
          @slideUp>
          
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-indigo-600">category</mat-icon>
                <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
              </div>
              <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              (click)="cancel()"
              aria-label="Fechar modal">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="form" class="p-4 space-y-4" (ngSubmit)="onSubmit()">
            <app-input
              formControlName="name"
              label="Nome"
              type="text"
              placeholder="Ex: Pratos Principais"
              [error]="nameError()">
            </app-input>

            <app-input
              formControlName="description"
              label="Descrição"
              type="text"
              placeholder="Descrição da categoria"
              [error]="descriptionError()">
            </app-input>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer flex-1">
                <input type="checkbox" formControlName="active" class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
                <span class="text-sm text-gray-600">Categoria ativa</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer flex-1">
                <input type="checkbox" formControlName="displayInMenu" class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
                <span class="text-sm text-gray-600">Exibir no cardápio público</span>
              </label>
            </div>

            <div>
              <label class="label">Ordem de exibição</label>
              <input
                type="number"
                formControlName="displayOrder"
                class="input w-24"
                min="0"
                step="1" />
            </div>
          </form>

          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <app-button
              variant="secondary"
              label="Cancelar"
              (clicked)="cancel()">
            </app-button>
            <app-button
              variant="primary"
              [label]="confirmLabel()"
              [loading]="confirmLoading()"
              [disabled]="form.invalid || confirmLoading()"
              type="submit"
              (clicked)="onSubmit()">
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host(.hidden) {
      display: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .fade-in { animation: fadeIn 0.2s ease-out; }
    .slide-up { animation: slideUp 0.2s ease-out; }
  `],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryModalComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();

  // Content
  title = input<string>('Nova Categoria');
  description = input<string>('Preencha os dados para criar uma nova categoria');
  confirmLabel = input<string>('Criar categoria');
  confirmLoading = input<boolean>(false);

  // Initial data for editing
  initialData = input<CategoryFormData | null>(null);

  // Events
  confirmed = output<CategoryFormData>();
  cancelled = output<void>();
  closed = output<void>();

  private fb = inject(FormBuilder);
  private _wasOpen = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    active: [true],
    displayOrder: [0, [Validators.min(0)]],
    displayInMenu: [true]
  });

  @HostBinding('class.hidden')
  get isHidden(): boolean {
    return !this.isOpen();
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open !== this._wasOpen()) {
        this._wasOpen.set(open);
        this.isOpenChange.emit(open);
      }
    });

    effect(() => {
      const data = this.initialData();
      if (data) {
        this.form.patchValue(data, { emitEvent: false });
      } else {
        this.form.reset({ name: '', description: '', active: true, displayOrder: 0, displayInMenu: true }, { emitEvent: false });
      }
    });
  }

  onBackdropClick(): void {
    this.cancel();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  close(): void {
    this.isOpenChange.emit(false);
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.confirmLoading()) return;
    this.confirmed.emit(this.form.value as CategoryFormData);
  }

  nameError = computed(() => {
    const control = this.form.get('name');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  descriptionError = computed(() => {
    const control = this.form.get('description');
    if (control?.touched && control?.errors?.['maxlength']) {
      return 'Descrição deve ter no máximo 500 caracteres';
    }
    return '';
  });
}