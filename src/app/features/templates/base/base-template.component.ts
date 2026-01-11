/**
 * Base Template Component
 * Abstract base class for all portfolio templates
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Portfolio } from '../../../models/portfolio.model';

@Component({
  template: '' // Abstract component, no template
})
export abstract class BaseTemplateComponent implements OnInit, OnChanges {
  @Input() portfolio!: Portfolio;

  ngOnInit(): void {
    this.applyTheme();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['portfolio'] && !changes['portfolio'].firstChange) {
      this.applyTheme();
    }
  }

  /**
   * Apply theme to component
   * Override in child components for custom theme application
   */
  protected applyTheme(): void {
    if (!this.portfolio?.theme) {
      return;
    }

    const root = document.documentElement;
    const theme = this.portfolio.theme;

    // Set CSS variables for theming
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor || theme.primaryColor);
    root.style.setProperty('--font-family', theme.font);
    root.style.setProperty('--font-size', theme.fontSize || '16px');
  }

  /**
   * Check if section is enabled
   */
  protected isSectionEnabled(section: keyof Portfolio): boolean {
    // This can be extended based on template config
    return true;
  }
}
