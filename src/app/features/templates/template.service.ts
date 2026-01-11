/**
 * Template Service
 * Manages template registry and switching
 */

import { Injectable } from '@angular/core';
import { Template } from '../../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private templates: Map<string, Template> = new Map();

  constructor() {
    // Templates will be registered via registerTemplate method
  }

  /**
   * Register a template
   */
  registerTemplate(template: Template): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Check if template exists
   */
  hasTemplate(id: string): boolean {
    return this.templates.has(id);
  }
}
