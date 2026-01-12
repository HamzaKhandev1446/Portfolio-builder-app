# 🔍 Blank Page Debugging Guide

## Your User ID
From the API response, your user ID is: `o2iv742uiiYvv0Il5KHbi0CASHH2`

## 🔍 Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Refresh `http://localhost:4200/muhammadhamza.com`
4. **Copy ALL console logs** and share them

Look for these specific logs:
- `PublicPortfolioComponent.ngOnInit() called`
- `Route params: { ... }`
- `Resolved userId: ...`
- `Portfolio loaded: ...`
- Any errors in red

### Step 2: Check Firebase Console - Domain Registration

1. Go to **Firebase Console** → **Realtime Database** → **Data**
2. Look for: `domains/muhammadhamza_DOT_com`
3. **Does it exist?**
   - ✅ **YES** → Should contain your userId
   - ❌ **NO** → Domain not registered!

**If domain doesn't exist:**
- Go to `localhost:4200/admin/settings`
- Enter `muhammadhamza.com` in **Custom Domain** field
- Click "Save Settings"
- Check console for success/error

### Step 3: Check Firebase Console - Published Portfolio

1. Go to **Firebase Console** → **Realtime Database** → **Data**
2. Look for: `portfolios/o2iv742uiiYvv0Il5KHbi0CASHH2/published`
3. **Does it exist?**
   - ✅ **YES** → Should contain portfolio data
   - ❌ **NO** → Portfolio not published!

**If portfolio doesn't exist:**
- Go to `localhost:4200/admin/editor`
- Fill in portfolio data
- Click **"Publish"** (not just "Save Draft")
- Check console for success/error

### Step 4: Check Network Tab

1. Open DevTools → **Network** tab
2. Filter by **WS** (WebSocket) or **Fetch/XHR**
3. Look for requests to `*.firebasedatabase.app`
4. Check if any requests are failing (red)

---

## 🎯 Most Likely Issues

### Issue 1: Domain Not Registered (90% likely)
**Symptom:** Blank page, no errors in console

**Check:**
- Firebase Console → Data → `domains/muhammadhamza_DOT_com` exists?

**Fix:**
1. Go to `/admin/settings`
2. Enter `muhammadhamza.com` in Custom Domain
3. Save

### Issue 2: Portfolio Not Published (80% likely)
**Symptom:** Domain resolves, but portfolio is null

**Check:**
- Firebase Console → Data → `portfolios/o2iv742uiiYvv0Il5KHbi0CASHH2/published` exists?

**Fix:**
1. Go to `/admin/editor`
2. Fill data
3. Click **"Publish"**

### Issue 3: Template Not Loading (50% likely)
**Symptom:** Portfolio loads but template doesn't render

**Check Console for:**
- `Template template-1 not found`
- `Cannot load template: ...`

**Fix:**
- Template should auto-register, but check console

---

## 📋 Quick Checklist

Before visiting `localhost:4200/muhammadhamza.com`:

- [ ] Domain registered in Settings? → Check Firebase: `domains/muhammadhamza_DOT_com`
- [ ] Portfolio published? → Check Firebase: `portfolios/o2iv742uiiYvv0Il5KHbi0CASHH2/published`
- [ ] Firebase rules updated? → Check Rules tab
- [ ] No console errors? → Check Console tab
- [ ] User logged in when registering/publishing? → Should be logged in

---

## 🚀 Quick Fix Steps

1. **Register Domain:**
   ```
   localhost:4200/admin/settings
   → Enter: muhammadhamza.com (in Custom Domain field)
   → Save
   ```

2. **Publish Portfolio:**
   ```
   localhost:4200/admin/editor
   → Fill data
   → Click "Publish"
   ```

3. **Test:**
   ```
   localhost:4200/muhammadhamza.com
   → Should show portfolio
   ```

---

## 🔍 What to Share

Please share:
1. **All console logs** (especially errors)
2. **Firebase Console screenshot** showing:
   - `domains/` structure
   - `portfolios/o2iv742uiiYvv0Il5KHbi0CASHH2/` structure
3. **Any error messages** you see

This will help me pinpoint the exact issue! 🔍
