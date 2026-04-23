import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/notAuth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./screens/tabs/tabs.routes').then((m) => m.routes),
  },
  { 
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./screens/auth/auth.routes').then((m) => m.routes)
  },
];
