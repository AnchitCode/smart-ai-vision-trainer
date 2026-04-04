import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show a premium glass loader while checking auth state
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="anim-pulse-glow" style={{ fontSize: '1.2rem', color: 'var(--color-neon-cyan)' }}>
          Authenticating...
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  // Render the protected content
  return <>{children}</>;
};
