/**
 * Tenant/User Configuration Models
 * For SaaS multi-tenant support
 */

export interface TenantConfig {
  userId: string;
  username?: string; // Friendly URL slug (e.g., "john-doe")
  customDomain?: string; // Custom domain (e.g., "john.portfolios.com")
  subdomain?: string; // Subdomain (e.g., "john" from john.portfolios.com)
  isActive: boolean;
  plan?: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  lastUpdated: string;
}

export interface UserMetadata {
  userId: string;
  email: string;
  username?: string;
  displayName?: string;
  tenantConfig?: TenantConfig;
}
