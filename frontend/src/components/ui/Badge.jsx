import React from 'react';

const VARIANTS = {
  success: { bg: 'rgba(16,185,129,0.10)', color: '#059669' },
  danger:  { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626' },
  warning: { bg: 'rgba(245,158,11,0.10)', color: '#d97706' },
  info:    { bg: 'rgba(99,102,241,0.10)', color: '#4f46e5' },
  neutral: { bg: 'rgba(148,163,184,0.12)', color: '#64748b' },
};

export default function Badge({ children, variant = 'info', dot = false, style }) {
  const v = VARIANTS[variant] || VARIANTS.info;
  return (
    <span
      className="badge"
      style={{ background: v.bg, color: v.color, ...style }}
    >
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: v.color, display: 'inline-block',
        }} />
      )}
      {children}
    </span>
  );
}
