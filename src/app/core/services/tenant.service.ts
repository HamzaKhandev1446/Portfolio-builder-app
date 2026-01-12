/**
 * Tenant Service
 * Manages multi-tenant configuration and user lookup
 */

import { Injectable, Optional } from '@angular/core';
import { Database, ref, get, set } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { TenantConfig, UserMetadata } from '../../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private isFirebaseAvailable: boolean;

  constructor(@Optional() private database: Database | null) {
    this.isFirebaseAvailable = !!this.database;
  }

  /**
   * Get user ID by username/slug
   */
  getUserIdByUsername(username: string): Observable<string | null> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(null);
    }

    const database = this.database;
    const userRef = ref(database, `usernames/${username}`);

    return new Observable(observer => {
      get(userRef).then(snapshot => {
        const userId = snapshot.val();
        observer.next(userId || null);
        observer.complete();
      }).catch(error => {
        console.warn('Error fetching user by username:', error);
        observer.next(null);
        observer.complete();
      });
    });
  }

  /**
   * Get tenant configuration by user ID
   */
  getTenantConfig(userId: string): Observable<TenantConfig | null> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(null);
    }

    const database = this.database;
    const configRef = ref(database, `tenants/${userId}`);

    return new Observable(observer => {
      get(configRef).then(snapshot => {
        const config = snapshot.val();
        observer.next(config || null);
        observer.complete();
      }).catch(error => {
        console.warn('Error fetching tenant config:', error);
        observer.next(null);
        observer.complete();
      });
    });
  }

  /**
   * Save tenant configuration
   */
  saveTenantConfig(userId: string, config: Partial<TenantConfig>): Observable<void> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(undefined);
    }

    const database = this.database;
    const configRef = ref(database, `tenants/${userId}`);
    
    const fullConfig: TenantConfig = {
      userId,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      ...config
    };

    return new Observable(observer => {
      set(configRef, fullConfig).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        console.error('Error saving tenant config:', error);
        observer.error(error);
      });
    });
  }

  /**
   * Register username for a user
   */
  registerUsername(username: string, userId: string): Observable<void> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(undefined);
    }

    const database = this.database;
    const usernameRef = ref(database, `usernames/${username}`);

    return new Observable(observer => {
      set(usernameRef, userId).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        console.error('Error registering username:', error);
        observer.error(error);
      });
    });
  }

  /**
   * Encode domain for Firebase path (replace invalid characters)
   * Firebase paths cannot contain: ".", "#", "$", "[", "]"
   */
  private encodeDomainForFirebase(domain: string): string {
    return domain
      .replace(/\./g, '_DOT_')
      .replace(/#/g, '_HASH_')
      .replace(/\$/g, '_DOLLAR_')
      .replace(/\[/g, '_LBRACKET_')
      .replace(/\]/g, '_RBRACKET_');
  }

  /**
   * Decode domain from Firebase path
   */
  private decodeDomainFromFirebase(encodedDomain: string): string {
    return encodedDomain
      .replace(/_DOT_/g, '.')
      .replace(/_HASH_/g, '#')
      .replace(/_DOLLAR_/g, '$')
      .replace(/_LBRACKET_/g, '[')
      .replace(/_RBRACKET_/g, ']');
  }

  /**
   * Get user ID by custom domain
   */
  getUserIdByDomain(domain: string): Observable<string | null> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(null);
    }

    const database = this.database;
    // Normalize domain (remove www, http, https, trailing slash)
    const normalizedDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // Encode domain for Firebase path (replace dots and other invalid chars)
    const encodedDomain = this.encodeDomainForFirebase(normalizedDomain);
    const domainRef = ref(database, `domains/${encodedDomain}`);

    return new Observable(observer => {
      get(domainRef).then(snapshot => {
        const userId = snapshot.val();
        observer.next(userId || null);
        observer.complete();
      }).catch(error => {
        console.warn('Error fetching user by domain:', error);
        observer.next(null);
        observer.complete();
      });
    });
  }

  /**
   * Register custom domain for a user
   */
  registerDomain(domain: string, userId: string): Observable<void> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(undefined);
    }

    const database = this.database;
    // Normalize domain
    const normalizedDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // Encode domain for Firebase path (replace dots and other invalid chars)
    const encodedDomain = this.encodeDomainForFirebase(normalizedDomain);
    const domainRef = ref(database, `domains/${encodedDomain}`);

    return new Observable(observer => {
      set(domainRef, userId).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        console.error('Error registering domain:', error);
        observer.error(error);
      });
    });
  }

  /**
   * Get current domain from browser
   */
  getCurrentDomain(): string {
    return window.location.hostname;
  }

  /**
   * Check if current domain is a custom domain (not localhost or main domain)
   */
  isCustomDomain(): boolean {
    const hostname = this.getCurrentDomain();
    // Add your main SaaS domain here (e.g., 'portfolios.com', 'myportfolios.com')
    const mainDomain = 'localhost'; // Change this to your production domain
    return hostname !== mainDomain && 
           hostname !== '127.0.0.1' && 
           !hostname.includes('localhost');
  }

  /**
   * Get user ID from route (username or userId)
   */
  resolveUserIdFromRoute(usernameOrId: string): Observable<string | null> {
    // If it looks like a Firebase UID (long alphanumeric), use it directly
    if (usernameOrId.length > 20 && /^[a-zA-Z0-9]+$/.test(usernameOrId)) {
      return of(usernameOrId);
    }

    // Otherwise, treat it as a username and look it up
    return this.getUserIdByUsername(usernameOrId);
  }

  /**
   * Check if a path segment looks like a domain (for path-based testing)
   */
  isDomainPath(path: string): boolean {
    // Check if path contains a dot (like muhammadhamza.com, johndoe.com)
    // and doesn't start with common route prefixes
    const excludedPaths = ['admin', 'portfolio', 'u', 'api', 'assets'];
    return path.includes('.') && 
           !excludedPaths.includes(path.toLowerCase()) &&
           path.length > 3;
  }

  /**
   * Resolve user ID from domain or route
   * Priority: 1. Path-based domain, 2. Actual domain, 3. Route params
   */
  resolveUserId(routeUserId?: string, routeUsername?: string, domainPath?: string): Observable<string | null> {
    // First, check if we have a path-based domain (for local testing)
    if (domainPath && this.isDomainPath(domainPath)) {
      return this.getUserIdByDomain(domainPath).pipe(
        switchMap((domainUserId: string | null) => {
          if (domainUserId) {
            return of(domainUserId);
          }
          // If domain lookup fails, fall back to route params
          return this.resolveUserIdFromRouteParams(routeUserId, routeUsername);
        })
      );
    }

    // Second, check if we're on an actual custom domain
    if (this.isCustomDomain()) {
      const currentDomain = this.getCurrentDomain();
      return this.getUserIdByDomain(currentDomain).pipe(
        switchMap((domainUserId: string | null) => {
          if (domainUserId) {
            return of(domainUserId);
          }
          // If domain lookup fails, fall back to route params
          return this.resolveUserIdFromRouteParams(routeUserId, routeUsername);
        })
      );
    }

    // Not a custom domain, use route params
    return this.resolveUserIdFromRouteParams(routeUserId, routeUsername);
  }

  /**
   * Resolve user ID from route parameters
   */
  private resolveUserIdFromRouteParams(routeUserId?: string, routeUsername?: string): Observable<string | null> {
    const identifier = routeUserId || routeUsername;
    
    if (!identifier) {
      return of(null);
    }

    return this.resolveUserIdFromRoute(identifier);
  }
}
