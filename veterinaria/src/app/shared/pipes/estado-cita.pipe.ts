import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCita } from '../../core/models/cita.model';

@Pipe({
  name: 'estadoCita',
  standalone: false,
})
export class EstadoCitaPipe implements PipeTransform {
  transform(value: EstadoCita): string {
    const labels: Record<EstadoCita, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };

    return labels[value];
  }
}
