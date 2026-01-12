# 🔥 Firebase Setup Guide

## ✅ Current Status
You've reached the Firebase Console! Now let's configure everything properly.

## 📋 Step-by-Step Firebase Setup

### Step 1: Get Your Firebase Configuration

1. **In Firebase Console, click the gear icon** (⚙️) next to "Project Overview"
2. **Select "Project settings"**
3. **Scroll down to "Your apps"** section
4. **If you don't have a web app yet:**
   - Click the **Web icon** (`</>`) to add a web app
   - Register your app (give it a nickname like "Portfolio Builder")
   - **Don't** check "Also set up Firebase Hosting" (we don't need it)
   - Click "Register app"

5. **Copy your Firebase config:**
   - You'll see a code block with your config
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### Step 2: Update Your Environment File

1. **Open** `src/environments/environment.ts` in your project
2. **Replace** the placeholder values with your actual Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY_HERE',
    authDomain: 'YOUR_AUTH_DOMAIN_HERE',
    databaseURL: 'YOUR_DATABASE_URL_HERE',
    projectId: 'YOUR_PROJECT_ID_HERE',
    storageBucket: 'YOUR_STORAGE_BUCKET_HERE',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID_HERE',
    appId: 'YOUR_APP_ID_HERE'
  }
};
```

### Step 3: Enable Authentication

1. **In Firebase Console**, go to **"Authentication"** (left sidebar)
2. **Click "Get started"** if you haven't enabled it yet
3. **Go to "Sign-in method"** tab
4. **Click on "Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. **Click "Save"**

### Step 4: Configure Realtime Database Rules

1. **In Firebase Console**, go to **"Realtime Database"** (left sidebar)
2. **Click on "Rules"** tab (you're already there!)
3. **Replace the rules** with this:

```json
{
  "rules": {
    "portfolios": {
      "$userId": {
        ".read": "$userId === auth.uid || data.child('published').exists()",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

**What these rules do:**
- Users can only read/write their own portfolio data
- Published portfolios can be read by anyone (for public view)
- Draft portfolios are private to the owner

4. **Click "Publish"** to save the rules

### Step 5: Create Your Database

1. **In Firebase Console**, go to **"Realtime Database"**
2. **Click "Create database"** if you haven't created one yet
3. **Choose location:** Select the same region (e.g., Belgium/europe-west1)
4. **Security rules:** Choose "Start in test mode" (we'll update rules in Step 4)
5. **Click "Enable"**

### Step 6: Restart Your Dev Server

1. **In your terminal**, press `Ctrl + C` to stop the server
2. **Run** `ng serve` again
3. **Wait** for compilation to complete

### Step 7: Test Your Setup

1. **Open** `http://localhost:4200/admin` in your browser
2. **You should see** the login page (not errors!)
3. **Create an account:**
   - Click "Sign Up" (if you have that option) or use the login form
   - Enter email and password
   - This will create a user in Firebase Authentication

## ✅ Verification Checklist

- [ ] Firebase config copied to `environment.ts`
- [ ] Authentication enabled (Email/Password)
- [ ] Realtime Database created
- [ ] Database rules updated
- [ ] Dev server restarted
- [ ] Can access `/admin` without errors
- [ ] Can create/login with an account

## 🎯 Next Steps After Setup

Once Firebase is configured:

1. **Create your first portfolio:**
   - Go to `/admin/editor`
   - Fill in your portfolio information
   - Click "Save Draft"
   - Click "Publish" when ready

2. **View your public portfolio:**
   - Go to `/` (home page)
   - Your published portfolio should appear

## 🐛 Troubleshooting

### "Firebase not configured" warnings
- Check that `environment.ts` has real values (not "YOUR_API_KEY")
- Make sure you restarted the dev server after updating

### Authentication errors
- Verify Email/Password is enabled in Firebase Console
- Check that your Firebase config is correct

### Database errors
- Verify Realtime Database is created
- Check that database rules are published
- Make sure database URL in config matches your database location

### Still seeing blank page?
- Check browser console (F12) for errors
- Verify all steps above are completed
- Try hard refresh: `Ctrl + Shift + R`

## 📝 Important Notes

- **Never commit** `environment.ts` with real credentials to public repos
- The `.gitignore` already excludes environment files
- For production, update `environment.prod.ts` with production Firebase project

---

**You're almost there! Follow these steps and your app will be fully functional! 🚀**
