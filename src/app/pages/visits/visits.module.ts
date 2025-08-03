import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { SalesRoutingModule } from './visits-routing.module';
import { VisitsComponent } from './visits.component';
import { DurationPipe } from '../../pipes/duration.pipe';


@NgModule({
  declarations: [
    VisitsComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    FormsModule,
    DurationPipe,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
  ]
})
export class VisitsModule { }
