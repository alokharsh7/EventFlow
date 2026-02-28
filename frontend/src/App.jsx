import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// ── Placeholder pages (will be built in later phases) ──
const Placeholder = ({ title }) => (
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
      {title}
    </h1>
    <p className="mt-4 text-gray-400">This page will be built in the next phase.</p>
  </div>
);

const HomePage = () => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="text-center space-y-6">
      <h1 className="text-5xl md:text-6xl font-extrabold">
        <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Discover & Book
        </span>
        <br />
        <span className="text-white">Amazing Events</span>
      </h1>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        From concerts to conferences — find your next experience on EventFlow.
        Book with confidence, dynamic pricing, and instant QR tickets.
      </p>
      <div className="flex gap-4 justify-center mt-8">
        <a href="/register"
          className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl
                     transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40">
          Get Started
        </a>
        <a href="/events"
          className="px-8 py-3 border border-white/10 hover:border-white/20 text-gray-300
                     hover:text-white rounded-xl transition-all">
          Browse Events
        </a>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events/:id" element={<Placeholder title="Event Details" />} />

            {/* User protected */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/my-bookings" element={<Placeholder title="My Bookings" />} />
              <Route path="/waitlist" element={<Placeholder title="My Waitlist" />} />
            </Route>

            {/* Organizer protected */}
            <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
              <Route path="/organizer/dashboard" element={<Placeholder title="Organizer Dashboard" />} />
              <Route path="/organizer/events/create" element={<Placeholder title="Create Event" />} />
              <Route path="/organizer/events/:id/edit" element={<Placeholder title="Edit Event" />} />
              <Route path="/organizer/analytics" element={<Placeholder title="Analytics" />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center py-20">
                <h1 className="text-6xl font-bold text-gray-600">404</h1>
                <p className="mt-4 text-gray-400">Page not found</p>
              </div>
            } />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
