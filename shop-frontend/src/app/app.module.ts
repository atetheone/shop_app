import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { OfferTasksComponent } from './components/offer-tasks/offer-tasks.component';
import { OfferTasksModule } from './components/offer-tasks/offer-tasks.module';
import { HomeModule } from './components/home/home.module';
import { EditOfferComponent } from './components/edit-offer/edit-offer.component';
import { EditOfferModule } from './components/edit-offer/edit-offer.module';
import { ToastService, ToastModule } from '@mean-stream/ngbx';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderComponent } from './components/order/order.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    OfferTasksComponent,
    EditOfferComponent,
    OrderComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HomeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OfferTasksModule,
    EditOfferModule,
    NgbModule,
    ToastModule
  ],
  providers: [ToastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
