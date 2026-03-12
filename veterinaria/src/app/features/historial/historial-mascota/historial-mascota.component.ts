import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Cita } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';
import { VeterinariaStoreService } from '../../../core/services/veterinaria-store.service';

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
  historial: Cita[] = [];
  mascotaSeleccionada: Mascota | null = null;

  readonly filtroForm = this.fb.nonNullable.group({
    mascotaId: ['', [Validators.required]],
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

  private cargarHistorial(): void {
    const mascotaId = this.filtroForm.controls.mascotaId.value;
    if (!mascotaId) {
      this.historial = [];
      this.mascotaSeleccionada = null;
      return;
    }

    this.mascotaSeleccionada = this.store.getMascotaById(mascotaId) ?? null;
    this.historial = this.store.obtenerCitasPorMascota(mascotaId);
  }
}
