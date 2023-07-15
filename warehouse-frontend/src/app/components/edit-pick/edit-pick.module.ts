import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from '@mean-stream/ngbx';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule, 
    ToastModule
  ]
})
export class EditPickModule { }
