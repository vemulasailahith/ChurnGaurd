import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthorized, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b1120',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            position: 'absolute',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)',
            animation: 'pulse 2s infinite',
          }} />
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
            zIndex: 1,
          }}>
            <Shield size={28} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 6 }}>
          ChurnGuard Intelligence
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Verifying authorized member credentials...
        </p>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated or not an active authorized member
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
