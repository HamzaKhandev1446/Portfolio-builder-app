/**
 * App Routes
 * Main application routes (standalone routing)
 * Supports multi-tenant SaaS with user-specific URLs
 * Supports path-based domain testing: /muhammadhamza.com, /johndoe.com
 */

import { Routes } from '@angular/router';

// Reserved paths that should NOT be treated as domains
const RESERVED_PATHS = ['admin', 'portfolio', 'u', 'api', 'assets'];

// Function to check if a path looks like a domain
function isDomainPath(path: string): boolean {
  return path.includes('.') && 
         !RESERVED_PATHS.includes(path.toLowerCase()) &&
         path.length > 3;
}

export const routes: Routes = [
  // Standard routes first (exact matches take priority)
  {
    path: '',
    loadComponent: () => import('./features/public/public-portfolio.component').then(m => m.PublicPortfolioComponent)
  },
  {
    path: 'portfolio/:userId',
    loadComponent: () => import('./features/public/public-portfolio.component').then(m => m.PublicPortfolioComponent)
  },
  {
    path: 'u/:username',
    loadComponent: () => import('./features/public/public-portfolio.component').then(m => m.PublicPortfolioComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Path-based domain routes (for local testing: /muhammadhamza.com, /johndoe.com)
  // This catches any path that looks like a domain (contains a dot)
  {
    path: ':domainPath',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/public-portfolio.component').then(m => m.PublicPortfolioComponent)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
