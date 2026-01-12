/**
 * Settings Component
 * User configuration for SaaS (username, custom domain, etc.)
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { TenantConfig } from '../../../models/tenant.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  tenantConfig$!: Observable<TenantConfig | null>;
  currentUser: any;
  saving = false;
  saveSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tenantService: TenantService
  ) {
    this.settingsForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/), Validators.minLength(3)]],
      customDomain: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadTenantConfig(user.uid);
      }
    });
  }

  loadTenantConfig(userId: string): void {
    this.tenantConfig$ = this.tenantService.getTenantConfig(userId);
    
    this.tenantConfig$.pipe(take(1)).subscribe(config => {
      if (config) {
        this.settingsForm.patchValue({
          username: config.username || '',
          customDomain: config.customDomain || '',
          isActive: config.isActive
        });
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.invalid || !this.currentUser) {
      return;
    }

    this.saving = true;
    this.saveSuccess = false;

    const formValue = this.settingsForm.value;
    const userId = this.currentUser.uid;

    // Save tenant config
    this.tenantService.saveTenantConfig(userId, {
      username: formValue.username,
      customDomain: formValue.customDomain,
      isActive: formValue.isActive
    }).pipe(take(1)).subscribe({
      next: () => {
        // Register username for lookup
        const usernamePromise = formValue.username 
          ? this.tenantService.registerUsername(formValue.username, userId).pipe(take(1)).toPromise()
          : Promise.resolve();

        // Register custom domain for lookup
        const domainPromise = formValue.customDomain
          ? this.tenantService.registerDomain(formValue.customDomain, userId).pipe(take(1)).toPromise()
          : Promise.resolve();

        // Wait for both to complete
        Promise.all([usernamePromise, domainPromise]).then(() => {
          this.saving = false;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        }).catch((err) => {
          console.error('Error registering username or domain:', err);
          this.saving = false;
        });
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        this.saving = false;
      }
    });
  }

  get portfolioUrl(): string {
    const customDomain = this.settingsForm.get('customDomain')?.value;
    const username = this.settingsForm.get('username')?.value;
    const userId = this.currentUser?.uid;
    
    // Priority: Custom domain > Username > User ID
    if (customDomain) {
      return `https://${customDomain}`;
    } else if (username) {
      return `${window.location.origin}/u/${username}`;
    } else if (userId) {
      return `${window.location.origin}/portfolio/${userId}`;
    }
    return '';
  }
}
