import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Brain, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BREADCRUMBS = {
  '/dashboard':         ['ChurnGuard', 'Overview', 'Dashboard'],
  '/predict':           ['ChurnGuard', 'ML Models', 'Predict Churn'],
  '/segments':          ['ChurnGuard', 'Clustering', 'Customer Segments'],
  '/analytics':         ['ChurnGuard', 'Insights', 'Analytics'],
  '/model-performance': ['ChurnGuard', 'Evaluation', 'Model Performance'],
  '/about':             ['ChurnGuard', 'Info', 'About'],
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, member, logout } = useAuth();
  const crumbs = BREADCRUMBS[pathname] || ['ChurnGuard', 'Page'];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const memberEmail = member?.email || user?.email || 'Authorized Member';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <nav className="breadcrumb" aria-label="breadcrumb">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <span className="breadcrumb-sep">›</span>}
              <span className={i === crumbs.length - 1 ? 'breadcrumb-current' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        <div className="topbar-badge" title={memberEmail} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
              flexShrink: 0,
            }}
          />
          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {memberEmail}
          </span>
        </div>

        <button
          className="btn-predict"
          onClick={() => navigate('/predict')}
          aria-label="Go to prediction page"
        >
          <Brain size={14} strokeWidth={2.5} />
          Predict
        </button>

        <button
          onClick={handleLogout}
          aria-label="Sign Out"
          title="Sign Out"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          <LogOut size={15} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
