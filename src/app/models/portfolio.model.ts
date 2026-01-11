/**
 * Portfolio Data Models
 * Core interfaces for portfolio structure
 */

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: number; // 1-100
  category?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
  codeUrl?: string;
  technologies?: string[];
  featured?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string; // null for current position
  description: string;
  location?: string;
}

export interface Theme {
  primaryColor: string;
  secondaryColor?: string;
  font: string;
  fontSize?: string;
}

export interface Portfolio {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  theme: Theme;
  templateId: string;
  status: 'draft' | 'published';
  lastUpdated?: string;
  createdAt?: string;
}

/**
 * Default empty portfolio structure
 */
export function createEmptyPortfolio(): Portfolio {
  return {
    profile: {
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      avatarUrl: '',
      socialLinks: {}
    },
    skills: [],
    projects: [],
    experience: [],
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      font: 'Inter',
      fontSize: '16px'
    },
    templateId: 'template-1',
    status: 'draft',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
}
