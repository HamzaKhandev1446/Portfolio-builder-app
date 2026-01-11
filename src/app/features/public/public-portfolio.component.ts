/**
 * Public Portfolio Component
 * Public-facing portfolio view (read-only)
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Portfolio } from '../../models/portfolio.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-public-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-portfolio.component.html',
  styleUrls: ['./public-portfolio.component.scss']
})
export class PublicPortfolioComponent implements OnInit {
  portfolio$!: Observable<Portfolio | null>;
  userId: string = ''; // TODO: Get from route or config

  constructor(
    private portfolioService: PortfolioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // TODO: Get userId from route params or configuration
    // For now, using a placeholder
    this.userId = this.route.snapshot.params['userId'] || 'default';
    this.portfolio$ = this.portfolioService.getPublicPortfolio(this.userId);
  }
}
