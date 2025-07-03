import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { FormsModule } from '@angular/forms';
import { DurationPipe } from '../../pipes/duration.pipe';


@NgModule({
  declarations: [
    SalesComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    FormsModule,
    DurationPipe
  ]
})
export class SalesModule { }
