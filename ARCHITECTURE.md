# Portfolio Builder SaaS - Architecture Documentation

## 📐 Project Architecture

### Technology Stack
- **Framework:** Angular v20
- **Backend:** Firebase (Authentication + Realtime Database)
- **State Management:** RxJS Observables + Services
- **Styling:** CSS/SCSS with CSS Variables for theming

---

## 🗂️ Folder Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       └── firebase.service.ts
│   │
│   ├── shared/                   # Shared components, pipes, directives
│   │   ├── components/
│   │   │   ├── loading-spinner/
│   │   │   └── error-message/
│   │   ├── pipes/
│   │   └── directives/
│   │
│   ├── features/                 # Feature modules
│   │   ├── public/               # Public portfolio view
│   │   │   ├── public-portfolio.component.ts
│   │   │   └── public-portfolio.component.html
│   │   │
│   │   ├── admin/                # Admin module
│   │   │   ├── admin-routing.module.ts
│   │   │   ├── admin.component.ts
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   └── login.component.html
│   │   │   └── editor/
│   │   │       ├── editor.component.ts
│   │   │       ├── editor.component.html
│   │   │       ├── components/
│   │   │       │   ├── preview-panel/      # Left panel
│   │   │       │   │   └── preview-panel.component.ts
│   │   │       │   └── editor-panel/       # Right panel
│   │   │       │       └── editor-panel.component.ts
│   │   │       └── forms/
│   │   │           ├── profile-form/
│   │   │           ├── skills-form/
│   │   │           ├── projects-form/
│   │   │           ├── experience-form/
│   │   │           └── theme-form/
│   │   │
│   │   └── templates/            # Template system
│   │       ├── template.service.ts
│   │       ├── template-registry.ts
│   │       ├── base/
│   │       │   └── base-template.component.ts
│   │       └── templates/
│   │           ├── template-1/
│   │           │   ├── template-1.component.ts
│   │           │   └── template-1.component.html
│   │           └── template-2/
│   │               ├── template-2.component.ts
│   │               └── template-2.component.html
│   │
│   ├── models/                   # TypeScript interfaces/models
│   │   ├── portfolio.model.ts
│   │   ├── template.model.ts
│   │   └── user.model.ts
│   │
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app-routing.module.ts
│   └── app.module.ts
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles/
    ├── styles.scss
    ├── _variables.scss
    └── _themes.scss
```

---

## 🏗️ Architecture Patterns

### 1. **Service-Based Architecture**
- **AuthService:** Handles Firebase Authentication
- **PortfolioService:** Manages portfolio data (CRUD operations)
- **TemplateService:** Manages template registry and switching
- **FirebaseService:** Wrapper for Firebase Realtime Database

### 2. **Component Communication**
- **Parent-Child:** Input/Output bindings for editor → preview
- **Service Communication:** RxJS BehaviorSubject for real-time updates
- **State Management:** Centralized portfolio state in PortfolioService

### 3. **Template System**
- **Base Template:** Abstract base class for all templates
- **Template Registry:** Service that maps template IDs to components
- **Dynamic Component Loading:** Angular's ComponentFactoryResolver or ViewContainerRef

### 4. **Data Flow**

```
Editor Form Changes
    ↓
PortfolioService.updateDraft()
    ↓
BehaviorSubject.next(newData)
    ↓
Preview Component (subscribes)
    ↓
Template Component (receives data)
    ↓
UI Updates (instant)
```

---

## 🔐 Authentication Flow

1. User navigates to `/admin`
2. AuthGuard checks authentication status
3. If not authenticated → redirect to `/admin` (login screen)
4. If authenticated → allow access to `/admin/editor`
5. Session persisted via Firebase Auth

---

## 📦 Module Organization

### Core Module
- Singleton services
- Guards
- Interceptors
- Should be imported once in AppModule

### Shared Module
- Reusable components
- Pipes
- Directives
- Can be imported by multiple feature modules

### Feature Modules
- **Public Module:** Public portfolio view
- **Admin Module:** Admin dashboard and editor
- **Templates Module:** Template components (lazy-loaded if needed)

---

## 🎨 Template System Design

### Template Interface
```typescript
interface Template {
  id: string;
  name: string;
  previewImage: string;
  component: Type<any>;
}
```

### Template Registry Pattern
- Centralized registry of all available templates
- Easy to add new templates
- Template switching without data loss
- Decoupled from content data

### Template Component Structure
- All templates extend `BaseTemplateComponent`
- Receive portfolio data via `@Input()`
- Apply theme via CSS variables
- Render sections conditionally based on enabled flags

---

## 🔄 Real-Time Updates

### Debouncing Strategy
- Form inputs debounced (300ms) before updating preview
- Save operations debounced (1000ms) before Firebase write
- Immediate preview updates for better UX

### State Management
- **Draft State:** Local state in PortfolioService
- **Published State:** Firebase Realtime Database
- **Sync Strategy:** Manual save/publish actions

---

## 🚀 Performance Optimizations

1. **Lazy Loading:** Admin and template modules
2. **OnPush Change Detection:** For preview components
3. **TrackBy Functions:** For *ngFor loops
4. **Debouncing:** Form inputs and save operations
5. **Image Lazy Loading:** For portfolio images

---

## 📝 Data Models

### Portfolio Model
```typescript
interface Portfolio {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  theme: Theme;
  templateId: string;
  status: 'draft' | 'published';
}
```

### Firebase Structure
```
/portfolios/
  /{userId}/
    /draft/
      {portfolio data}
    /published/
      {portfolio data}
```

---

## 🔒 Security Considerations

1. **Route Guards:** Protect admin routes
2. **Firebase Rules:** User can only access their own data
3. **Input Sanitization:** Sanitize user inputs
4. **XSS Prevention:** Angular's built-in sanitization

---

## 📱 Responsive Design

- **Mobile First:** Base styles for mobile
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Preview Panel:** Responsive viewport switcher in editor

---

## 🧪 Testing Strategy

- **Unit Tests:** Services, components, guards
- **Integration Tests:** Editor → Preview data flow
- **E2E Tests:** Critical user flows (login, edit, publish)
