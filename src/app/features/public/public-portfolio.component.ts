/**
 * Public Portfolio Component
 * Public-facing portfolio view (read-only)
 * Supports multi-tenant SaaS with user-specific URLs
 * Renders portfolio using selected template
 */

import { Component, OnInit, AfterViewInit, OnDestroy, ComponentRef, ViewContainerRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../../core/services/portfolio.service';
import { TenantService } from '../../core/services/tenant.service';
import { TemplateService } from '../../features/templates/template.service';
import { Portfolio } from '../../models/portfolio.model';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-public-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-portfolio.component.html',
  styleUrls: ['./public-portfolio.component.scss']
})
export class PublicPortfolioComponent implements OnInit, AfterViewInit, OnDestroy {
  portfolio: Portfolio | null = null;
  loading = true;
  error: string | null = null;
  
  @ViewChild('templateContainer', { read: ViewContainerRef }) templateContainer!: ViewContainerRef;
  componentRef: ComponentRef<any> | null = null; // Made public for template access
  private viewInitialized = false;

  constructor(
    private portfolioService: PortfolioService,
    private tenantService: TenantService,
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('PublicPortfolioComponent.ngOnInit() called');
    // Get userId, username, or domainPath from route params
    const userId = this.route.snapshot.params['userId'];
    const username = this.route.snapshot.params['username'];
    const domainPath = this.route.snapshot.params['domainPath']; // For path-based domains
    
    console.log('Route params:', { userId, username, domainPath });
    
    // Resolve userId from path-based domain, actual domain, or route params
    this.tenantService.resolveUserId(userId, username, domainPath).pipe(
      switchMap(resolvedUserId => {
        console.log('Resolved userId:', resolvedUserId);
        if (!resolvedUserId) {
          // Check if we're on a custom domain but no user found
          if (this.tenantService.isCustomDomain()) {
            this.error = 'Domain not configured or portfolio not found';
          } else {
            this.error = 'Portfolio not found';
          }
          this.loading = false;
          console.log('No userId resolved, error:', this.error);
          return of(null);
        }

        // Load portfolio for resolved user ID
        console.log('Loading portfolio for userId:', resolvedUserId);
        return this.portfolioService.getPublicPortfolio(resolvedUserId).pipe(
          map(portfolio => {
            console.log('Portfolio loaded:', portfolio);
            this.loading = false;
            if (!portfolio) {
              this.error = 'Portfolio not found or not published';
              console.log('Portfolio is null, error:', this.error);
            } else {
              console.log('Portfolio data:', {
                templateId: portfolio.templateId,
                hasProfile: !!portfolio.profile,
                status: portfolio.status
              });
            }
            return portfolio;
          })
        );
      })
    ).subscribe({
      next: (portfolio) => {
        console.log('Portfolio subscription next:', portfolio);
        this.portfolio = portfolio;
        // Load template if view is initialized
        if (this.viewInitialized && portfolio) {
          console.log('View initialized, loading template...');
          setTimeout(() => this.loadTemplate(), 0);
        } else {
          console.log('View not initialized yet or no portfolio');
        }
      },
      error: (err) => {
        console.error('Error in portfolio subscription:', err);
        this.loading = false;
        this.error = 'Error loading portfolio: ' + (err.message || err);
      }
    });
  }

  ngAfterViewInit(): void {
    console.log('PublicPortfolioComponent.ngAfterViewInit() called');
    this.viewInitialized = true;
    // Load template if portfolio is already loaded
    if (this.portfolio) {
      console.log('Portfolio already loaded, loading template...');
      setTimeout(() => this.loadTemplate(), 0);
    } else {
      console.log('No portfolio yet, waiting for ngOnInit...');
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  private loadTemplate(): void {
    console.log('loadTemplate() called', {
      hasPortfolio: !!this.portfolio,
      hasTemplateContainer: !!this.templateContainer,
      templateId: this.portfolio?.templateId
    });
    
    if (!this.portfolio) {
      console.warn('Cannot load template: portfolio is null');
      return;
    }
    
    if (!this.templateContainer) {
      console.warn('Cannot load template: templateContainer is null');
      return;
    }

    const template = this.templateService.getTemplate(this.portfolio.templateId);
    console.log('Template lookup:', {
      templateId: this.portfolio.templateId,
      templateFound: !!template
    });
    
    if (!template) {
      console.error(`Template ${this.portfolio.templateId} not found`);
      this.error = `Template ${this.portfolio.templateId} not found`;
      return;
    }

    try {
      // Clear existing template
      this.templateContainer.clear();

      // Load new template component
      console.log('Creating template component:', template.component.name);
      this.componentRef = this.templateContainer.createComponent(template.component);
      console.log('✅ Component created, instance:', this.componentRef.instance);
      
      // Set portfolio on component instance
      if (this.componentRef.instance && this.portfolio) {
        console.log('Setting portfolio on component instance:', this.portfolio.profile?.name);
        this.componentRef.instance.portfolio = this.portfolio;
        console.log('Portfolio set, component portfolio:', this.componentRef.instance.portfolio?.profile?.name);
        
        // Force change detection multiple times to ensure rendering
        console.log('Triggering change detection...');
        this.cdr.detectChanges();
        
        setTimeout(() => {
          console.log('Change detection 1');
          this.cdr.detectChanges();
        }, 0);
        
        setTimeout(() => {
          console.log('Change detection 2');
          this.cdr.detectChanges();
          
          // Verify the component rendered
          if (this.componentRef?.location) {
            const hostElement = this.componentRef.location.nativeElement;
            if (hostElement) {
              console.log('✅ Component host element:', hostElement);
              console.log('Component innerHTML length:', hostElement.innerHTML?.length || 0);
              console.log('Component offsetHeight:', hostElement.offsetHeight);
              console.log('Component visible:', hostElement.offsetHeight > 0);
            }
          } else {
            console.error('❌ Component host element not found!');
          }
        }, 100);
      } else {
        console.error('❌ Component instance or portfolio is null!', {
          hasInstance: !!this.componentRef.instance,
          hasPortfolio: !!this.portfolio
        });
      }
    } catch (error) {
      console.error('❌ Error creating template component:', error);
      this.error = 'Error loading template: ' + (error as Error).message;
    }
  }
}
