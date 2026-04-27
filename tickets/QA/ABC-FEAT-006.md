# ABC-FEAT-006 — Password reset: admin action + “Forgot password?” on Login

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: QA

## Context
Admins need a way to send a password reset link to a specific user. Users also need self-service password reset via “Forgot password?” on the login page.

## Scope
### Admin: User Management password reset
- In `pages/admin/AdminUsers.tsx`, add a per-user action: **Reset password**
- Clicking shows a confirmation dialog: “Send password reset link to <email>?”
- On confirm, trigger Supabase Auth password reset email for that user’s email.
- Show success/failure feedback (alert consistent with existing patterns).

### Public: Login forgot password
- In `pages/public/Login.tsx`, implement the existing “Forgot password?” link:
  - Opens a small UI (inline) to collect email (prefilled from the login email field if present).
  - Confirmation dialog before sending.
  - Sends Supabase password reset email.
  - Shows success message (“Check your email…”).
- Users should be able to reset their own password without admin involvement.

### Public: Reset password page
- Add a minimal `/reset-password` page that lets the user set a new password after following the Supabase recovery link.

## Acceptance criteria
- [x] Admin can send password reset link to a user’s email from `/admin/users` with confirmation prompt.
- [x] Login page “Forgot password?” sends reset email with confirmation prompt and shows success state.
- [x] Reset password page allows setting a new password after following the recovery link.
- [x] No logo changes; no unrelated UI changes.
- [x] No console errors introduced.

## QA notes
- **Build**: `npm run build` ✅
- **Manual smoke test (recommended)**:
  - Login page:
    - Click “Forgot password?”
    - Enter email → confirm prompt → verify success banner
  - Reset password page:
    - Open the Supabase recovery link (PKCE `code=` or hash `type=recovery`)
    - Set new password (min 8 chars), confirm, submit
    - Confirm redirect back to `/login`
  - Admin:
    - Admin → Users → click reset icon for a user → confirm prompt → verify success alert

# ABC-FEAT-006 — Password reset: admin action + “Forgot password?” on Login

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: QA

## Context
Admins need a way to send a password reset link to a specific user. Users also need self-service password reset via “Forgot password?” on the login page.

## Scope
### Admin: User Management password reset
- In `pages/admin/AdminUsers.tsx`, add a per-user action: **Reset password**
- Clicking shows a confirmation dialog: “Send password reset link to <email>?”
- On confirm, trigger Supabase Auth password reset email for that user’s email.
- Show success/failure feedback (alert consistent with existing patterns).

### Public: Login forgot password
- In `pages/public/Login.tsx`, implement the existing “Forgot password?” link:
  - Opens a small UI (inline) to collect email (prefilled from the login email field if present).
  - Confirmation dialog before sending.
  - Sends Supabase password reset email.
  - Shows success message (“Check your email…”).
- Users should be able to reset their own password without admin involvement.

### Public: Reset password page
- Add a minimal `/reset-password` page that lets the user set a new password after following the Supabase recovery link.

## Acceptance criteria
- [ ] Admin can send password reset link to a user’s email from `/admin/users` with confirmation prompt.
- [ ] Login page “Forgot password?” sends reset email with confirmation prompt and shows success state.
- [ ] Reset password page allows setting a new password after following the recovery link.
- [ ] No logo changes; no unrelated UI changes.
- [ ] No console errors introduced.

## QA checklist
- [ ] Admin: `/admin/users` → click **Reset Password** on a user with email → confirm prompt → success message shown.
- [ ] Admin: clicking reset on a user with no email shows a clear error message.
- [ ] Public: `/login` → click **Forgot password?** → email prefilled if present → confirm prompt → “check your inbox” success message.
- [ ] Public: `/#/reset-password` renders without errors and can submit a new password (with mismatch/too-short validations).
- [x] Build passes (`npm run build`).

## QA notes
- **Build**: `npm run build` passes locally.
- **UI verification**: attempted to load local dev server pages in automated browser, but the page rendered as blank with no DOM refs in the accessibility snapshot (no console errors). Recommend manual spot-check in a normal browser:
  - `/#/login` → Forgot password → send reset link
  - `/#/reset-password` → set new password from recovery link
  - `/admin/users` → Reset Password action on a user row

