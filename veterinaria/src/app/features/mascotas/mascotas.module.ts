import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MascotasRoutingModule } from './mascotas-routing.module';
import { RegistroMascotaComponent } from './registro-mascota/registro-mascota.component';

@NgModule({
  declarations: [RegistroMascotaComponent],
  imports: [SharedModule, MascotasRoutingModule],
})
export class MascotasModule {}
