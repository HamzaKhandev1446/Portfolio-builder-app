/**
 * Preview Panel Component
 * Left panel - Live portfolio preview
 */

import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ComponentRef, ViewContainerRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Portfolio } from '../../../../../models/portfolio.model';
import { TemplateService } from '../../../../../features/templates/template.service';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-panel.component.html',
  styleUrls: ['./preview-panel.component.scss']
})
export class PreviewPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() portfolio: Portfolio | null = null;
  @ViewChild('templateContainer', { read: ViewContainerRef }) templateContainer!: ViewContainerRef;
  
  private componentRef: ComponentRef<any> | null = null;

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    if (this.portfolio) {
      this.loadTemplate();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['portfolio'] && this.portfolio) {
      this.loadTemplate();
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  private loadTemplate(): void {
    if (!this.portfolio || !this.templateContainer) {
      return;
    }

    const template = this.templateService.getTemplate(this.portfolio.templateId);
    if (!template) {
      console.warn(`Template ${this.portfolio.templateId} not found`);
      return;
    }

    // Clear existing template
    this.templateContainer.clear();

    // Load new template component
    this.componentRef = this.templateContainer.createComponent(template.component);
    this.componentRef.instance.portfolio = this.portfolio;
  }
}
