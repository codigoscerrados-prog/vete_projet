import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AgendaCitasComponent } from './agenda-citas/agenda-citas.component';
import { CitasRoutingModule } from './citas-routing.module';

@NgModule({
  declarations: [AgendaCitasComponent],
  imports: [SharedModule, CitasRoutingModule],
})
export class CitasModule {}
