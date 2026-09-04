import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Informações do Restaurante</h2>
      <p>Configurações do restaurante em desenvolvimento.</p>
    </div>
  `
})
export class RestaurantInfoComponent {}