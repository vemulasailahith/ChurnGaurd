import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Building2,
  KeyRound,
} from 'lucide-react';

export default function Login() {
  const { login, isAuthorized, authError, setAuthError, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Check if redirected with session expired notice
  const from = location.state?.from?.pathname || '/dashboard';
  const sessionExpiredNotice = location.state?.sessionExpired;

  // If already authorized, automatically redirect to target or dashboard
  useEffect(() => {
    if (isAuthorized) {
      navigate(from, { replace: true });
    }
  }, [isAuthorized, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);

    if (!email.trim()) {
      setLocalError('Please enter your company email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Upon successful login and member verification, AuthContext updates isAuthorized
      navigate(from, { replace: true });
    } catch (err) {
      // Specific error messages are supplied by AuthContext / Supabase
      const message = err.message || 'Authentication failed. Please verify your credentials.';
      setLocalError(message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="login-page">
      {/* Dynamic Background Elements */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-container">
        {/* Brand Card */}
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-wrap">
              <div className="login-logo-glow" />
              <div className="login-logo">
                <Shield size={32} strokeWidth={2.4} color="#ffffff" />
              </div>
            </div>

            <h1 className="login-title">ChurnGuard</h1>
            <p className="login-subtitle">AI-Powered Customer Churn Intelligence</p>

            <div className="login-badge-wrap">
              <span className="login-access-badge">
                <Lock size={12} strokeWidth={2.5} />
                Authorized Company Members Only
              </span>
            </div>
          </div>

          {/* Supabase unconfigured warning banner */}
          {!isSupabaseConfigured && (
            <div className="login-notice-banner warning">
              <KeyRound size={18} className="notice-icon" />
              <div className="notice-text">
                <strong>Supabase Configuration Required</strong>
                <p>
                  Please specify <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>frontend/.env</code>.
                </p>
              </div>
            </div>
          )}

          {/* Session Expired Banner */}
          {sessionExpiredNotice && !displayError && (
            <div className="login-notice-banner info">
              <AlertCircle size={18} className="notice-icon" />
              <div className="notice-text">
                <strong>Session Expired</strong>
                <p>Your session has expired. Please log in again to continue.</p>
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {displayError && (
            <div className={`login-notice-banner ${displayError.toLowerCase().includes('denied') ? 'denied' : 'error'}`}>
              {displayError.toLowerCase().includes('denied') ? (
                <ShieldAlert size={20} className="notice-icon error-icon" />
              ) : (
                <AlertCircle size={20} className="notice-icon error-icon" />
              )}
              <div className="notice-text">
                <strong>
                  {displayError.toLowerCase().includes('denied') ? 'Access Denied' : 'Authentication Error'}
                </strong>
                <p>{displayError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="login-field-group">
              <label className="login-label" htmlFor="email">
                Company Email Address
              </label>
              <div className="login-input-wrap">
                <Mail size={17} className="login-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="name@company.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-input-wrap">
                <Lock size={17} className="login-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Verifying Credentials & Membership...</span>
                </>
              ) : (
                <>
                  <Shield size={16} strokeWidth={2.4} />
                  <span>Sign In as Authorized Member</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Access Info */}
          <div className="login-footer">
            <div className="login-security-tag">
              <Building2 size={13} />
              <span>Company Single-Tier Access Model</span>
            </div>
            <p className="login-disclaimer">
              Access is restricted to authorized team members registered in the Supabase directory.
              Public self-registration is disabled.
            </p>
          </div>
        </div>

        {/* Footnote */}
        <div className="login-bottom-info">
          <span>ChurnGuard Intelligence Platform</span>
          <span className="dot-sep">·</span>
          <span>Supabase Auth & RLS Protected</span>
        </div>
      </div>
    </div>
  );
}
