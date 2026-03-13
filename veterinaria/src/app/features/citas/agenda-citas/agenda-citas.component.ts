import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { AgendaScheduler } from '../../../core/classes/agenda-scheduler';
import { Cita, DayAvailability } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

interface CitaConMascota extends Cita {
  nombreMascota: string;
  nombreTutor: string;
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
  readonly veterinarios = [
    'Dra. Valeria Rojas',
    'Dr. Mateo Salinas',
    'Dra. Camila Paredes',
    'Dr. Diego Mena',
  ];
  readonly tiposServicio = [
    'Consulta general',
    'Vacunacion',
    'Control postoperatorio',
    'Dermatologia',
    'Odontologia',
    'Urgencia prioritaria',
  ];

  readonly citaForm = this.fb.nonNullable.group({
    mascotaId: ['', [Validators.required]],
    fecha: [this.today, [Validators.required]],
    hora: ['', [Validators.required]],
    veterinario: ['', [Validators.required]],
    tipoServicio: ['', [Validators.required]],
    telefonoContacto: ['', [Validators.required, Validators.minLength(7)]],
    emailContacto: ['', [Validators.required, Validators.email]],
    motivo: ['', [Validators.required, Validators.minLength(5)]],
    notas: [''],
  });

  constructor() {
    this.store.mascotas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mascotas => (this.mascotas = mascotas));

    this.store.citas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshAgendaData());

    this.citaForm.controls.mascotaId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mascotaId => this.autocompletarDatosContacto(mascotaId));

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
      veterinario: form.veterinario,
      tipoServicio: form.tipoServicio,
      telefonoContacto: form.telefonoContacto,
      emailContacto: form.emailContacto,
      notas: form.notas,
    });

    if (!response.ok) {
      this.errorMessage = response.message;
      return;
    }

    this.successMessage = response.message;
    this.citaForm.patchValue({
      hora: '',
      veterinario: '',
      tipoServicio: '',
      motivo: '',
      notas: '',
    });
    this.refreshAgendaData();
  }

  seleccionarFecha(fecha: string): void {
    this.citaForm.patchValue({ fecha, hora: '' });
  }

  confirmarCita(citaId: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    const actualizado = this.store.actualizarEstadoCita(citaId, 'confirmada');
    if (!actualizado) {
      this.errorMessage = 'No se pudo confirmar la cita seleccionada.';
      return;
    }

    this.successMessage = 'La cita fue confirmada correctamente.';
  }

  cancelarCita(citaId: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    const actualizado = this.store.actualizarEstadoCita(citaId, 'cancelada');
    if (!actualizado) {
      this.errorMessage = 'No se pudo cancelar la cita seleccionada.';
      return;
    }

    this.successMessage = 'La cita fue cancelada correctamente.';
  }

  completarCita(citaId: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    const resumen = globalThis.prompt?.('Resumen breve de atencion:') ?? '';
    const actualizado = this.store.actualizarEstadoCita(citaId, 'completada', resumen);

    if (!actualizado) {
      this.errorMessage = 'No se pudo completar la cita seleccionada.';
      return;
    }

    this.successMessage = 'La cita fue marcada como completada.';
  }

  obtenerNombreMascota(mascotaId: string): string {
    return this.store.getMascotaById(mascotaId)?.nombre ?? 'Mascota sin registro';
  }

  get mascotaSeleccionada(): Mascota | undefined {
    return this.store.getMascotaById(this.citaForm.controls.mascotaId.value);
  }

  private refreshAgendaData(): void {
    const fechaSeleccionada = this.citaForm.controls.fecha.value ?? this.today;
    this.disponibilidadHoy = this.store.obtenerHorariosDisponibles(fechaSeleccionada);
    this.calendario = this.store.obtenerResumenCalendario(14);
    this.citasDelDia = this.store.obtenerCitasPorFecha(fechaSeleccionada).map(cita => ({
      ...cita,
      nombreMascota: this.obtenerNombreMascota(cita.mascotaId),
      nombreTutor: this.store.getMascotaById(cita.mascotaId)?.dueno.nombreCompleto ?? 'Tutor no registrado',
    }));
  }

  private autocompletarDatosContacto(mascotaId: string): void {
    const mascota = this.store.getMascotaById(mascotaId);

    if (!mascota) {
      this.citaForm.patchValue({ telefonoContacto: '', emailContacto: '' }, { emitEvent: false });
      return;
    }

    this.citaForm.patchValue(
      {
        telefonoContacto: mascota.dueno.telefono,
        emailContacto: mascota.dueno.email,
      },
      { emitEvent: false },
    );
  }
}
