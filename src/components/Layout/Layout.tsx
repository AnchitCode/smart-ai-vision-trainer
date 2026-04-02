import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

/**
 * Layout
 *
 * Persistent app shell that wraps every page.
 * Navbar stays at the top, Footer at the bottom,
 * and the routed page content renders in <Outlet />.
 */
export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-content">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
