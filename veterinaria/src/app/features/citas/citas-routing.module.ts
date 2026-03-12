import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaCitasComponent } from './agenda-citas/agenda-citas.component';

const routes: Routes = [{ path: '', component: AgendaCitasComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CitasRoutingModule {}
