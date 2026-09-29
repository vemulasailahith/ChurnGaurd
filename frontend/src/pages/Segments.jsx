import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Users, Clock, DollarSign, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import ChartCard from '../components/ui/ChartCard';
import { getSegments } from '../services/api';

const SEGMENT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '0.78rem',
    }}>
      {label && <div style={{ fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
          <span style={{ color: '#475569' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSegments = () => {
    setLoading(true);
    setError(null);
    getSegments()
      .then((d) => {
        if (d?.segments && Array.isArray(d.segments)) {
          setSegments(d.segments);
        } else {
          setSegments([]);
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to load customer segments. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Customer Segments</h1>
          <p className="page-subtitle">Unsupervised clustering and segment profiles</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', gap: 14 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            Calculating segment centroids from backend ML service…
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Customer Segments</h1>
          <p className="page-subtitle">Unsupervised clustering and segment profiles</p>
        </div>
        <div style={{ padding: '32px 24px', background: 'white', borderRadius: 16, border: '1px solid #fee2e2', textAlign: 'center' }}>
          <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Failed to Load Customer Segments
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 18 }}>
            {error}
          </div>
          <button className="btn btn-primary" onClick={fetchSegments}>
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (segments.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Customer Segments</h1>
          <p className="page-subtitle">Unsupervised clustering and segment profiles</p>
        </div>
        <div style={{ padding: 40, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          No customer segment profiles available.
        </div>
      </div>
    );
  }

  const totalCustomers = segments.reduce((acc, s) => acc + (s.size || 0), 0);
  const pieData = segments.map((s, i) => ({
    name: s.label || `Segment ${s.id ?? i}`,
    value: s.size,
    color: s.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));

  const radarData = [
    {
      metric: 'Avg Tenure',
      seg0: segments[0]?.avgTenure || 0,
      seg1: segments[1]?.avgTenure || 0,
    },
    {
      metric: 'Monthly Charges',
      seg0: segments[0]?.avgMonthlyCharges || 0,
      seg1: segments[1]?.avgMonthlyCharges || 0,
    },
    {
      metric: 'Churn Rate (%)',
      seg0: segments[0]?.churnRate || 0,
      seg1: segments[1]?.churnRate || 0,
    },
    {
      metric: 'Total Charges / 10',
      seg0: (segments[0]?.avgTotalCharges || 0) / 10,
      seg1: (segments[1]?.avgTotalCharges || 0) / 10,
    },
  ];

  const barData = segments.map((s, i) => ({
    name: s.label || `Segment ${s.id ?? i}`,
    Customers: s.size,
    fill: s.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customer Segments</h1>
        <p className="page-subtitle">
          K-Means Clustering · {segments.length} Clusters · {totalCustomers.toLocaleString()} Customers Analyzed
        </p>
      </div>

      {/* ── Segment Cards ─────────────────────────── */}
      <div className="segment-grid">
        {segments.map((seg, i) => {
          const color = seg.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          return (
            <div key={seg.id ?? i} className="segment-card">
              <div className="segment-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${color}18`,
                    border: `2px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Users size={22} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {seg.label || `Segment ${seg.id ?? i}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>
                      {(seg.size || 0).toLocaleString()} customers · {seg.percentage}% of cohort
                    </div>
                  </div>
                </div>

                {/* Size distribution bar */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${seg.percentage}%`,
                      background: color,
                      borderRadius: 3,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              </div>

              <div className="segment-card-body">
                {[
                  { label: 'Average Tenure',         value: `${seg.avgTenure} months`,  icon: Clock },
                  { label: 'Avg Monthly Charges',    value: `$${seg.avgMonthlyCharges}`, icon: DollarSign },
                  { label: 'Avg Total Charges',      value: `$${seg.avgTotalCharges?.toLocaleString()}`, icon: DollarSign },
                  { label: 'Historical Churn Rate',  value: `${seg.churnRate}%`,         icon: Activity },
                  { label: 'Dominant Contract',      value: seg.topContract || '—' },
                  { label: 'Primary Internet',       value: seg.topInternet || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="segment-stat-row">
                    <div className="segment-stat-label">{label}</div>
                    <div className="segment-stat-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ────────────────────────────── */}
      <div className="charts-grid">
        {/* Pie distribution */}
        <ChartCard title="Cluster Size Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={55}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar comparison */}
        <ChartCard title="Segment Profile Comparison">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
              {segments.slice(0, 2).map((s, i) => (
                <Radar
                  key={s.label || i}
                  name={s.label || `Segment ${s.id ?? i}`}
                  dataKey={`seg${i}`}
                  stroke={s.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  fill={s.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{val}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Customer count bar ──────────────────────── */}
      <ChartCard title="Customers per Cluster">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Customers" radius={[8, 8, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
