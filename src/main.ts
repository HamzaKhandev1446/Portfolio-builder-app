import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { TemplateService } from './app/features/templates/template.service';
import { registerTemplates } from './app/features/templates/template-registry';

// Check if Firebase is configured
const isFirebaseConfigured = environment.firebase.apiKey !== 'YOUR_API_KEY';

const providers = [
  provideRouter(routes),
  provideAnimations()
];

// Only add Firebase providers if configured
if (isFirebaseConfigured) {
  providers.push(
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())
  );
} else {
  console.warn('Firebase not configured. Update src/environments/environment.ts with your Firebase credentials.');
}

bootstrapApplication(AppComponent, {
  providers
}).catch(err => {
  console.error('Error bootstrapping application:', err);
});
