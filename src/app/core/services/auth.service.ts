/**
 * Authentication Service
 * Handles Firebase Authentication
 */

import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Observable, BehaviorSubject, from } from 'rxjs';
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

  constructor(private auth: Auth) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      this.loadingSubject.next(false);
      if (firebaseUser) {
        this.userSubject.next(this.mapFirebaseUser(firebaseUser));
      } else {
        this.userSubject.next(null);
      }
    });
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
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
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
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
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
    return from(signOut(this.auth)).pipe(
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
