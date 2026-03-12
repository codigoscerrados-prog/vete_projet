import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AgendaScheduler } from '../classes/agenda-scheduler';
import { Cita, CitaDraft, DayAvailability, EstadoCita } from '../models/cita.model';
import { Mascota, MascotaDraft } from '../models/mascota.model';
import { LocalStorageService } from './local-storage.service';

interface CreateCitaResult {
  ok: boolean;
  message: string;
}

interface PublicAppointmentDraft {
  mascota: MascotaDraft;
  cita: Omit<CitaDraft, 'mascotaId'>;
}

@Injectable({ providedIn: 'root' })
export class VeterinariaStoreService {
  private static readonly MASCOTAS_KEY = 'veterinaria_mascotas';
  private static readonly CITAS_KEY = 'veterinaria_citas';

  private readonly scheduler = new AgendaScheduler();
  private readonly mascotasSubject = new BehaviorSubject<Mascota[]>([]);
  private readonly citasSubject = new BehaviorSubject<Cita[]>([]);

  readonly mascotas$ = this.mascotasSubject.asObservable();
  readonly citas$ = this.citasSubject.asObservable();

  constructor(private readonly storage: LocalStorageService) {
    this.loadFromStorage();
  }

  getMascotasSnapshot(): Mascota[] {
    return [...this.mascotasSubject.value].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  getMascotaById(mascotaId: string): Mascota | undefined {
    return this.mascotasSubject.value.find(mascota => mascota.id === mascotaId);
  }

  registrarMascota(draft: MascotaDraft): Mascota {
    const mascota: Mascota = {
      id: this.buildId('mas'),
      ...draft,
      createdAt: new Date().toISOString(),
    };

    const updated = [...this.mascotasSubject.value, mascota];
    this.mascotasSubject.next(updated);
    this.persistMascotas(updated);

    return mascota;
  }

  registrarCitaPublica(draft: PublicAppointmentDraft): CreateCitaResult {
    const mascotaExistente = this.findMascotaByOwnerAndName(
      draft.mascota.nombre,
      draft.mascota.dueno.email,
      draft.mascota.dueno.nombreCompleto,
    );

    const mascota = mascotaExistente ?? this.registrarMascota(draft.mascota);

    return this.registrarCita({
      mascotaId: mascota.id,
      ...draft.cita,
    });
  }

  registrarCita(draft: CitaDraft): CreateCitaResult {
    const mascota = this.getMascotaById(draft.mascotaId);
    if (!mascota) {
      return { ok: false, message: 'Debes seleccionar una mascota valida.' };
    }

    const existeCruce = this.citasSubject.value.some(
      cita => cita.fechaHora === draft.fechaHora && cita.estado !== 'cancelada',
    );

    if (existeCruce) {
      return { ok: false, message: 'Ese horario ya no esta disponible.' };
    }

    const nuevaCita: Cita = {
      id: this.buildId('cit'),
      mascotaId: draft.mascotaId,
      fechaHora: draft.fechaHora,
      motivo: draft.motivo.trim(),
      tipoServicio: draft.tipoServicio.trim(),
      veterinario: draft.veterinario.trim(),
      telefonoContacto: draft.telefonoContacto.trim(),
      emailContacto: draft.emailContacto.trim().toLowerCase(),
      notas: draft.notas.trim(),
      estado: 'pendiente',
      resumenAtencion: '',
      createdAt: new Date().toISOString(),
    };

    const updated = [...this.citasSubject.value, nuevaCita].sort((a, b) =>
      a.fechaHora.localeCompare(b.fechaHora),
    );

    this.citasSubject.next(updated);
    this.persistCitas(updated);

    return { ok: true, message: 'Cita registrada correctamente.' };
  }

  actualizarEstadoCita(citaId: string, estado: EstadoCita, resumenAtencion = ''): boolean {
    let wasUpdated = false;
    const updated = this.citasSubject.value.map(cita => {
      if (cita.id !== citaId) {
        return cita;
      }

      wasUpdated = true;
      return {
        ...cita,
        estado,
        resumenAtencion:
          estado === 'completada' ? resumenAtencion.trim() || cita.resumenAtencion : cita.resumenAtencion,
      };
    });

    if (!wasUpdated) {
      return false;
    }

    this.citasSubject.next(updated);
    this.persistCitas(updated);
    return true;
  }

  obtenerCitasPorFecha(fecha: string): Cita[] {
    const prefix = `${fecha}T`;
    return this.citasSubject.value
      .filter(cita => cita.fechaHora.startsWith(prefix))
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }

  obtenerCitasPorMascota(mascotaId: string): Cita[] {
    return this.citasSubject.value
      .filter(cita => cita.mascotaId === mascotaId)
      .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
  }

  getCitasSnapshot(): Cita[] {
    return [...this.citasSubject.value].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }

  obtenerHorariosDisponibles(fecha: string): string[] {
    const citasDelDia = this.obtenerCitasPorFecha(fecha).filter(cita => cita.estado !== 'cancelada');
    const ocupados = new Set(citasDelDia.map(cita => cita.fechaHora.slice(11, 16)));
    return this.scheduler.buildHourlySlots().filter(slot => !ocupados.has(slot));
  }

  obtenerResumenCalendario(days = 14): DayAvailability[] {
    return this.scheduler.buildNextDays(days).map(fecha => {
      const citas = this.obtenerCitasPorFecha(fecha).filter(cita => cita.estado !== 'cancelada');
      return {
        fecha,
        disponibles: this.obtenerHorariosDisponibles(fecha).length,
        ocupadas: citas.length,
      };
    });
  }

  private loadFromStorage(): void {
    const mascotas = this.storage.read<Mascota[]>(VeterinariaStoreService.MASCOTAS_KEY, []);
    const citas = this.storage
      .read<Cita[]>(VeterinariaStoreService.CITAS_KEY, [])
      .map(cita => this.normalizeCita(cita));

    this.mascotasSubject.next(mascotas);
    this.citasSubject.next(citas);
  }

  private persistMascotas(mascotas: Mascota[]): void {
    this.storage.write(VeterinariaStoreService.MASCOTAS_KEY, mascotas);
  }

  private persistCitas(citas: Cita[]): void {
    this.storage.write(VeterinariaStoreService.CITAS_KEY, citas);
  }

  private buildId(prefix: string): string {
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now()}-${random}`;
  }

  private findMascotaByOwnerAndName(
    nombreMascota: string,
    emailDueno: string,
    nombreDueno: string,
  ): Mascota | undefined {
    const mascotaNormalizada = nombreMascota.trim().toLowerCase();
    const emailNormalizado = emailDueno.trim().toLowerCase();
    const duenoNormalizado = nombreDueno.trim().toLowerCase();

    return this.mascotasSubject.value.find(
      mascota =>
        mascota.nombre.trim().toLowerCase() === mascotaNormalizada &&
        mascota.dueno.email.trim().toLowerCase() === emailNormalizado &&
        mascota.dueno.nombreCompleto.trim().toLowerCase() === duenoNormalizado,
    );
  }

  private normalizeCita(cita: Cita): Cita {
    return {
      ...cita,
      tipoServicio: cita.tipoServicio ?? 'Consulta general',
      veterinario: cita.veterinario ?? 'Profesional asignado',
      telefonoContacto: cita.telefonoContacto ?? '',
      emailContacto: cita.emailContacto ?? '',
      notas: cita.notas ?? '',
    };
  }
}
