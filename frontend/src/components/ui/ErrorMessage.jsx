import React from 'react';
import { AlertTriangle, WifiOff, ServerCrash, Info } from 'lucide-react';

const CONFIG = {
  NETWORK_ERROR:     { icon: WifiOff,      color: '#dc2626', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
  MODEL_UNAVAILABLE: { icon: ServerCrash,  color: '#d97706', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
  VALIDATION_ERROR:  { icon: AlertTriangle, color: '#dc2626', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
  SERVER_ERROR:      { icon: AlertTriangle, color: '#dc2626', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
  INFO:              { icon: Info,          color: '#4f46e5', bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.2)' },
};

export default function ErrorMessage({ error, type = 'SERVER_ERROR' }) {
  const errType = error?.type || type;
  const cfg = CONFIG[errType] || CONFIG.SERVER_ERROR;
  const Icon = cfg.icon;
  const msg  = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred.');

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 10, padding: '14px 16px',
        fontSize: '0.82rem', color: cfg.color, marginBottom: 16,
      }}
      role="alert"
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{msg}</span>
    </div>
  );
}
