import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Workout from './pages/Workout';
import History from './pages/History';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { ProtectedRoute } from './components/ProtectedRoute';

/**
 * Router
 *
 * All route definitions for the app.
 * Every page is nested inside <Layout /> which provides the
 * persistent Navbar + Footer shell.
 */
export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected SaaS Routes */}
        <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
