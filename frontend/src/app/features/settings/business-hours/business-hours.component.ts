import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-business-hours',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Horário de Funcionamento</h2>
      <p>Configurações de horário em desenvolvimento.</p>
    </div>
  `
})
export class BusinessHoursComponent {}