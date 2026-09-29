import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import {
  Users, UserRoundX, UserRoundCheck, TrendingDown,
  Layers, Brain, BarChart3, AlertCircle, RefreshCw,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import {
  getAnalyticsOverview,
  getChurnByContract,
  getChurnByTenure,
  getSegments,
} from '../services/api';

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
const CHURN_COLOR = '#ef4444';
const RETAIN_COLOR = '#10b981';

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
            {typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString() : p.value}
            {p.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
};

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats]         = useState(null);
  const [contracts, setContracts] = useState([]);
  const [tenure, setTenure]       = useState([]);
  const [segments, setSegments]   = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, contractData, tenureData, segmentData] = await Promise.all([
        getAnalyticsOverview(),
        getChurnByContract().catch(() => ({ data: [] })),
        getChurnByTenure().catch(() => ({ data: [] })),
        getSegments().catch(() => ({ segments: [] })),
      ]);

      setStats(overviewData);
      setContracts(contractData?.data || contractData || []);
      setTenure(tenureData?.data || tenureData || []);
      setSegments(segmentData?.segments || []);
    } catch (err) {
      setError(err?.message || 'Unable to load dashboard data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Customer Churn<br /><span>Intelligence</span></h1>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', gap: 14 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            Loading live dataset metrics & analytics…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Executive Dashboard</h1>
        </div>
        <div style={{ padding: '32px 24px', background: 'white', borderRadius: 16, border: '1px solid #fee2e2', textAlign: 'center' }}>
          <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Unable to load dashboard data
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 18 }}>{error}</div>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const {
    totalCustomers = 7043,
    churnedCustomers = 1869,
    retainedCustomers = 5174,
    churnRate = 26.54,
    customerSegments = 2,
  } = stats || {};

  // Donut data
  const donutData = [
    { name: 'Retained', value: retainedCustomers, color: RETAIN_COLOR },
    { name: 'Churned',  value: churnedCustomers,  color: CHURN_COLOR },
  ];

  // Segment pie
  const segPie = segments.map((s, i) => ({
    name: s.label || `Segment ${s.id ?? i}`,
    value: s.size,
    color: s.color || PALETTE[i % PALETTE.length],
  }));

  return (
    <div>
      {/* ── Hero ──────────────────────────────────── */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <Brain size={11} strokeWidth={2.5} />
            AI-Powered Analytics
          </div>
          <h1 className="hero-title">
            Customer Churn<br /><span>Intelligence</span>
          </h1>
          <p className="hero-desc">
            Predict individual customer churn risk, evaluate key model factors, and explore
            machine learning cluster segments in real time.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/predict')}
              id="hero-predict-btn"
            >
              <Brain size={16} strokeWidth={2.5} />
              Predict Customer Churn
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('/analytics')}
              id="hero-analytics-btn"
            >
              <BarChart3 size={16} />
              Explore Analytics
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────── */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          icon={Users}
          color="#6366f1"
          bg="rgba(99,102,241,0.08)"
          subtitle="Analyzed customer base"
        />
        <StatCard
          title="Churned Customers"
          value={churnedCustomers.toLocaleString()}
          icon={UserRoundX}
          color="#ef4444"
          bg="rgba(239,68,68,0.08)"
          subtitle={`${churnRate}% churn rate`}
        />
        <StatCard
          title="Retained Customers"
          value={retainedCustomers.toLocaleString()}
          icon={UserRoundCheck}
          color="#10b981"
          bg="rgba(16,185,129,0.08)"
          subtitle={`${(100 - churnRate).toFixed(1)}% retained`}
        />
        <StatCard
          title="Churn Rate"
          value={`${churnRate}%`}
          icon={TrendingDown}
          color="#f59e0b"
          bg="rgba(245,158,11,0.08)"
          subtitle="Baseline churn level"
        />
        <StatCard
          title="Customer Segments"
          value={customerSegments}
          icon={Layers}
          color="#ec4899"
          bg="rgba(236,72,153,0.08)"
          subtitle="K-Means clusters"
        />
      </div>

      {/* ── Charts: Donut + Segment Pie ───────────── */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        <ChartCard title="Overall Churn vs. Retention">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
              >
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Segment Distribution">
          {segPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={segPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {segPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No segment data</div>
          )}
        </ChartCard>
      </div>

      {/* ── Charts: Contract + Tenure ─────────────── */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        <ChartCard title="Churn by Contract Type">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={contracts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="contract" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="retained" name="Retained" fill={RETAIN_COLOR} radius={[6, 6, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={CHURN_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn Rate Across Tenure Cohorts">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={tenure} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="churnRate"
                name="Churn Rate (%)"
                stroke={CHURN_COLOR}
                strokeWidth={2.5}
                dot={{ r: 4, fill: CHURN_COLOR }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
