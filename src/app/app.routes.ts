import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AddLinkComponent } from './features/add-link/add-link.component';
import { EditLinkComponent } from './features/edit-link/edit-link.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add', component: AddLinkComponent },
  { path: 'edit/:id', component: EditLinkComponent },
  { path: '**', redirectTo: '' }
];
