import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isAdminUser, isSuperAdminUser } from './lib/constants';
import { PublicLayout } from './components/Layouts/PublicLayout';
import { DashboardLayout } from './components/Layouts/DashboardLayout';
import { AdminLayout } from './components/Layouts/AdminLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { History } from './pages/public/History';
import { Vision } from './pages/public/Vision';
import { StatementOfFaith } from './pages/public/StatementOfFaith';
import { Events } from './pages/public/Events';
import { EventDetail } from './pages/public/EventDetail';
import { Sermons } from './pages/public/events/Sermons';
import { SundayService } from './pages/public/events/SundayService';
import { YoungAdults } from './pages/public/events/YoungAdults';
import { TeensYouth } from './pages/public/events/TeensYouth';
import { KidsProgram } from './pages/public/events/KidsProgram';
import { ImNew } from './pages/public/ImNew';
import { MinistriesIndex } from './pages/public/ministries/MinistriesIndex';
import { MinistryPage } from './pages/public/ministries/MinistryPage';
import { MINISTRIES, MINISTRY_LEGACY_REDIRECTS } from './lib/ministries';
import { Giving } from './pages/public/Giving';
import { NeedPrayer } from './pages/public/NeedPrayer';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/public/Login';
import { LoginError } from './pages/public/LoginError';
import { OAuthCallback } from './pages/public/OAuthCallback';
import { OAuthCallbackWrapper } from './pages/public/OAuthCallbackWrapper';
import { Terms } from './pages/public/Terms';
import { Privacy } from './pages/public/Privacy';
import { ResetPassword } from './pages/public/ResetPassword';

// Leadership Pages
import { LeadershipBio } from './pages/public/leadership/LeadershipBio';

// Dashboard Pages
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Roster } from './pages/dashboard/Roster';
import { PendingApproval } from './pages/dashboard/PendingApproval';
import { PrayerWall } from './pages/dashboard/PrayerWall';
import { Newsletter } from './pages/dashboard/Newsletter';
import { Devotional } from './pages/dashboard/Devotional';
import { Sermons as DashboardSermons } from './pages/dashboard/Sermons';
import { Team } from './pages/dashboard/Team';
import { EventsPrivate } from './pages/dashboard/EventsPrivate';
import { DashboardHelp } from './pages/dashboard/Help';
import { UserSecurity } from './pages/dashboard/UserSecurity';
import { MyProfile } from './pages/dashboard/MyProfile';
import { AnnualCalendarPage } from './pages/shared/AnnualCalendarPage';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminRoles } from './pages/admin/AdminRoles';
import { AdminPrayerWall } from './pages/admin/AdminPrayerWall';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';
import { AdminDevotional } from './pages/admin/AdminDevotional';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminRoster } from './pages/admin/AdminRoster';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminHelp } from './pages/admin/Help';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminChangelog } from './pages/admin/AdminChangelog';
import { AdminEmails } from './pages/admin/AdminEmails';

// Protected Route Component
const ProtectedRoute = () => {
  const { user, isLoading, mfaPending } = useAuth();

  // Only show loading during initial auth check
  if (isLoading) {
    return (
        <div className="min-h-screen page-shell page-shell-image flex items-center justify-center text-charcoal font-serif">
            <div className="page-shell-content animate-pulse text-xl">Loading...</div>
        </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (mfaPending) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_approved) {
    console.log('ProtectedRoute - User not approved, redirecting to pending-approval. User:', {
      id: user.id,
      email: user.email,
      is_approved: user.is_approved
    });
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect admins to admin dashboard unless test override says "member"
  const testOverride = sessionStorage.getItem('testRoleOverride');
  if (isAdminUser(user) && testOverride !== 'member') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

// Admin Route Component — any approved admin gets the full admin portal
const AdminRoute = () => {
  const { user, isLoading, mfaPending } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen page-shell page-shell-image flex items-center justify-center text-charcoal font-serif">
            <div className="page-shell-content animate-pulse text-xl">Loading...</div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (mfaPending) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Super Admin only — regular admins are sent back to Overview
const SuperAdminRoute = () => {
  const { user } = useAuth();

  if (!isSuperAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
    const { user, mfaPending } = useAuth();
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<OAuthCallbackWrapper />} />
              <Route path="about" element={<About />} />
              <Route path="about/history" element={<History />} />
              <Route path="about/vision" element={<Vision />} />
              <Route path="about/beliefs" element={<StatementOfFaith />} />
              <Route path="about/leadership/:slug" element={<LeadershipBio />} />
              <Route path="events" element={<Events />} />
              <Route path="events/sermons" element={<Sermons />} />
              {MINISTRY_LEGACY_REDIRECTS.map((redirect) => (
                <Route
                  key={redirect.from}
                  path={redirect.from.replace(/^\//, '')}
                  element={<Navigate to={redirect.to} replace />}
                />
              ))}
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="ministries" element={<MinistriesIndex />} />
              <Route path="sunday-service" element={<SundayService />} />
              <Route path="young-adults" element={<YoungAdults />} />
              <Route path="teens-youth" element={<TeensYouth />} />
              <Route path="children" element={<KidsProgram />} />
              {MINISTRIES.filter((ministry) => !ministry.existingPage).map((ministry) => (
                <Route
                  key={ministry.slug}
                  path={ministry.slug}
                  element={<MinistryPage slug={ministry.slug} />}
                />
              ))}
              <Route path="im-new" element={<ImNew />} />
              <Route path="giving" element={<Giving />} />
              <Route path="need-prayer" element={<NeedPrayer />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={
                user && !mfaPending ? (
                  !user.is_approved ? <Navigate to="/pending-approval" replace /> :
                  isAdminUser(user) ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              } />
              <Route path="login-error" element={<LoginError />} />
              {/* OAuth callback route - Supabase redirects here after OAuth */}
              <Route path="auth/callback" element={<OAuthCallback />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
            </Route>

            {/* Special Guard Route */}
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="calendar" element={<AnnualCalendarPage audience="member" />} />
                <Route path="prayer" element={<PrayerWall />} />
                <Route path="newsletter" element={<Newsletter />} />
                <Route path="devotional" element={<Devotional />} />
                <Route path="sermons" element={<DashboardSermons />} />
                <Route path="team" element={<Team />} />
                <Route path="events" element={<EventsPrivate />} />
                <Route path="roster" element={<Roster />} />
                <Route path="security" element={<UserSecurity />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="help" element={<DashboardHelp />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="calendar" element={<AnnualCalendarPage audience="admin" />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="roles" element={<AdminRoles />} />
                <Route path="emails" element={<AdminEmails />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route element={<SuperAdminRoute />}>
                  <Route path="changelog" element={<AdminChangelog />} />
                </Route>
                <Route path="prayer" element={<AdminPrayerWall />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="devotional" element={<AdminDevotional />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="roster" element={<AdminRoster />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="security" element={<UserSecurity />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="help" element={<AdminHelp />} />
              </Route>
            </Route>
        </Routes>
    );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;