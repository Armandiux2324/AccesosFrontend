import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigComponent } from './config.component';


@NgModule({
  declarations: [
    ConfigComponent
  ],
  imports: [
    CommonModule,
    ConfigRoutingModule,
    FormsModule
  ]
})
export class ConfigModule { }
