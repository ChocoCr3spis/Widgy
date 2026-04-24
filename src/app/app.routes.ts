import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/notAuth.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./screens/tabs/tabs.routes').then((m) => m.routes),
  },
  { 
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./screens/auth/auth.routes').then((m) => m.routes)
  },
  { path: '**', redirectTo: '' }
];
