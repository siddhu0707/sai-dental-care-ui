import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'patients', 
    loadComponent: () => import('./components/patients/patients.component').then(m => m.PatientsComponent)
  },
  { 
    path: 'appointments', 
    loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  { 
    path: 'billing', 
    loadComponent: () => import('./components/billing/billing.component').then(m => m.BillingComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
