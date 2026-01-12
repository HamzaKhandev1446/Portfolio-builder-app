/**
 * Authentication Service
 * Handles Firebase Authentication
 */

import { Injectable, Optional } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();
  private isAuthAvailable: boolean;

  constructor(@Optional() private auth: Auth | null) {
    this.isAuthAvailable = !!this.auth;
    
    if (!this.isAuthAvailable || !this.auth) {
      console.warn('Firebase Auth not available. Update environment.ts with Firebase credentials.');
      this.loadingSubject.next(false);
      this.userSubject.next(null);
    } else {
      // Listen to auth state changes
      // Use non-null assertion since we've checked above
      const auth: Auth = this.auth;
      onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        this.loadingSubject.next(false);
        if (firebaseUser) {
          this.userSubject.next(this.mapFirebaseUser(firebaseUser));
        } else {
          this.userSubject.next(null);
        }
      });
    }
  }

  /**
   * Get current user
   */
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Sign in with email and password
   */
  signIn(email: string, password: string): Observable<User> {
    if (!this.isAuthAvailable || !this.auth) {
      return throwError(() => new Error('Firebase Auth is not configured. Please update environment.ts with your Firebase credentials.'));
    }

    const auth: Auth = this.auth; // Type assertion for TypeScript
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      map(result => this.mapFirebaseUser(result.user)),
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Sign up with email and password
   */
  signUp(email: string, password: string): Observable<User> {
    if (!this.isAuthAvailable || !this.auth) {
      return throwError(() => new Error('Firebase Auth is not configured. Please update environment.ts with your Firebase credentials.'));
    }

    const auth: Auth = this.auth; // Type assertion for TypeScript
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      map(result => this.mapFirebaseUser(result.user)),
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Sign out
   */
  signOut(): Observable<void> {
    if (!this.isAuthAvailable || !this.auth) {
      return throwError(() => new Error('Firebase Auth is not configured.'));
    }

    const auth: Auth = this.auth; // Type assertion for TypeScript
    return from(signOut(auth)).pipe(
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Map Firebase User to our User model
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined
    };
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email is already in use';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
    }
    
    return new Error(message);
  }
}
