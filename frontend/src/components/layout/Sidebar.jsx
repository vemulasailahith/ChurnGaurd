import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Brain, Users, BarChart3,
  Activity, Info, Shield, Zap, LogOut, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard',          badge: 'Live' },
  { to: '/predict',           icon: Brain,           label: 'Predict Churn',       badge: null  },
  { to: '/segments',          icon: Users,           label: 'Customer Segments',   badge: '2'   },
  { to: '/analytics',         icon: BarChart3,       label: 'Analytics',           badge: null  },
  { to: '/model-performance', icon: Activity,        label: 'Model Performance',   badge: null  },
  { to: '/about',             icon: Info,            label: 'About',               badge: null  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const { user, member, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = member?.full_name || user?.email?.split('@')[0] || 'Member';
  const displayEmail = member?.email || user?.email || '';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">ChurnGuard</div>
            <div className="sidebar-brand-sub">AI Churn Intelligence</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Analytics Platform</div>

          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: 12 }}>Dataset</div>
          <div className="nav-item" style={{ cursor: 'default', opacity: 0.7 }}>
            <Zap size={15} strokeWidth={2} />
            <span>Telco Churn</span>
            <span className="nav-badge">7K</span>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Member Card */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 5px #10b981',
                  }}
                />
                Authorized Member
              </span>
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayName}
            >
              {displayName}
            </div>
            {displayEmail && (
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={displayEmail}
              >
                {displayEmail}
              </div>
            )}
          </div>

          {/* Model Status & Logout Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="sidebar-footer-info" style={{ gap: 6 }}>
              <div
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#6366f1', flexShrink: 0,
                  boxShadow: '0 0 5px #6366f1',
                }}
              />
              <div className="sidebar-footer-text">
                <div className="sidebar-footer-label">Model</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.7 }}>LogReg (96.1%)</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out of ChurnGuard"
              aria-label="Sign Out"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              <LogOut size={13} strokeWidth={2.2} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
