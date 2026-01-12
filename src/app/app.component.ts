import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemplateService } from './features/templates/template.service';
import { registerTemplates } from './features/templates/template-registry';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Portfolio Builder SaaS';

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    // Register all available templates
    registerTemplates(this.templateService);
  }
}
