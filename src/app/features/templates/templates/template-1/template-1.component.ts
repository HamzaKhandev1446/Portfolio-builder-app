/**
 * Template 1 Component
 * Default portfolio template
 */

import { Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { BaseTemplateComponent } from '../../base/base-template.component';
import { Portfolio } from '../../../../models/portfolio.model';

@Component({
  selector: 'app-template-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-1.component.html',
  styleUrls: ['./template-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('pulse', [
      state('in', style({ transform: 'scale(1)' })),
      transition(':enter', [
        animate('0.6s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('bounce', [
      transition(':enter', [
        animate('2s ease-in-out infinite', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(-10px)', offset: 0.5 }),
          style({ transform: 'translateY(0)', offset: 1 })
        ]))
      ])
    ]),
    trigger('fadeInOnScroll', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('slideWidth', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('1s ease-out', style({ width: '*' }))
      ])
    ])
  ]
})
export class Template1Component extends BaseTemplateComponent implements AfterViewInit {
  currentYear = new Date().getFullYear();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    if (this.portfolio) {
      this.cdr.detectChanges();
      this.setupScrollAnimations();
      setTimeout(() => this.cdr.detectChanges(), 0);
      setTimeout(() => this.cdr.detectChanges(), 100);
      setTimeout(() => this.cdr.detectChanges(), 200);
    }
  }
  
  override ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['portfolio'] && this.portfolio) {
      this.cdr.detectChanges();
      setTimeout(() => this.cdr.detectChanges(), 0);
      this.setupScrollAnimations();
    }
  }

  private setupScrollAnimations(): void {
    // Intersection Observer for scroll animations
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });

      setTimeout(() => {
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(el => observer.observe(el));
      }, 100);
    }
  }
}
