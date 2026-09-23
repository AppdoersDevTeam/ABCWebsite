import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isAdminUser, isSuperAdminUser } from './lib/constants';
import { queryClient } from './lib/queryClient';
import { PublicLayout } from './components/Layouts/PublicLayout';
import { DashboardLayout } from './components/Layouts/DashboardLayout';
import { AdminLayout } from './components/Layouts/AdminLayout';
import { MINISTRIES, MINISTRY_LEGACY_REDIRECTS } from './lib/ministries';

// Eager: auth entry + OAuth (critical path)
import { Login } from './pages/public/Login';
import { LoginError } from './pages/public/LoginError';
import { OAuthCallback } from './pages/public/OAuthCallback';
import { OAuthCallbackWrapper } from './pages/public/OAuthCallbackWrapper';
import { ResetPassword } from './pages/public/ResetPassword';
import { PendingApproval } from './pages/dashboard/PendingApproval';

const Home = lazy(() => import('./pages/public/Home').then((m) => ({ default: m.Home })));
const About = lazy(() => import('./pages/public/About').then((m) => ({ default: m.About })));
const History = lazy(() => import('./pages/public/History').then((m) => ({ default: m.History })));
const Vision = lazy(() => import('./pages/public/Vision').then((m) => ({ default: m.Vision })));
const StatementOfFaith = lazy(() =>
  import('./pages/public/StatementOfFaith').then((m) => ({ default: m.StatementOfFaith }))
);
const Events = lazy(() => import('./pages/public/Events').then((m) => ({ default: m.Events })));
const EventDetail = lazy(() =>
  import('./pages/public/EventDetail').then((m) => ({ default: m.EventDetail }))
);
const Sermons = lazy(() =>
  import('./pages/public/events/Sermons').then((m) => ({ default: m.Sermons }))
);
const SundayService = lazy(() =>
  import('./pages/public/events/SundayService').then((m) => ({ default: m.SundayService }))
);
const YoungAdults = lazy(() =>
  import('./pages/public/events/YoungAdults').then((m) => ({ default: m.YoungAdults }))
);
const TeensYouth = lazy(() =>
  import('./pages/public/events/TeensYouth').then((m) => ({ default: m.TeensYouth }))
);
const KidsProgram = lazy(() =>
  import('./pages/public/events/KidsProgram').then((m) => ({ default: m.KidsProgram }))
);
const ImNew = lazy(() => import('./pages/public/ImNew').then((m) => ({ default: m.ImNew })));
const MinistriesIndex = lazy(() =>
  import('./pages/public/ministries/MinistriesIndex').then((m) => ({ default: m.MinistriesIndex }))
);
const MinistryPage = lazy(() =>
  import('./pages/public/ministries/MinistryPage').then((m) => ({ default: m.MinistryPage }))
);
const Giving = lazy(() => import('./pages/public/Giving').then((m) => ({ default: m.Giving })));
const NeedPrayer = lazy(() =>
  import('./pages/public/NeedPrayer').then((m) => ({ default: m.NeedPrayer }))
);
const Contact = lazy(() => import('./pages/public/Contact').then((m) => ({ default: m.Contact })));
const Terms = lazy(() => import('./pages/public/Terms').then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/public/Privacy').then((m) => ({ default: m.Privacy })));
const LeadershipBio = lazy(() =>
  import('./pages/public/leadership/LeadershipBio').then((m) => ({ default: m.LeadershipBio }))
);

const DashboardHome = lazy(() =>
  import('./pages/dashboard/DashboardHome').then((m) => ({ default: m.DashboardHome }))
);
const Roster = lazy(() => import('./pages/dashboard/Roster').then((m) => ({ default: m.Roster })));
const PrayerWall = lazy(() =>
  import('./pages/dashboard/PrayerWall').then((m) => ({ default: m.PrayerWall }))
);
const Newsletter = lazy(() =>
  import('./pages/dashboard/Newsletter').then((m) => ({ default: m.Newsletter }))
);
const Devotional = lazy(() =>
  import('./pages/dashboard/Devotional').then((m) => ({ default: m.Devotional }))
);
const DashboardSermons = lazy(() =>
  import('./pages/dashboard/Sermons').then((m) => ({ default: m.Sermons }))
);
const Team = lazy(() => import('./pages/dashboard/Team').then((m) => ({ default: m.Team })));
const EventsPrivate = lazy(() =>
  import('./pages/dashboard/EventsPrivate').then((m) => ({ default: m.EventsPrivate }))
);
const DashboardHelp = lazy(() =>
  import('./pages/dashboard/Help').then((m) => ({ default: m.DashboardHelp }))
);
const UserSecurity = lazy(() =>
  import('./pages/dashboard/UserSecurity').then((m) => ({ default: m.UserSecurity }))
);
const MyProfile = lazy(() =>
  import('./pages/dashboard/MyProfile').then((m) => ({ default: m.MyProfile }))
);
const AnnualCalendarPage = lazy(() =>
  import('./pages/shared/AnnualCalendarPage').then((m) => ({ default: m.AnnualCalendarPage }))
);

const AdminOverview = lazy(() =>
  import('./pages/admin/AdminOverview').then((m) => ({ default: m.AdminOverview }))
);
const AdminUsers = lazy(() =>
  import('./pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers }))
);
const AdminRoles = lazy(() =>
  import('./pages/admin/AdminRoles').then((m) => ({ default: m.AdminRoles }))
);
const AdminPrayerWall = lazy(() =>
  import('./pages/admin/AdminPrayerWall').then((m) => ({ default: m.AdminPrayerWall }))
);
const AdminNewsletter = lazy(() =>
  import('./pages/admin/AdminNewsletter').then((m) => ({ default: m.AdminNewsletter }))
);
const AdminDevotional = lazy(() =>
  import('./pages/admin/AdminDevotional').then((m) => ({ default: m.AdminDevotional }))
);
const AdminTeam = lazy(() =>
  import('./pages/admin/AdminTeam').then((m) => ({ default: m.AdminTeam }))
);
const AdminEvents = lazy(() =>
  import('./pages/admin/AdminEvents').then((m) => ({ default: m.AdminEvents }))
);
const AdminRoster = lazy(() =>
  import('./pages/admin/AdminRoster').then((m) => ({ default: m.AdminRoster }))
);
const AdminSettings = lazy(() =>
  import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);
const AdminHelp = lazy(() => import('./pages/admin/Help').then((m) => ({ default: m.AdminHelp })));
const AdminLogs = lazy(() =>
  import('./pages/admin/AdminLogs').then((m) => ({ default: m.AdminLogs }))
);
const AdminChangelog = lazy(() =>
  import('./pages/admin/AdminChangelog').then((m) => ({ default: m.AdminChangelog }))
);
const AdminEmails = lazy(() =>
  import('./pages/admin/AdminEmails').then((m) => ({ default: m.AdminEmails }))
);

/** Same markup as existing auth gate — no new layout. */
const RouteFallback = () => (
  <div className="min-h-screen page-shell page-shell-image flex items-center justify-center text-charcoal font-serif">
    <div className="page-shell-content animate-pulse text-xl">Loading...</div>
  </div>
);

const ProtectedRoute = () => {
  const { user, isLoading, mfaPending } = useAuth();

  if (isLoading) {
    return <RouteFallback />;
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
      is_approved: user.is_approved,
    });
    return <Navigate to="/pending-approval" replace />;
  }

  const testOverride = sessionStorage.getItem('testRoleOverride');
  if (isAdminUser(user) && testOverride !== 'member') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const { user, isLoading, mfaPending } = useAuth();

  if (isLoading) {
    return <RouteFallback />;
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
    <Suspense fallback={<RouteFallback />}>
      <Routes>
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
          <Route
            path="login"
            element={
              user && !mfaPending ? (
                !user.is_approved ? (
                  <Navigate to="/pending-approval" replace />
                ) : isAdminUser(user) ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route path="login-error" element={<LoginError />} />
          <Route path="auth/callback" element={<OAuthCallback />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>

        <Route path="/pending-approval" element={<PendingApproval />} />

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
    </Suspense>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
