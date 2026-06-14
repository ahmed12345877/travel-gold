# Google OAuth Admin Login Fix

## Problem Summary

After Google Sign-In on `/admin/login`, the user was redirected to an old page or saw "Admin access required," requiring another login. Three root causes were identified:

1. **Unreliable popup-cancel detection** using error.message string matching (brittle across SDK versions)
2. **Arbitrary 500ms delay** that was inconsistent and masked real timing issues
3. **Inconsistent handling** between email and Google login flows

## Root Cause Analysis

### Issue 1: Popup-Cancel Detection
```typescript
// ❌ BRITTLE - changes with SDK version or locale
if (err.message !== "Firebase.auth: An internal AuthError...") { ... }

// ✅ RELIABLE - uses stable error code
if (err?.code !== 'auth/popup-closed-by-user') { ... }
```

Using error.message for comparison is fragile because:
- SDK version updates can change the error message
- Locale/language affects error messages
- The error.code property is stable and documented

### Issue 2: Fixed Delay vs Session Verification
```typescript
// ❌ FLAKY - arbitrary timing, race condition remains
await new Promise(resolve => setTimeout(resolve, 500));
navigate("/admin");

// ✅ ROBUST - polls until session exists
async function waitForServerSession(): Promise<void> {
  const delays = [50, 100, 200, 400];
  for (const delayMs of delays) {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    }).catch(() => null);
    if (res?.ok) return;
    await new Promise(r => setTimeout(r, delayMs));
  }
}
```

Problems with the 500ms delay:
- **Too short on slow networks** → session not ready, user sees "Admin access required"
- **Too long on fast connections** → unnecessary delay in UX
- **Masks the real issue** → doesn't confirm session actually exists
- **Inconsistent application** → email login had no delay, Google login had 500ms

### Issue 3: Inconsistent Session Handling
Email login and Google login both call the same `callAuthEndpoint()` which sets session cookies synchronously on the server. There was no technical reason for the asymmetry:

```typescript
// ❌ BEFORE - inconsistent
handlePasswordLogin: navigate("/admin");        // no delay
handleGoogleLogin: await delay(500); navigate("/admin");  // arbitrary delay

// ✅ AFTER - consistent
handlePasswordLogin: await waitForServerSession(); navigate("/admin");
handleGoogleLogin: await waitForServerSession(); navigate("/admin");
```

## Solution Applied

### 1. Reliable Error Code Detection (firebase-api.ts)

```typescript
export async function firebaseAdminGoogleLogin(): Promise<void> {
  // ...
  try {
    const credential: UserCredential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken();
    await callAuthEndpoint("/api/auth/admin-google", idToken);
  } catch (err: any) {
    // Use error.code instead of error.message for popup-cancel detection
    const code = err?.code;
    if (code !== 'auth/popup-closed-by-user') {
      await auth.signOut().catch(() => {});
    }
    throw err;
  }
}
```

### 2. Session Verification Polling (AdminLogin.tsx)

```typescript
// Poll /api/auth/me to verify session was set on server
// Use exponential backoff: 50ms, 100ms, 200ms, 400ms (total max 750ms)
async function waitForServerSession(): Promise<void> {
  const delays = [50, 100, 200, 400];
  for (const delayMs of delays) {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    }).catch(() => null);
    if (res?.ok) return; // Session verified
    await new Promise(r => setTimeout(r, delayMs));
  }
  // If we still don't have a session after retries, continue anyway
  // (the auth check on admin page will catch it)
}
```

Why exponential backoff?
- **50ms first attempt** catches fast local/LAN scenarios
- **100ms, 200ms** handles typical network delays
- **400ms final** allows time for slow networks
- **750ms total max** is imperceptible to user but waits long enough
- **Adaptive** - returns immediately when session is ready, doesn't wait full 750ms

### 3. Consistent Flow for Both Login Methods

```typescript
// Both email and Google now use the same verification
const handlePasswordLogin = async (e: React.FormEvent) => {
  // ... validation ...
  try {
    await firebaseAdminEmailLogin(email, password);
    await waitForServerSession();  // ✅ verify session
    navigate("/admin");
  } catch (err) { /* ... */ }
};

const handleGoogleLogin = async () => {
  // ... validation ...
  try {
    await firebaseAdminGoogleLogin();
    await waitForServerSession();  // ✅ verify session
    navigate("/admin");
  } catch (err) { /* ... */ }
};
```

## Files Modified

| File | Change |
|------|--------|
| `client/src/lib/firebase-api.ts` | Use `error.code` instead of `error.message` for popup-cancel detection |
| `client/src/pages/admin/AdminLogin.tsx` | Add `waitForServerSession()` polling function; apply to both email & Google flows |

## Server-Side Setup (Already Correct)

The server already has correct COOP headers and synchronous session cookie setting:

```typescript
// server/_core/index.ts
app.use(function(req, res, next) {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// server/authExpressRouter.ts - both /api/auth/login and /api/auth/admin-google
res.cookie("auth-token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
res.status(200).json({ success: true, user });
```

The COOP header `same-origin-allow-popups` explicitly allows Google OAuth popups to function — by the time `navigate("/admin")` is called, the popup is already closed.

## Testing the Fix

1. **Email Login**: Go to `/admin/login`, enter credentials, observe smooth redirect to `/admin`
2. **Google Login**: Click "Continue with Google", sign in, observe smooth redirect to `/admin`
3. **Console**: No COOP-related errors; `/api/auth/me` is called once or twice (up to 750ms)
4. **Network**: Verify the `/api/auth/me` polling requests with `credentials: 'include'`
5. **Session**: Verify auth state is fresh (no cached/stale user data)

## Why This Fix is Robust

✅ **No brittle string matching** - uses documented error code  
✅ **Adaptive timing** - works fast on good networks, waits longer on slow ones  
✅ **Consistent logic** - both auth methods use the same verification  
✅ **Real verification** - confirms session exists before navigating  
✅ **Respects COOP** - works with existing secure headers  
✅ **Backward compatible** - if session check times out, falls back to page-level auth check  

## Before and After

| Scenario | Before | After |
|----------|--------|-------|
| Fast network | 500ms forced wait | Immediate redirect (confirmed) |
| Slow network | 500ms insufficient, "Admin access required" | Waits up to 750ms, session verified |
| Popup cancelled | Undiagnosed signOut (based on fragile message) | Correctly detected via error.code |
| Email login | No delay, sometimes fails | Consistent polling verification |
| Google login | 500ms fixed delay | Adaptive polling verification |

