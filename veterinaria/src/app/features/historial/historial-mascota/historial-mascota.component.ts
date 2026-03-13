import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Cita } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

interface HistorialItem extends Cita {
  nombreMascota: string;
  especieMascota: string;
  razaMascota: string;
  nombreDueno: string;
  telefonoDueno: string;
}

@Component({
  selector: 'app-historial-mascota',
  standalone: false,
  templateUrl: './historial-mascota.component.html',
  styleUrl: './historial-mascota.component.css',
})
export class HistorialMascotaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(VeterinariaStoreService);
  private readonly destroyRef = inject(DestroyRef);

  mascotas: Mascota[] = [];
  historial: HistorialItem[] = [];
  mascotaSeleccionada: Mascota | null = null;

  readonly filtroForm = this.fb.nonNullable.group({
    mascotaId: [''],
  });

  constructor() {
    this.store.mascotas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mascotas => (this.mascotas = mascotas));

    this.store.citas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cargarHistorial());

    this.filtroForm.controls.mascotaId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargarHistorial());
  }

  get atencionesCompletadas(): number {
    return this.historial.filter(cita => cita.estado === 'completada').length;
  }

  get totalServicios(): number {
    return this.historial.length;
  }

  private cargarHistorial(): void {
    const mascotaId = this.filtroForm.controls.mascotaId.value;
    if (!mascotaId) {
      this.mascotaSeleccionada = null;
      this.historial = this.store.getCitasSnapshot().map(cita => this.mapHistorialItem(cita));
      return;
    }

    this.mascotaSeleccionada = this.store.getMascotaById(mascotaId) ?? null;
    this.historial = this.store.obtenerCitasPorMascota(mascotaId).map(cita => this.mapHistorialItem(cita));
  }

  private mapHistorialItem(cita: Cita): HistorialItem {
    const mascota = this.store.getMascotaById(cita.mascotaId);

    return {
      ...cita,
      nombreMascota: mascota?.nombre ?? 'Mascota sin registro',
      especieMascota: mascota?.especie ?? 'Especie no registrada',
      razaMascota: mascota?.raza ?? 'Raza no registrada',
      nombreDueno: mascota?.dueno.nombreCompleto ?? 'Tutor no registrado',
      telefonoDueno: mascota?.dueno.telefono ?? 'Sin telefono',
    };
  }
}
