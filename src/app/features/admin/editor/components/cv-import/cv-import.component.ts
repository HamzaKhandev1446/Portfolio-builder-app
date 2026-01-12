/**
 * CV Import Component
 * Allows users to import their CV/resume to automatically fill portfolio data
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '../../../../../models/portfolio.model';

@Component({
  selector: 'app-cv-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-import.component.html',
  styleUrls: ['./cv-import.component.scss']
})
export class CvImportComponent {
  @Output() portfolioImported = new EventEmitter<Partial<Portfolio>>();
  
  isImporting = false;
  error: string | null = null;
  success = false;
  selectedFile: File | null = null;
  previewText = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.error = null;
      this.success = false;
      this.readFile();
    }
  }

  private readFile(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    
    if (this.selectedFile.type === 'application/pdf') {
      this.error = 'PDF parsing is not yet supported. Please convert your CV to a text file (.txt) first.';
      return;
    }

    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.previewText = text;
      this.parseCV(text);
    };

    reader.onerror = () => {
      this.error = 'Error reading file. Please try again.';
    };

    reader.readAsText(this.selectedFile);
  }

  private parseCV(text: string): void {
    try {
      this.isImporting = true;
      this.error = null;

      const portfolio: Partial<Portfolio> = {
        profile: this.extractProfile(text),
        skills: this.extractSkills(text),
        experience: this.extractExperience(text),
        projects: this.extractProjects(text)
      };

      this.portfolioImported.emit(portfolio);
      this.success = true;
      this.isImporting = false;
    } catch (err) {
      this.error = 'Error parsing CV: ' + (err instanceof Error ? err.message : 'Unknown error');
      this.isImporting = false;
    }
  }

  private extractProfile(text: string): any {
    const profile: any = {};
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Extract name (usually first line or after "Name:")
    const nameMatch = text.match(/name\s*:?\s*([^\n]+)/i) || 
                     text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
    if (nameMatch) {
      profile.name = nameMatch[1].trim();
    }

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      profile.email = emailMatch[1].trim();
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?[\d\s\-()]{10,})/);
    if (phoneMatch) {
      profile.phone = phoneMatch[1].trim();
    }

    // Extract title (look for common patterns)
    const titlePatterns = [
      /(?:title|position|role)\s*:?\s*([^\n]+)/i,
      /(?:software engineer|developer|designer|manager|director|senior|junior|lead)\s+([^\n]+)/i
    ];
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        profile.title = match[1].trim();
        break;
      }
    }

    // Extract bio (usually in "About", "Summary", or "Objective" section)
    const bioMatch = text.match(/(?:about|summary|objective|profile)\s*:?\s*([^\n]{50,500})/i);
    if (bioMatch) {
      profile.bio = bioMatch[1].trim().substring(0, 500);
    }

    // Extract location
    const locationMatch = text.match(/(?:location|address|city|based in)\s*:?\s*([^\n]+)/i);
    if (locationMatch) {
      profile.location = locationMatch[1].trim();
    }

    // Extract social links
    const linkedInMatch = text.match(/(?:linkedin|linkedin\.com\/in\/)([a-zA-Z0-9-]+)/i);
    const githubMatch = text.match(/(?:github|github\.com\/)([a-zA-Z0-9-]+)/i);
    const websiteMatch = text.match(/(https?:\/\/[^\s]+)/i);

    if (linkedInMatch || githubMatch || websiteMatch) {
      profile.socialLinks = {};
      if (linkedInMatch) {
        profile.socialLinks.linkedin = `https://linkedin.com/in/${linkedInMatch[1]}`;
      }
      if (githubMatch) {
        profile.socialLinks.github = `https://github.com/${githubMatch[1]}`;
      }
      if (websiteMatch) {
        profile.socialLinks.website = websiteMatch[1];
      }
    }

    return profile;
  }

  private extractSkills(text: string): any[] {
    const skills: any[] = [];
    
    // Look for skills section
    const skillsMatch = text.match(/(?:skills|technical skills|technologies?|competencies?)\s*:?\s*([^\n]{50,1000})/i);
    if (skillsMatch) {
      const skillsText = skillsMatch[1];
      // Extract common technologies/skills
      const skillPatterns = [
        /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/gi,
        /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel)\b/gi,
        /\b(HTML|CSS|SCSS|SASS|Tailwind|Bootstrap)\b/gi,
        /\b(SQL|MySQL|PostgreSQL|MongoDB|Redis|Firebase)\b/gi,
        /\b(AWS|Azure|GCP|Docker|Kubernetes|Git|CI\/CD)\b/gi,
        /\b(UI\/UX|Figma|Adobe|Photoshop|Illustrator)\b/gi
      ];

      const foundSkills = new Set<string>();
      
      for (const pattern of skillPatterns) {
        const matches = skillsText.match(pattern);
        if (matches) {
          matches.forEach(match => foundSkills.add(match));
        }
      }

      // Also look for comma-separated or line-separated skills
      const commaSkills = skillsText.match(/[A-Za-z][A-Za-z\s/&]+/g);
      if (commaSkills) {
        commaSkills.slice(0, 20).forEach(skill => {
          const trimmed = skill.trim();
          if (trimmed.length > 2 && trimmed.length < 30) {
            foundSkills.add(trimmed);
          }
        });
      }

      Array.from(foundSkills).slice(0, 20).forEach(skill => {
        skills.push({
          name: skill,
          level: 75 // Default level, user can adjust
        });
      });
    }

    return skills;
  }

  private extractExperience(text: string): any[] {
    const experience: any[] = [];
    
    // Look for experience section
    const expSectionMatch = text.match(/(?:experience|work experience|employment|career)\s*:?\s*([\s\S]{200,5000})/i);
    if (expSectionMatch) {
      const expText = expSectionMatch[1];
      
      // Try to extract job entries (common patterns)
      const jobPattern = /([A-Z][^\n]+?)\s+at\s+([A-Z][^\n]+?)(?:\s+\(([^\n]+?)\))?\s*([^\n]{50,300})/gi;
      let match;
      let count = 0;
      
      while ((match = jobPattern.exec(expText)) !== null && count < 10) {
        const position = match[1].trim();
        const company = match[2].trim();
        const dates = match[3]?.trim() || '';
        const description = match[4]?.trim() || '';

        const dateParts = this.parseDates(dates);
        
        experience.push({
          position,
          company,
          startDate: dateParts.start || new Date().toISOString(),
          endDate: dateParts.end,
          description
        });
        count++;
      }

      // Alternative pattern: line by line parsing
      if (experience.length === 0) {
        const lines = expText.split('\n').map(l => l.trim()).filter(l => l.length > 10);
        for (let i = 0; i < Math.min(lines.length, 10); i += 3) {
          if (lines[i]) {
            experience.push({
              position: lines[i],
              company: lines[i + 1] || 'Company',
              startDate: new Date().toISOString(),
              description: lines[i + 2] || ''
            });
          }
        }
      }
    }

    return experience.slice(0, 10); // Limit to 10 entries
  }

  private extractProjects(text: string): any[] {
    const projects: any[] = [];
    
    const projectsMatch = text.match(/(?:projects|portfolio|projects?)\s*:?\s*([\s\S]{200,3000})/i);
    if (projectsMatch) {
      const projText = projectsMatch[1];
      const lines = projText.split('\n').map(l => l.trim()).filter(l => l.length > 10);
      
      for (let i = 0; i < Math.min(lines.length, 10); i += 2) {
        if (lines[i]) {
          projects.push({
            title: lines[i],
            description: lines[i + 1] || 'Project description'
          });
        }
      }
    }

    return projects.slice(0, 10);
  }

  private parseDates(dateString: string): { start?: string; end?: string } {
    const result: { start?: string; end?: string } = {};
    
    // Try to parse dates like "Jan 2020 - Dec 2022" or "2020 - Present"
    const dateRangeMatch = dateString.match(/(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)/i);
    if (dateRangeMatch) {
      result.start = this.parseMonthYear(dateRangeMatch[1]);
      if (dateRangeMatch[2].toLowerCase() !== 'present' && dateRangeMatch[2].toLowerCase() !== 'current') {
        result.end = this.parseMonthYear(dateRangeMatch[2]);
      }
    } else {
      // Try single date
      const singleDate = dateString.match(/\w+\s+\d{4}/);
      if (singleDate) {
        result.start = this.parseMonthYear(singleDate[0]);
      }
    }

    return result;
  }

  private parseMonthYear(dateStr: string): string {
    const months: { [key: string]: string } = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    const match = dateStr.match(/(\w+)\s+(\d{4})/);
    if (match) {
      const month = months[match[1].toLowerCase().substring(0, 3)] || '01';
      const year = match[2];
      return `${year}-${month}-01`;
    }

    return new Date().toISOString();
  }

  onImport(): void {
    if (this.previewText) {
      this.parseCV(this.previewText);
    }
  }

  onCancel(): void {
    this.selectedFile = null;
    this.previewText = '';
    this.error = null;
    this.success = false;
  }
}
