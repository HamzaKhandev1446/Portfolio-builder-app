/**
 * Admin Routes
 * Admin feature routes
 */

import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('./editor/editor.component').then(m => m.EditorComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  }
];
