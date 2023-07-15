import {  NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PickTasksComponent } from './components/pick-tasks/pick-tasks.component';
import { StoreTasksComponent } from './components/store-tasks/store-tasks.component';
import { AddPaletteComponent } from './components/add-palette/add-palette.component';
import { EditPickComponent } from './components/edit-pick/edit-pick.component';
import { DeliveryTasksComponent } from './components/delivery-tasks/delivery-tasks.component';

const routes: Routes = [
  { 'path': '', component: HomeComponent},
  { 'path': 'home', component: HomeComponent},
  { 'path': 'pick-tasks', component: PickTasksComponent},
  { 'path': 'pick-tasks/edit-pick/:code', component: EditPickComponent},
  { 'path': 'pick-tasks/edit-pick', component: EditPickComponent},
  { 'path': 'store-tasks', component: StoreTasksComponent},
  { 'path': 'store-tasks/add-palette', component: AddPaletteComponent},
  { 'path': 'delivery-tasks', component: DeliveryTasksComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
