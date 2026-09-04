import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Meu Perfil</h2>
      <p>Visualização do perfil em desenvolvimento.</p>
    </div>
  `
})
export class ProfileComponent {}