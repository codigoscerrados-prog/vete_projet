import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PublicHomeComponent } from './public-home/public-home.component';
import { PublicRoutingModule } from './public-routing.module';

@NgModule({
  declarations: [PublicHomeComponent],
  imports: [SharedModule, PublicRoutingModule],
})
export class PublicModule {}
