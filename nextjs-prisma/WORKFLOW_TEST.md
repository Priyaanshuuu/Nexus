# Nexus Workflow Test Checklist

## Prerequisites
- Server running: `npm run dev`
- Browser: Chrome/Firefox (incognito/private mode recommended)
- URL: `http://localhost:3000`

---

## 1. Landing Page
- [ ] Navigate to `http://localhost:3000`
- [ ] See landing page with "Nexus" title
- [ ] "Sign In" button visible
- [ ] "Sign Up" button visible
- [ ] No JWT errors in console

---

## 2. Sign Up Flow
- [ ] Click "Sign Up" button → redirects to `/auth/signup`
- [ ] Fill form:
  - Email: `test@example.com`
  - Password: `Password123!`
  - Name: `Test User`
- [ ] Click "Create Account"
- [ ] User created in database ✓
- [ ] Auto-redirect to `/dashboard` ✓
- [ ] See "My Documents" page

---

## 3. Dashboard Page
- [ ] URL is `/dashboard`
- [ ] See header: "My Documents"
- [ ] See "New Document" button (blue)
- [ ] Documents grid visible (empty if first time)
- [ ] No errors in console

---

## 4. Create Document
- [ ] Click "New Document" button
- [ ] Modal appears with title input
- [ ] Enter title: `Test Document`
- [ ] Click "Create" button
- [ ] Modal closes ✓
- [ ] Redirects to `/editor/{docId}` ✓
- [ ] Document loads in editor

---

## 5. Editor Page
- [ ] URL shows `/editor/{docId}`
- [ ] Editor header shows document title
- [ ] Editable content area visible
- [ ] Can type in editor ✓
- [ ] Content updates without errors

---

## 6. Sign Out
- [ ] Click user menu/profile button (if visible)
- [ ] Click "Sign Out"
- [ ] Redirects to home page (`/`)
- [ ] Session cleared ✓

---

## 7. Sign In Flow
- [ ] Click "Sign In" → `/auth/signin`
- [ ] Fill form:
  - Email: `test@example.com`
  - Password: `Password123!`
- [ ] Click "Sign In"
- [ ] Redirects to `/dashboard` ✓
- [ ] User documents visible ✓

---

## 8. OAuth (Optional)
- [ ] Click "Sign in with Google/GitHub"
- [ ] Redirects to provider
- [ ] Returns to `/dashboard` after auth
- [ ] User created/logged in

---

## 9. Permission Check
- [ ] Create a document as `test@example.com`
- [ ] Share with another user (if collaborators feature exists)
- [ ] Verify viewer/editor roles respected

---

## 10. Error Scenarios
- [ ] Sign up with duplicate email → Error shown ✓
- [ ] Sign in with wrong password → Error shown ✓
- [ ] Sign in with non-existent email → Error shown ✓
- [ ] Access `/dashboard` without auth → Redirects to `/auth/signin` ✓
- [ ] Access `/editor/{wrongId}` → Redirects to `/dashboard` ✓

---

## Terminal Checks
```bash
# Check no errors in dev server
npm run dev

# Check database has users
npx prisma studio
# Look for users in User table

# Check auth config is loaded
grep AUTH .env.local
# Should show: AUTH_URL and AUTH_SECRET
```

---

## Expected Results
✅ All flows work without JWT errors
✅ Documents persist in database
✅ Auth state maintained across pages
✅ Redirects work for unauthenticated users
✅ No console errors

---

## Debug Commands
```bash
# Clear Next.js cache if issues persist
rm -rf .next

# Restart dev server
npm run dev

# Check browser cookies (DevTools → Application → Cookies)
# Should have: auth-session or similar

# Clear all browser data
# DevTools → Storage → Clear site data
```

---

Run through this checklist and let me know which steps fail!
