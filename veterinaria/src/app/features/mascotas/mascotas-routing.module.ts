import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroMascotaComponent } from './registro-mascota/registro-mascota.component';

const routes: Routes = [{ path: '', component: RegistroMascotaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MascotasRoutingModule {}
