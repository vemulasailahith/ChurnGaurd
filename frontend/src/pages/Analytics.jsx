import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { RefreshCw, AlertCircle, TrendingDown, Users } from 'lucide-react';
import ChartCard from '../components/ui/ChartCard';
import {
  getAnalyticsOverview,
  getChurnByContract,
  getChurnByTenure,
  getChurnByInternet,
  getChurnByPayment,
  getChurnBySenior,
  getChurnByPartner,
  getSegments,
} from '../services/api';

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
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
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live datasets from backend
  const [overview, setOverview]         = useState(null);
  const [contracts, setContracts]       = useState([]);
  const [tenure, setTenure]             = useState([]);
  const [internet, setInternet]         = useState([]);
  const [payment, setPayment]           = useState([]);
  const [senior, setSenior]             = useState([]);
  const [partner, setPartner]           = useState([]);
  const [segments, setSegments]         = useState([]);

  // Filters
  const [contractFilter, setContractFilter] = useState('all');
  const [internetFilter, setInternetFilter] = useState('all');

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overviewRes,
        contractsRes,
        tenureRes,
        internetRes,
        paymentRes,
        seniorRes,
        partnerRes,
        segmentsRes,
      ] = await Promise.all([
        getAnalyticsOverview().catch(() => null),
        getChurnByContract().catch(() => ({ data: [] })),
        getChurnByTenure().catch(() => ({ data: [] })),
        getChurnByInternet().catch(() => ({ data: [] })),
        getChurnByPayment().catch(() => ({ data: [] })),
        getChurnBySenior().catch(() => ({ data: [] })),
        getChurnByPartner().catch(() => ({ data: [] })),
        getSegments().catch(() => ({ segments: [] })),
      ]);

      setOverview(overviewRes);
      setContracts(contractsRes?.data || contractsRes || []);
      setTenure(tenureRes?.data || tenureRes || []);
      setInternet(internetRes?.data || internetRes || []);
      setPayment(paymentRes?.data || paymentRes || []);
      setSenior(seniorRes?.data || seniorRes || []);
      setPartner(partnerRes?.data || partnerRes || []);
      setSegments(segmentsRes?.segments || []);
    } catch (err) {
      setError(err?.message || 'Unable to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  // Filter contract data
  const filteredContract = contractFilter === 'all'
    ? contracts
    : contracts.filter((d) => d.contract === contractFilter);

  // Filter internet data
  const filteredInternet = internetFilter === 'all'
    ? internet
    : internet.filter((d) => d.service === internetFilter);

  // Payment pie data
  const paymentPie = payment.map((d, i) => ({
    name: d.method,
    value: d.churnRate,
    color: PALETTE[i % PALETTE.length],
  }));

  // Senior vs Non-Senior data
  const seniorData = senior.map((d) => ({
    name: d.group,
    Retained: d.retained,
    Churned: d.churned,
  }));

  // Churn vs Retention pie
  const churnOverviewPie = overview ? [
    { name: 'Retained', value: overview.retainedCustomers, color: RETAIN_COLOR },
    { name: 'Churned',  value: overview.churnedCustomers,  color: CHURN_COLOR },
  ] : [];

  // Segment pie
  const segmentPie = segments.map((s, i) => ({
    name: s.label || `Segment ${s.id ?? i}`,
    value: s.size,
    color: s.color || PALETTE[i % PALETTE.length],
  }));

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep-dive into churn drivers, customer demographics, and service patterns</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', gap: 14 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            Loading live dataset analytics…
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
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep-dive into churn drivers, customer demographics, and service patterns</p>
        </div>
        <div style={{ padding: '32px 24px', background: 'white', borderRadius: 16, border: '1px solid #fee2e2', textAlign: 'center' }}>
          <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Unable to load analytics. Please try again.
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 18 }}>
            {error}
          </div>
          <button className="btn btn-primary" onClick={fetchAllAnalytics}>
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep-dive into churn drivers, customer demographics, and service patterns</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchAllAnalytics} id="refresh-analytics-btn">
          <RefreshCw size={13} />
          Refresh Data
        </button>
      </div>

      {/* ── Filters ──────────────────────────────── */}
      <div className="filters-bar">
        <span className="filter-label">Filter by:</span>

        <select
          className="filter-select"
          id="filter-contract"
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
          aria-label="Filter by contract"
        >
          <option value="all">All Contracts</option>
          <option value="Month-to-Month">Month-to-Month</option>
          <option value="One Year">One Year</option>
          <option value="Two Year">Two Year</option>
        </select>

        <select
          className="filter-select"
          id="filter-internet"
          value={internetFilter}
          onChange={(e) => setInternetFilter(e.target.value)}
          aria-label="Filter by internet service"
        >
          <option value="all">All Internet Types</option>
          <option value="Fiber Optic">Fiber Optic</option>
          <option value="DSL">DSL</option>
          <option value="No Service">No Service</option>
        </select>
      </div>

      {/* ── Top Row: Overall Churn Distribution & Churn by Contract ── */}
      <div className="charts-grid">
        {/* Overall Churn Distribution */}
        <ChartCard title="Overall Churn Distribution">
          {churnOverviewPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={churnOverviewPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {churnOverviewPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No distribution data</div>
          )}
        </ChartCard>

        {/* Churn by Contract */}
        <ChartCard title="Churn by Contract Type">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filteredContract} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
      </div>

      {/* ── Middle Row: Tenure & Internet Service ──────────────────── */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        {/* Churn Rate by Tenure */}
        <ChartCard title="Churn Rate by Tenure Cohort">
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

        {/* Churn by Internet Service */}
        <ChartCard title="Churn by Internet Service">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filteredInternet} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="service" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="retained" name="Retained" fill={RETAIN_COLOR} radius={[6, 6, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={CHURN_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Third Row: Payment Method & Customer Segments ─────────── */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        {/* Payment Method Churn Rate */}
        <ChartCard title="Churn Rate by Payment Method">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={payment} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="method" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churnRate" name="Churn Rate (%)" radius={[6, 6, 0, 0]}>
                {payment.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer Segment Distribution */}
        <ChartCard title="Customer Segment Distribution">
          {segmentPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={segmentPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {segmentPie.map((entry) => (
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

      {/* ── Demographic Row: Senior Citizen & Partner / Dependents ── */}
      <div className="charts-grid" style={{ marginTop: 24 }}>
        <ChartCard title="Demographics: Senior Citizen Churn">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={seniorData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="Retained" fill={RETAIN_COLOR} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Churned" fill={CHURN_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Household Structure: Partner & Dependents">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={partner} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churnRate" name="Churn Rate (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
