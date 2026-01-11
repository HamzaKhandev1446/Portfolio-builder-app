/**
 * Template System Models
 */

import { Type } from '@angular/core';

export interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  component: Type<any>;
  category?: string;
  features?: string[];
}

export interface TemplateConfig {
  sections: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    experience: boolean;
    contact: boolean;
  };
  layout: {
    variant: string;
    sidebar?: boolean;
  };
}

export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  author?: string;
}
