import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-footer.component.html',
  styleUrl: './admin-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly version = '1.0.0';
}