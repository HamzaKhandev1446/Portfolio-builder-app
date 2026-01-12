/**
 * Editor Component
 * Two-panel editor: Preview (left) + Editor (right)
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { Portfolio } from '../../../models/portfolio.model';
import { Observable } from 'rxjs';
import { PreviewPanelComponent } from './components/preview-panel/preview-panel.component';
import { EditorPanelComponent } from './components/editor-panel/editor-panel.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, PreviewPanelComponent, EditorPanelComponent],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  portfolio$!: Observable<Portfolio>;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.portfolio$ = this.portfolioService.portfolio$;
  }

  onPortfolioUpdate(updates: Partial<Portfolio>): void {
    this.portfolioService.updatePortfolio(updates);
  }

  onSave(): void {
    this.portfolioService.saveDraft().subscribe({
      next: () => console.log('Draft saved'),
      error: (err) => console.error('Error saving draft:', err)
    });
  }

  onPublish(): void {
    console.log('Publish button clicked');
    this.portfolioService.publish().subscribe({
      next: () => {
        console.log('Portfolio published successfully');
        alert('Portfolio published successfully! Your portfolio is now live.');
      },
      error: (err) => {
        console.error('Error publishing portfolio:', err);
        alert('Error publishing portfolio: ' + (err.message || err));
      }
    });
  }

  onReset(): void {
    this.portfolioService.reset();
  }
}
