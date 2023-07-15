import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeModule } from './components/home/home.module';
import { PickTasksModule } from './components/pick-tasks/pick-tasks.module';
import { StoreTasksModule } from './components/store-tasks/store-tasks.module';
import { AddPaletteModule } from './components/add-palette/add-palette.module';
import { AddPaletteComponent } from './components/add-palette/add-palette.component';
import { StoreTasksComponent } from './components/store-tasks/store-tasks.component';
import { PickTasksComponent } from './components/pick-tasks/pick-tasks.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EditPickComponent } from './components/edit-pick/edit-pick.component';
import { EditPickModule } from './components/edit-pick/edit-pick.module';
import { DeliveryTasksComponent } from './components/delivery-tasks/delivery-tasks.component';
import { DeliveryTasksModule } from './components/delivery-tasks/delivery-tasks.module';
import { ToastModule, ToastService } from '@mean-stream/ngbx';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './components/login/login.component';
import { LoginModule } from './components/login/login.module';

@NgModule({
  declarations: [
    AppComponent,
    StoreTasksComponent,
    PickTasksComponent,
    HomeComponent,
    AddPaletteComponent,
    EditPickComponent,
    DeliveryTasksComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HomeModule,
    StoreTasksModule,
    AddPaletteModule,
    HttpClientModule,
    ReactiveFormsModule,
    PickTasksModule,
    EditPickModule,
    DeliveryTasksModule,
    LoginModule,
    ToastModule,
    NgbModule
  ],
  providers: [ToastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
