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

  totalMascotas = 0;
  citasPendientes = 0;
  espaciosDisponiblesHoy = 0;
  proximaCita: ProximaCita | null = null;

  readonly servicios = [
    {
      nombre: 'Consulta general',
      descripcion: 'Evaluacion preventiva, diagnostico clinico y seguimiento de bienestar.',
    },
    {
      nombre: 'Vacunacion y desparasitacion',
      descripcion: 'Protocolos actualizados para cachorros, adultos y pacientes senior.',
    },
    {
      nombre: 'Laboratorio y control',
      descripcion: 'Perfil completo para monitoreo de tratamientos y chequeos anuales.',
    },
    {
      nombre: 'Urgencias coordinadas',
      descripcion: 'Atencion prioritaria y triage para casos que no pueden esperar.',
    },
  ];

  readonly especialistas = [
    'Dra. Valeria Rojas - Medicina interna',
    'Dr. Mateo Salinas - Cirugia y trauma',
    'Dra. Camila Paredes - Dermatologia',
    'Dr. Diego Mena - Odontologia veterinaria',
  ];

  readonly beneficios = [
    'Reserva de citas en minutos con horarios visibles por dia.',
    'Seguimiento de mascotas, historial y contacto del tutor desde un mismo lugar.',
    'Agenda organizada por disponibilidad real para evitar cruces de horario.',
  ];

  constructor() {
    this.store.mascotas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshStats());
    this.store.citas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshStats());
    this.refreshStats();
  }

  private refreshStats(): void {
    const mascotas = this.store.getMascotasSnapshot();
    const citas = this.store.getCitasSnapshot();
    const hoy = new Date().toISOString().slice(0, 10);

    this.totalMascotas = mascotas.length;
    this.citasPendientes = citas.filter(cita => ['pendiente', 'confirmada'].includes(cita.estado)).length;
    this.espaciosDisponiblesHoy = this.store.obtenerHorariosDisponibles(hoy).length;
    this.proximaCita = this.buildNextAppointment(citas, mascotas);
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
