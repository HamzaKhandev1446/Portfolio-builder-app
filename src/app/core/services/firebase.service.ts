/**
 * Firebase Service
 * Wrapper for Firebase Realtime Database operations
 */

import { Injectable, Optional } from '@angular/core';
import { Database, ref, set, get, onValue, off, push, remove, update } from '@angular/fire/database';
import { Observable, from, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Portfolio } from '../../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private isFirebaseAvailable: boolean;

  constructor(@Optional() private database: Database | null) {
    this.isFirebaseAvailable = !!this.database;
    if (!this.isFirebaseAvailable) {
      console.warn('Firebase Database not available. Update environment.ts with Firebase credentials.');
    }
  }

  /**
   * Save portfolio data to Firebase
   */
  savePortfolio(userId: string, portfolio: Portfolio, isDraft: boolean = true): Observable<void> {
    console.log('FirebaseService.savePortfolio() called', { userId, isDraft, portfolio });
    console.log('Firebase available?', this.isFirebaseAvailable);
    console.log('Database instance?', !!this.database);
    
    if (!this.isFirebaseAvailable || !this.database) {
      console.error('❌ Firebase not available!', {
        isFirebaseAvailable: this.isFirebaseAvailable,
        hasDatabase: !!this.database
      });
      return throwError(() => new Error('Firebase not available. Cannot save portfolio.'));
    }
    
    console.log('✅ Firebase is available, proceeding with save...');

    const database = this.database; // TypeScript now knows it's not null
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    console.log('Saving to path:', path);
    const portfolioRef = ref(database, path);

    const dataToSave = {
      ...portfolio,
      lastUpdated: new Date().toISOString()
    };
    console.log('Attempting to save data:', dataToSave);
    console.log('Using database reference:', portfolioRef);
    
    return new Observable<void>(observer => {
      console.log('Observable created, calling set()...');
      set(portfolioRef, dataToSave)
        .then(() => {
          console.log('✅ set() promise resolved - Portfolio saved successfully to:', path);
          observer.next();
          observer.complete();
        })
        .catch(error => {
          console.error('❌ set() promise rejected - Error saving portfolio to', path, ':', error);
          observer.error(error);
        });
    });
  }

  /**
   * Get portfolio data from Firebase
   */
  getPortfolio(userId: string, isDraft: boolean = true): Observable<Portfolio | null> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(null);
    }

    const database = this.database; // TypeScript now knows it's not null
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(database, path);
    
    return new Observable(observer => {
      get(portfolioRef).then(snapshot => {
        const data = snapshot.val();
        observer.next(data || null);
        observer.complete();
      }).catch(error => {
        console.warn('Error fetching portfolio:', error);
        observer.next(null);
        observer.complete();
      });
    });
  }

  /**
   * Listen to portfolio changes in real-time
   */
  watchPortfolio(userId: string, isDraft: boolean = true): Observable<Portfolio | null> {
    if (!this.isFirebaseAvailable || !this.database) {
      return of(null);
    }

    const database = this.database; // TypeScript now knows it's not null
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(database, path);
    
    return new Observable(observer => {
      const unsubscribe = onValue(portfolioRef, snapshot => {
        const data = snapshot.val();
        observer.next(data || null);
      }, error => {
        console.warn('Error watching portfolio:', error);
        observer.next(null);
      });

      // Return cleanup function
      return () => {
        off(portfolioRef);
      };
    });
  }

  /**
   * Get public published portfolio (no auth required)
   */
  getPublicPortfolio(userId: string): Observable<Portfolio | null> {
    return this.getPortfolio(userId, false);
  }

  /**
   * Delete portfolio
   */
  deletePortfolio(userId: string, isDraft: boolean = true): Observable<void> {
    if (!this.isFirebaseAvailable || !this.database) {
      console.warn('Firebase not available. Cannot delete portfolio.');
      return of(undefined);
    }

    const database = this.database; // TypeScript now knows it's not null
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(database, path);
    return from(remove(portfolioRef)).pipe(
      catchError(error => {
        console.error('Error deleting portfolio:', error);
        return of(undefined);
      })
    );
  }
}
