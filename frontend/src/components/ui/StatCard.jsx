import React from 'react';

export default function StatCard({
  label,
  title,
  value,
  sub,
  subtitle,
  icon: Icon,
  iconBg = '#6366f1',
  color,
  iconColor = '#fff',
  valueColor,
}) {
  const displayLabel = label || title;
  const displaySub = sub || subtitle;
  const activeColor = color || iconBg;

  return (
    <div className="stat-card">
      {/* Glow blob */}
      <div
        className="stat-card-glow"
        style={{ background: activeColor }}
      />

      {Icon && (
        <div
          className="stat-card-icon-wrap"
          style={{ background: `${activeColor}1a`, border: `1px solid ${activeColor}30` }}
        >
          <Icon size={20} color={activeColor} strokeWidth={2} />
        </div>
      )}

      <div
        className="stat-card-value"
        style={valueColor ? { color: valueColor } : {}}
      >
        {value}
      </div>

      {displayLabel && <div className="stat-card-label">{displayLabel}</div>}
      {displaySub && <div className="stat-card-sub">{displaySub}</div>}
    </div>
  );
}
