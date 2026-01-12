/**
 * Template Registry
 * Registers all available templates
 */

import { TemplateService } from './template.service';
import { Template1Component } from './templates/template-1/template-1.component';

export function registerTemplates(templateService: TemplateService): void {
  // Register Template 1
  templateService.registerTemplate({
    id: 'template-1',
    name: 'Modern Portfolio',
    description: 'A clean and modern portfolio template',
    previewImage: '/assets/templates/template-1-preview.png',
    component: Template1Component,
    category: 'modern',
    features: ['Hero section', 'Skills display', 'Projects grid', 'Experience timeline']
  });

  // Add more templates here as you create them
  // templateService.registerTemplate({
  //   id: 'template-2',
  //   name: 'Classic Portfolio',
  //   description: 'A classic and professional portfolio template',
  //   previewImage: '/assets/templates/template-2-preview.png',
  //   component: Template2Component,
  //   category: 'classic',
  //   features: ['Minimalist design', 'Timeline layout']
  // });
}
