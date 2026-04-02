import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Workout from './pages/Workout';
import History from './pages/History';
import Settings from './pages/Settings';

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
        <Route path="/" element={<Home />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
