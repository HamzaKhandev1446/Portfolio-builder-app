/**
 * Portfolio Service
 * Manages portfolio data state and operations
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Portfolio, createEmptyPortfolio } from '../../models/portfolio.model';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { map, switchMap, take, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private portfolioSubject = new BehaviorSubject<Portfolio>(createEmptyPortfolio());
  public portfolio$ = this.portfolioSubject.asObservable();

  private saveInProgress = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {
    // Load portfolio when user is authenticated
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadPortfolio();
      } else {
        this.portfolioSubject.next(createEmptyPortfolio());
      }
    });
  }

  /**
   * Get current portfolio value
   */
  get currentPortfolio(): Portfolio {
    return this.portfolioSubject.value;
  }

  /**
   * Update portfolio (for live preview)
   * Debounced to prevent excessive updates
   */
  updatePortfolio(updates: Partial<Portfolio>): void {
    const current = this.portfolioSubject.value;
    const updated: Portfolio = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    this.portfolioSubject.next(updated);
  }

  /**
   * Save portfolio to Firebase (draft)
   */
  saveDraft(): Observable<void> {
    if (this.saveInProgress) {
      return new Observable(observer => observer.complete());
    }

    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to save portfolio');
    }

    this.saveInProgress = true;
    const portfolio = this.portfolioSubject.value;

    return this.firebaseService.savePortfolio(user.uid, portfolio, true).pipe(
      map(() => {
        this.saveInProgress = false;
      })
    );
  }

  /**
   * Publish portfolio
   */
  publish(): Observable<void> {
    console.log('PortfolioService.publish() called');
    const user = this.authService.currentUser;
    if (!user) {
      console.error('No user authenticated');
      throw new Error('User must be authenticated to publish portfolio');
    }

    console.log('Current user:', user.uid);
    const portfolio = {
      ...this.portfolioSubject.value,
      status: 'published' as const,
      lastUpdated: new Date().toISOString()
    };

    console.log('Portfolio to publish:', portfolio);
    console.log('Saving to published path...');

    // Save both draft and published versions
    return this.firebaseService.savePortfolio(user.uid, portfolio, false).pipe(
      switchMap(() => {
        console.log('Published version saved, now saving draft...');
        // Also update draft
        return this.firebaseService.savePortfolio(user.uid, portfolio, true);
      }),
      map(() => {
        console.log('Both versions saved successfully');
        this.portfolioSubject.next(portfolio);
      }),
      catchError(error => {
        console.error('Error in publish pipeline:', error);
        throw error;
      })
    );
  }

  /**
   * Load portfolio from Firebase
   */
  loadPortfolio(): void {
    const user = this.authService.currentUser;
    if (!user) {
      return;
    }

    this.firebaseService.getPortfolio(user.uid, true).pipe(
      take(1)
    ).subscribe(portfolio => {
      if (portfolio) {
        this.portfolioSubject.next(portfolio);
      }
    });
  }

  /**
   * Reset portfolio to last saved state
   */
  reset(): void {
    this.loadPortfolio();
  }

  /**
   * Get public portfolio (for public view)
   */
  getPublicPortfolio(userId: string): Observable<Portfolio | null> {
    return this.firebaseService.getPublicPortfolio(userId);
  }
}
