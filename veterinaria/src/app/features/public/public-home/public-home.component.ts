import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { AgendaScheduler } from '../../../core/classes/agenda-scheduler';
import { EspecieMascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

@Component({
  selector: 'app-public-home',
  standalone: false,
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css',
})
export class PublicHomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(VeterinariaStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scheduler = new AgendaScheduler();

  readonly today = this.scheduler.formatAsDateOnly(new Date());
  readonly especies: EspecieMascota[] = ['Perro', 'Gato', 'Ave', 'Otro'];
  readonly veterinarios = [
    'Dra. Valeria Rojas',
    'Dr. Mateo Salinas',
    'Dra. Camila Paredes',
    'Dr. Diego Mena',
  ];
  readonly servicios = [
    'Consulta general',
    'Vacunacion',
    'Control preventivo',
    'Dermatologia',
    'Odontologia',
    'Urgencias coordinadas',
  ];
  readonly especialidades = [
    {
      tag: 'Consulta',
      titulo: 'Medicina general',
      descripcion: 'Evaluacion completa, control preventivo y seguimiento clinico para cada mascota.',
    },
    {
      tag: 'Prevencion',
      titulo: 'Vacunas y bienestar',
      descripcion: 'Planes preventivos, desparasitacion y control de etapas de crecimiento.',
    },
    {
      tag: 'Especialidad',
      titulo: 'Dermatologia y control',
      descripcion: 'Atencion para piel, alergias y revisiones que necesitan observacion mas precisa.',
    },
  ];

  disponibilidad: string[] = [];
  successMessage = '';
  errorMessage = '';

  readonly citaPublicaForm = this.fb.nonNullable.group({
    nombreMascota: ['', [Validators.required, Validators.minLength(2)]],
    especie: ['Perro' as EspecieMascota, [Validators.required]],
    raza: ['', [Validators.required, Validators.minLength(2)]],
    fechaNacimiento: ['', [Validators.required]],
    pesoKg: [1, [Validators.required, Validators.min(0.1), Validators.max(120)]],
    nombreDueno: ['', [Validators.required, Validators.minLength(5)]],
    telefonoDueno: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    emailDueno: ['', [Validators.required, Validators.email]],
    fecha: [this.today, [Validators.required]],
    hora: ['', [Validators.required]],
    veterinario: ['', [Validators.required]],
    tipoServicio: ['', [Validators.required]],
    motivo: ['', [Validators.required, Validators.minLength(5)]],
    notas: [''],
  });

  constructor() {
    this.store.citas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshAvailability());
    this.citaPublicaForm.controls.fecha.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshAvailability());

    this.refreshAvailability();
  }

  reservarCita(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.citaPublicaForm.invalid) {
      this.citaPublicaForm.markAllAsTouched();
      return;
    }

    const form = this.citaPublicaForm.getRawValue();
    const response = this.store.registrarCitaPublica({
      mascota: {
        nombre: form.nombreMascota.trim(),
        especie: form.especie,
        raza: form.raza.trim(),
        fechaNacimiento: form.fechaNacimiento,
        pesoKg: form.pesoKg,
        dueno: {
          nombreCompleto: form.nombreDueno.trim(),
          telefono: form.telefonoDueno.trim(),
          email: form.emailDueno.trim().toLowerCase(),
        },
        notas: form.notas.trim(),
      },
      cita: {
        fechaHora: this.scheduler.buildDateTime(form.fecha, form.hora),
        motivo: form.motivo.trim(),
        veterinario: form.veterinario,
        tipoServicio: form.tipoServicio,
        telefonoContacto: form.telefonoDueno.trim(),
        emailContacto: form.emailDueno.trim().toLowerCase(),
        notas: form.notas.trim(),
      },
    });

    if (!response.ok) {
      this.errorMessage = response.message;
      return;
    }

    this.successMessage = 'Tu solicitud fue enviada. La cita ya aparece reservada en la agenda.';
    this.citaPublicaForm.patchValue({
      hora: '',
      veterinario: '',
      tipoServicio: '',
      motivo: '',
      notas: '',
    });
    this.refreshAvailability();
  }
  private refreshAvailability(): void {
    const fecha = this.citaPublicaForm.controls.fecha.value || this.today;
    this.disponibilidad = this.store.obtenerHorariosDisponibles(fecha);
  }
}
