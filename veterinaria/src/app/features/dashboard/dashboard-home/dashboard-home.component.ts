import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Cita } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

interface ProximaCita {
  fechaHora: string;
  mascota: string;
  tutor: string;
  servicio: string;
  veterinario: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: false,
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css',
})
export class DashboardHomeComponent {
  private readonly store = inject(VeterinariaStoreService);
  private readonly destroyRef = inject(DestroyRef);

  citasPendientes = 0;
  citasConfirmadas = 0;
  espaciosDisponiblesHoy = 0;
  proximaCita: ProximaCita | null = null;

  constructor() {
    this.store.citas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshStats());
    this.refreshStats();
  }

  private refreshStats(): void {
    const citas = this.store.getCitasSnapshot();
    const hoy = new Date().toISOString().slice(0, 10);

    this.citasPendientes = citas.filter(cita => cita.estado === 'pendiente').length;
    this.citasConfirmadas = citas.filter(cita => cita.estado === 'confirmada').length;
    this.espaciosDisponiblesHoy = this.store.obtenerHorariosDisponibles(hoy).length;
    this.proximaCita = this.buildNextAppointment(citas, this.store.getMascotasSnapshot());
  }

  private buildNextAppointment(citas: Cita[], mascotas: Mascota[]): ProximaCita | null {
    const ahora = new Date().toISOString();
    const mapaMascotas = new Map(mascotas.map(mascota => [mascota.id, mascota]));
    const proxima = citas
      .filter(cita => cita.fechaHora >= ahora && cita.estado !== 'cancelada')
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))[0];

    if (!proxima) {
      return null;
    }

    const mascota = mapaMascotas.get(proxima.mascotaId);

    return {
      fechaHora: proxima.fechaHora,
      mascota: mascota?.nombre ?? 'Mascota sin registro',
      tutor: mascota?.dueno.nombreCompleto ?? 'Tutor no disponible',
      servicio: proxima.tipoServicio,
      veterinario: proxima.veterinario,
    };
  }
}
