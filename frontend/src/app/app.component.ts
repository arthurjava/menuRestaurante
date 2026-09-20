import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingService } from "./core/services/loading.service";
import { NotificationComponent } from "./shared/components/notification/notification.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatProgressBarModule, NotificationComponent],
  template: `
    <app-notification />
    <mat-progress-bar
      *ngIf="loadingService.isLoading()"
      mode="indeterminate"
      class="fixed top-0 left-0 right-0 z-50 h-1"
      color="primary"
    />
    <router-outlet />
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(public loadingService: LoadingService) {}
}
