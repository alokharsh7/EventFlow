import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ProtectedRoute from "@/components/common/ProtectedRoute";

import HomePage from "@/pages/user/HomePage";
import EventDetailPage from "@/pages/user/EventDetailPage";
import MyBookingsPage from "@/pages/user/MyBookingsPage";
import WaitlistPage from "@/pages/user/WaitlistPage";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import DashboardPage from "@/pages/organizer/DashboardPage";
import EventForm from "@/pages/organizer/EventForm";
import AnalyticsPage from "@/pages/organizer/AnalyticsPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <AuthProvider>
    <Sonner />
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User protected */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/waitlist" element={<WaitlistPage />} />
        </Route>

        {/* Organizer protected */}
        <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
          <Route path="/organizer/dashboard" element={<DashboardPage />} />
          <Route path="/organizer/events/create" element={<EventForm />} />
          <Route path="/organizer/events/:id/edit" element={<EventForm />} />
          <Route path="/organizer/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
