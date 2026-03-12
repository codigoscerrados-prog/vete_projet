import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { AgendaScheduler } from '../../../core/classes/agenda-scheduler';
import { Cita, DayAvailability } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

interface CitaConMascota extends Cita {
  nombreMascota: string;
}

@Component({
  selector: 'app-agenda-citas',
  standalone: false,
  templateUrl: './agenda-citas.component.html',
  styleUrl: './agenda-citas.component.css',
})
export class AgendaCitasComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(VeterinariaStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scheduler = new AgendaScheduler();

  readonly today = this.scheduler.formatAsDateOnly(new Date());

  mascotas: Mascota[] = [];
  citasDelDia: CitaConMascota[] = [];
  disponibilidadHoy: string[] = [];
  calendario: DayAvailability[] = [];
  successMessage = '';
  errorMessage = '';

  readonly citaForm = this.fb.nonNullable.group({
    mascotaId: ['', [Validators.required]],
    fecha: [this.today, [Validators.required]],
    hora: ['', [Validators.required]],
    motivo: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor() {
    this.store.mascotas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mascotas => (this.mascotas = mascotas));

    this.store.citas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshAgendaData());

    this.citaForm.controls.fecha.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshAgendaData());

    this.refreshAgendaData();
  }

  registrarCita(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    const form = this.citaForm.getRawValue();
    const response = this.store.registrarCita({
      mascotaId: form.mascotaId,
      fechaHora: this.scheduler.buildDateTime(form.fecha, form.hora),
      motivo: form.motivo,
    });

    if (!response.ok) {
      this.errorMessage = response.message;
      return;
    }

    this.successMessage = response.message;
    this.citaForm.patchValue({ hora: '', motivo: '' });
    this.refreshAgendaData();
  }

  seleccionarFecha(fecha: string): void {
    this.citaForm.patchValue({ fecha, hora: '' });
  }

  confirmarCita(citaId: string): void {
    this.store.actualizarEstadoCita(citaId, 'confirmada');
  }

  cancelarCita(citaId: string): void {
    this.store.actualizarEstadoCita(citaId, 'cancelada');
  }

  completarCita(citaId: string): void {
    const resumen = prompt('Resumen breve de atencion:') ?? '';
    this.store.actualizarEstadoCita(citaId, 'completada', resumen);
  }

  obtenerNombreMascota(mascotaId: string): string {
    return this.store.getMascotaById(mascotaId)?.nombre ?? 'Mascota sin registro';
  }

  private refreshAgendaData(): void {
    const fechaSeleccionada = this.citaForm.controls.fecha.value ?? this.today;
    this.disponibilidadHoy = this.store.obtenerHorariosDisponibles(fechaSeleccionada);
    this.calendario = this.store.obtenerResumenCalendario(14);
    this.citasDelDia = this.store.obtenerCitasPorFecha(fechaSeleccionada).map(cita => ({
      ...cita,
      nombreMascota: this.obtenerNombreMascota(cita.mascotaId),
    }));
  }
}
