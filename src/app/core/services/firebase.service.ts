/**
 * Firebase Service
 * Wrapper for Firebase Realtime Database operations
 */

import { Injectable } from '@angular/core';
import { Database, ref, set, get, onValue, off, push, remove, update } from '@angular/fire/database';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Portfolio } from '../../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private database: Database) {}

  /**
   * Save portfolio data to Firebase
   */
  savePortfolio(userId: string, portfolio: Portfolio, isDraft: boolean = true): Observable<void> {
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(this.database, path);
    return from(set(portfolioRef, {
      ...portfolio,
      lastUpdated: new Date().toISOString()
    }));
  }

  /**
   * Get portfolio data from Firebase
   */
  getPortfolio(userId: string, isDraft: boolean = true): Observable<Portfolio | null> {
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(this.database, path);
    
    return new Observable(observer => {
      get(portfolioRef).then(snapshot => {
        const data = snapshot.val();
        observer.next(data || null);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Listen to portfolio changes in real-time
   */
  watchPortfolio(userId: string, isDraft: boolean = true): Observable<Portfolio | null> {
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(this.database, path);
    
    return new Observable(observer => {
      const unsubscribe = onValue(portfolioRef, snapshot => {
        const data = snapshot.val();
        observer.next(data || null);
      }, error => {
        observer.error(error);
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
    const path = isDraft ? `portfolios/${userId}/draft` : `portfolios/${userId}/published`;
    const portfolioRef = ref(this.database, path);
    return from(remove(portfolioRef));
  }
}
