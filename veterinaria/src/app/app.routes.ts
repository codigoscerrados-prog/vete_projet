import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule),
  },
  {
    path: 'auth',
    canMatch: [guestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'panel',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'mascotas',
        loadChildren: () =>
          import('./features/mascotas/mascotas.module').then(m => m.MascotasModule),
      },
      {
        path: 'citas',
        loadChildren: () => import('./features/citas/citas.module').then(m => m.CitasModule),
      },
      {
        path: 'historial',
        loadChildren: () =>
          import('./features/historial/historial.module').then(m => m.HistorialModule),
      },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
  { path: '**', redirectTo: '' },
];
