import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { EspecieMascota, Mascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

@Component({
  selector: 'app-registro-mascota',
  standalone: false,
  templateUrl: './registro-mascota.component.html',
  styleUrl: './registro-mascota.component.css',
})
export class RegistroMascotaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(VeterinariaStoreService);
  private readonly destroyRef = inject(DestroyRef);

  readonly especies: EspecieMascota[] = ['Perro', 'Gato', 'Ave', 'Otro'];
  mascotas: Mascota[] = [];
  successMessage = '';

  readonly mascotaForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    especie: ['Perro' as EspecieMascota, [Validators.required]],
    raza: ['', [Validators.required, Validators.minLength(2)]],
    fechaNacimiento: ['', [Validators.required]],
    pesoKg: [1, [Validators.required, Validators.min(0.1), Validators.max(120)]],
    nombreDueno: ['', [Validators.required, Validators.minLength(5)]],
    telefonoDueno: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    emailDueno: ['', [Validators.required, Validators.email]],
    notas: [''],
  });

  constructor() {
    this.store.mascotas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mascotas => (this.mascotas = mascotas));
  }

  registrarMascota(): void {
    this.successMessage = '';

    if (this.mascotaForm.invalid) {
      this.mascotaForm.markAllAsTouched();
      return;
    }

    const form = this.mascotaForm.getRawValue();
    this.store.registrarMascota({
      nombre: form.nombre.trim(),
      especie: form.especie,
      raza: form.raza.trim(),
      fechaNacimiento: form.fechaNacimiento,
      pesoKg: form.pesoKg,
      dueno: {
        nombreCompleto: form.nombreDueno.trim(),
        telefono: form.telefonoDueno.trim(),
        email: form.emailDueno.trim(),
      },
      notas: form.notas.trim(),
    });

    this.successMessage = 'Mascota registrada correctamente.';
    this.mascotaForm.reset({
      nombre: '',
      especie: 'Perro',
      raza: '',
      fechaNacimiento: '',
      pesoKg: 1,
      nombreDueno: '',
      telefonoDueno: '',
      emailDueno: '',
      notas: '',
    });
  }
}
