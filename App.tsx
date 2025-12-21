import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicLayout } from './components/Layouts/PublicLayout';
import { DashboardLayout } from './components/Layouts/DashboardLayout';

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
import { Terms } from './pages/public/Terms';
import { Privacy } from './pages/public/Privacy';

// Leadership Pages
import { DavidMiller } from './pages/public/leadership/DavidMiller';
import { SarahJenkins } from './pages/public/leadership/SarahJenkins';
import { MichaelChen } from './pages/public/leadership/MichaelChen';
import { EmilyWhite } from './pages/public/leadership/EmilyWhite';

// Dashboard Pages
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Roster } from './pages/dashboard/Roster';
import { PendingApproval } from './pages/dashboard/PendingApproval';
import { PrayerWall } from './pages/dashboard/PrayerWall';
import { Newsletter } from './pages/dashboard/Newsletter';
import { Team } from './pages/dashboard/Team';
import { EventsPrivate } from './pages/dashboard/EventsPrivate';
import { Photos } from './pages/dashboard/Photos';

// Protected Route Component
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary text-white font-serif">
            <div className="animate-pulse">Loading...</div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
    const { user } = useAuth();
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="about/history" element={<History />} />
              <Route path="about/leadership/david-miller" element={<DavidMiller />} />
              <Route path="about/leadership/sarah-jenkins" element={<SarahJenkins />} />
              <Route path="about/leadership/michael-chen" element={<MichaelChen />} />
              <Route path="about/leadership/emily-white" element={<EmilyWhite />} />
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
              <Route path="login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
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