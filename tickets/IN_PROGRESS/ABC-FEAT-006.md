# ABC-FEAT-006 — Password reset: admin action + “Forgot password?” on Login

**Priority**: P1  
**Owner**: Developer Agent  
**Status**: IN_PROGRESS

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

