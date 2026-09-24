import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-public-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: "./public-layout.component.html",
  styleUrl: "./public-layout.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentYear = new Date().getFullYear();

  readonly userInitials = () => {
    const name = this.user()?.name || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  logout(): void {
    this.authService.logout();
  }
}
