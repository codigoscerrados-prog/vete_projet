import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResaltarProximaCitaDirective } from './directives/resaltar-proxima-cita.directive';
import { EstadoCitaPipe } from './pipes/estado-cita.pipe';

@NgModule({
  declarations: [EstadoCitaPipe, ResaltarProximaCitaDirective],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, EstadoCitaPipe, ResaltarProximaCitaDirective],
})
export class SharedModule {}
