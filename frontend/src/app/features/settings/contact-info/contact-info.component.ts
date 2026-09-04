import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Informações de Contato</h2>
      <p>Configurações de contato em desenvolvimento.</p>
    </div>
  `
})
export class ContactInfoComponent {}