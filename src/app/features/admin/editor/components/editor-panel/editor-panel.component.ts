/**
 * Editor Panel Component
 * Right panel - Form-based editor
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Portfolio } from '../../../../../models/portfolio.model';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editor-panel.component.html',
  styleUrls: ['./editor-panel.component.scss']
})
export class EditorPanelComponent implements OnInit, OnChanges {
  @Input() portfolio: Portfolio | null = null;
  @Output() portfolioUpdate = new EventEmitter<Partial<Portfolio>>();

  editorForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.portfolio) {
      this.populateForm(this.portfolio);
    }

    // Debounce form changes for live preview
    this.editorForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.editorForm.valid) {
          this.emitUpdate();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['portfolio'] && this.portfolio && !changes['portfolio'].firstChange) {
      this.populateForm(this.portfolio);
    }
  }

  private initForm(): void {
    this.editorForm = this.fb.group({
      profile: this.fb.group({
        name: [''],
        title: [''],
        bio: [''],
        email: [''],
        phone: [''],
        location: [''],
        avatarUrl: ['']
      }),
      skills: this.fb.array([]),
      projects: this.fb.array([]),
      experience: this.fb.array([]),
      theme: this.fb.group({
        primaryColor: [''],
        secondaryColor: [''],
        font: ['']
      }),
      templateId: ['']
    });
  }

  private populateForm(portfolio: Portfolio): void {
    this.editorForm.patchValue({
      profile: portfolio.profile,
      theme: portfolio.theme,
      templateId: portfolio.templateId
    });

    // Populate arrays
    this.setFormArray('skills', portfolio.skills);
    this.setFormArray('projects', portfolio.projects);
    this.setFormArray('experience', portfolio.experience);
  }

  private setFormArray(controlName: string, items: any[]): void {
    const formArray = this.editorForm.get(controlName) as FormArray;
    formArray.clear();
    items.forEach(item => {
      formArray.push(this.fb.group(item));
    });
  }

  private emitUpdate(): void {
    this.portfolioUpdate.emit(this.editorForm.value);
  }

  get skillsFormArray(): FormArray {
    return this.editorForm.get('skills') as FormArray;
  }

  get projectsFormArray(): FormArray {
    return this.editorForm.get('projects') as FormArray;
  }

  get experienceFormArray(): FormArray {
    return this.editorForm.get('experience') as FormArray;
  }

  addSkill(): void {
    this.skillsFormArray.push(this.fb.group({
      id: [this.generateId()],
      name: [''],
      level: [50],
      category: ['']
    }));
  }

  removeSkill(index: number): void {
    this.skillsFormArray.removeAt(index);
  }

  addProject(): void {
    this.projectsFormArray.push(this.fb.group({
      id: [this.generateId()],
      title: [''],
      description: [''],
      imageUrl: [''],
      liveUrl: [''],
      codeUrl: [''],
      technologies: [[]],
      featured: [false]
    }));
  }

  removeProject(index: number): void {
    this.projectsFormArray.removeAt(index);
  }

  addExperience(): void {
    this.experienceFormArray.push(this.fb.group({
      id: [this.generateId()],
      company: [''],
      position: [''],
      startDate: [''],
      endDate: [''],
      description: [''],
      location: ['']
    }));
  }

  removeExperience(index: number): void {
    this.experienceFormArray.removeAt(index);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
