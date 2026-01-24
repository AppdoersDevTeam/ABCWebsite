import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ADMIN_EMAIL } from './lib/constants';
import { PublicLayout } from './components/Layouts/PublicLayout';
import { DashboardLayout } from './components/Layouts/DashboardLayout';
import { AdminLayout } from './components/Layouts/AdminLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { History } from './pages/public/History';
import { Events } from './pages/public/Events';
import { Sermons } from './pages/public/events/Sermons';
import { SundayService } from './pages/public/events/SundayService';
import { YoungAdults } from './pages/public/events/YoungAdults';
import { CommunityLunch } from './pages/public/events/CommunityLunch';
import { KidsProgram } from './pages/public/events/KidsProgram';
import { ImNew } from './pages/public/ImNew';
import { Giving } from './pages/public/Giving';
import { NeedPrayer } from './pages/public/NeedPrayer';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/public/Login';
import { LoginError } from './pages/public/LoginError';
import { OAuthCallback } from './pages/public/OAuthCallback';
import { OAuthCallbackWrapper } from './pages/public/OAuthCallbackWrapper';
import { Terms } from './pages/public/Terms';
import { Privacy } from './pages/public/Privacy';

// Leadership Pages
import { DavidMiller } from './pages/public/leadership/DavidMiller';
import { SarahJenkins } from './pages/public/leadership/SarahJenkins';
import { MichaelChen } from './pages/public/leadership/MichaelChen';
import { EmilyWhite } from './pages/public/leadership/EmilyWhite';
import { LeadershipBio } from './pages/public/leadership/LeadershipBio';

// Dashboard Pages
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Roster } from './pages/dashboard/Roster';
import { PendingApproval } from './pages/dashboard/PendingApproval';
import { PrayerWall } from './pages/dashboard/PrayerWall';
import { Newsletter } from './pages/dashboard/Newsletter';
import { Team } from './pages/dashboard/Team';
import { EventsPrivate } from './pages/dashboard/EventsPrivate';
import { Photos } from './pages/dashboard/Photos';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPrayerWall } from './pages/admin/AdminPrayerWall';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminRoster } from './pages/admin/AdminRoster';
import { AdminPhotos } from './pages/admin/AdminPhotos';

// Protected Route Component
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Only show loading during initial auth check
  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base text-charcoal font-serif">
            <div className="animate-pulse text-xl">Loading...</div>
        </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
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

  // Redirect admins to admin dashboard
  if (user.role === 'admin') {
    console.log('ProtectedRoute - Admin user, redirecting to admin dashboard');
    return <Navigate to="/admin" replace />;
  }

  console.log('ProtectedRoute - User approved, allowing access to dashboard');
  return <Outlet />;
};

// Admin Route Component
const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  // Only show loading during initial auth check
  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base text-charcoal font-serif">
            <div className="animate-pulse text-xl">Loading...</div>
        </div>
    );
  }

  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Only allow the specific admin email to access admin dashboard
  const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  console.log('AdminRoute - isAdminEmail:', isAdminEmail, 'user.email:', user.email, 'ADMIN_EMAIL:', ADMIN_EMAIL);
  
  if (!isAdminEmail) {
    // Redirect non-admin users to dashboard
    console.log('AdminRoute - Not admin email, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (!user.is_approved) {
    console.log('AdminRoute - User not approved, redirecting to pending-approval');
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.role !== 'admin') {
    console.log('AdminRoute - User role is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute - All checks passed, rendering Outlet');
  return <Outlet />;
};

const AppRoutes = () => {
    const { user } = useAuth();
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<OAuthCallbackWrapper />} />
              <Route path="about" element={<About />} />
              <Route path="about/history" element={<History />} />
              <Route path="about/leadership/david-miller" element={<DavidMiller />} />
              <Route path="about/leadership/sarah-jenkins" element={<SarahJenkins />} />
              <Route path="about/leadership/michael-chen" element={<MichaelChen />} />
              <Route path="about/leadership/emily-white" element={<EmilyWhite />} />
              <Route path="about/leadership/:slug" element={<LeadershipBio />} />
              <Route path="events" element={<Events />} />
              <Route path="events/sermons" element={<Sermons />} />
              <Route path="events/sunday-service" element={<SundayService />} />
              <Route path="events/young-adults" element={<YoungAdults />} />
              <Route path="events/community-lunch" element={<CommunityLunch />} />
              <Route path="events/kids-program" element={<KidsProgram />} />
              <Route path="im-new" element={<ImNew />} />
              <Route path="giving" element={<Giving />} />
              <Route path="need-prayer" element={<NeedPrayer />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={
                user ? (
                  !user.is_approved ? <Navigate to="/pending-approval" replace /> :
                  user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              } />
              <Route path="login-error" element={<LoginError />} />
              {/* OAuth callback route - Supabase redirects here after OAuth */}
              <Route path="auth/callback" element={<OAuthCallback />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
            </Route>

            {/* Special Guard Route */}
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="prayer" element={<PrayerWall />} />
                <Route path="newsletter" element={<Newsletter />} />
                <Route path="team" element={<Team />} />
                <Route path="events" element={<EventsPrivate />} />
                <Route path="roster" element={<Roster />} />
                <Route path="photos" element={<Photos />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="prayer" element={<AdminPrayerWall />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="roster" element={<AdminRoster />} />
                <Route path="photos" element={<AdminPhotos />} />
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