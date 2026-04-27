# ABC-FEAT-006 — Password reset: admin action + “Forgot password?” on Login

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: BACKLOG

## Context
Admins need a way to send a password reset link to a specific user. Users also need self-service password reset via “Forgot password?” on the login page.

## Scope
### Admin: User Management password reset
- In `pages/admin/AdminUsers.tsx`, add a per-user action: **Reset password**
- Clicking shows a confirmation dialog: “Send password reset link to <email>?”
- On confirm, trigger Supabase Auth password reset email for that user’s email.
- Show success/failure feedback (toast/alert consistent with existing patterns).

### Public: Login forgot password
- In `pages/public/Login.tsx`, implement the existing “Forgot password?” link:
  - Opens a small UI (modal or inline) to collect email (and/or reuse the entered email field if present).
  - Confirmation dialog before sending.
  - Sends Supabase password reset email.
  - Shows success message (“Check your email…”).
- Users should be able to reset their own password without admin involvement.

## Acceptance criteria
- [ ] Admin can send password reset link to a user’s email from `/admin/users` with confirmation prompt.
- [ ] Login page “Forgot password?” sends reset email with confirmation prompt and shows success state.
- [ ] No logo changes; no unrelated UI changes.
- [ ] No console errors introduced.

## Notes / implementation hints
- Supabase client available at `lib/supabase`.
- Use `supabase.auth.resetPasswordForEmail(email, { redirectTo })` (redirectTo should point back to the app’s reset-password handling route/page).
- If the app does not yet have a reset-password page/route, include it in this ticket (minimal page that lets user set new password after following Supabase link).

