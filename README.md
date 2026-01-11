# Portfolio Builder SaaS

A production-ready, template-based portfolio builder web application built with Angular v20 and Firebase.

## 🚀 Features

- **Two-Panel Live Editor:** Real-time preview with instant updates
- **Template System:** Pluggable, extensible template architecture
- **Firebase Integration:** Authentication and Realtime Database
- **Responsive Design:** Mobile, tablet, and desktop support
- **Admin Dashboard:** Protected routes with authentication
- **Public Portfolio:** SEO-friendly public view

## 📁 Project Structure

```
src/app/
├── core/              # Singleton services, guards
├── shared/            # Reusable components
├── features/          # Feature modules
│   ├── public/        # Public portfolio view
│   ├── admin/         # Admin dashboard & editor
│   └── templates/     # Template system
└── models/            # TypeScript interfaces
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 20
- Firebase project with Realtime Database enabled

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Firebase:**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Copy your Firebase config to `src/environments/environment.ts`

3. **Run development server:**
```bash
ng serve
```

4. **Build for production:**
```bash
ng build --configuration production
```

## 📖 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🔐 Authentication

- Email/Password authentication via Firebase
- Protected admin routes with route guards
- Session persistence

## 🎨 Templates

Templates are Angular components that extend `BaseTemplateComponent`. Each template:
- Receives portfolio data via `@Input()`
- Applies theme via CSS variables
- Renders sections conditionally

## 📝 Data Model

Portfolio data structure:
- Profile (name, title, bio, contact info)
- Skills (array with levels)
- Projects (array with images, links)
- Experience (work history)
- Theme (colors, fonts)
- Template ID
- Status (draft/published)

## 🚧 Development Status

This is the initial architecture setup. Next steps:
1. Implement template components
2. Build admin editor forms
3. Create preview panel
4. Add Firebase configuration
5. Implement responsive design

## 📄 License

MIT
