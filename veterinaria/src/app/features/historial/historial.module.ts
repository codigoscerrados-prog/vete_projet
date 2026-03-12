import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HistorialMascotaComponent } from './historial-mascota/historial-mascota.component';
import { HistorialRoutingModule } from './historial-routing.module';

@NgModule({
  declarations: [HistorialMascotaComponent],
  imports: [SharedModule, HistorialRoutingModule],
})
export class HistorialModule {}
