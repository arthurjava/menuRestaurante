import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from './core/services/notification.service';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent, LoadingSpinnerComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <div class="page-container">
      <router-outlet></router-outlet>
    </div>
    
    @for (toast of notificationService.toasts(); track toast.id) {
      <app-toast [toast]="toast" (remove)="notificationService.remove($event)"></app-toast>
    }

    @if (loadingService.isLoading()) {
      <app-loading-spinner [overlay]="true" size="lg"></app-loading-spinner>
    }
  `
})
export class AppComponent {
  constructor(
    public notificationService: NotificationService,
    public loadingService: LoadingService
  ) {}
}