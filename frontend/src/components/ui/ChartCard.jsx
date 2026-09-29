import React from 'react';

export default function ChartCard({ title, children, action, style }) {
  return (
    <div className="chart-card" style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="chart-card-title">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}
