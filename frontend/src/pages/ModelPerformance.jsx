import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell,
} from 'recharts';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import ChartCard from '../components/ui/ChartCard';
import Badge from '../components/ui/Badge';
import { getModelPerformance } from '../services/api';

const METRICS_LABELS = {
  accuracy:  'Accuracy',
  precision: 'Precision',
  recall:    'Recall',
  f1Score:   'F1-Score',
  rocAuc:    'ROC-AUC',
};

const CHART_PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

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
            {typeof p.value === 'number' ? (p.value * 100).toFixed(1) + '%' : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function MetricBar({ value, color }) {
  return (
    <div className="metric-bar-wrap">
      <div className="metric-bar-track" style={{ flex: 1 }}>
        <div
          className="metric-bar-fill"
          style={{ width: `${(value * 100).toFixed(0)}%`, background: color }}
        />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', width: 44, textAlign: 'right' }}>
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );
}

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMetric, setActiveMetric] = useState('rocAuc');

  const fetchMetrics = () => {
    setLoading(true);
    setError(null);
    getModelPerformance()
      .then((d) => {
        if (d?.models && Array.isArray(d.models)) {
          setMetrics(d.models);
        } else {
          setMetrics([]);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Unable to load model performance data. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Model Performance</h1>
          <p className="page-subtitle">Experimental evaluation metrics across candidate algorithms</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', gap: 14 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            Fetching cross-validation benchmark results…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Model Performance</h1>
          <p className="page-subtitle">Experimental evaluation metrics across candidate algorithms</p>
        </div>
        <div style={{ padding: '32px 24px', background: 'white', borderRadius: 16, border: '1px solid #fee2e2', textAlign: 'center' }}>
          <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Unable to load model performance
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 18 }}>{error}</div>
          <button className="btn btn-primary" onClick={fetchMetrics}>
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Model Performance</h1>
          <p className="page-subtitle">Experimental evaluation metrics across candidate algorithms</p>
        </div>
        <div style={{ padding: 40, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          No model performance evaluation records found.
        </div>
      </div>
    );
  }

  // Bar chart data for selected metric
  const barData = metrics.map((m, i) => ({
    model: m.model,
    shortName: m.model,
    value: m[activeMetric],
    fill: CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  // Radar multi-metric comparison data
  const radarData = Object.entries(METRICS_LABELS).map(([key, label]) => {
    const entry = { metric: label };
    metrics.forEach((m) => {
      entry[m.model] = m[key];
    });
    return entry;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Model Performance</h1>
        <p className="page-subtitle">Experimental evaluation metrics across candidate classifiers</p>
      </div>

      {/* ── Active Deployed Model Highlight ──────────────── */}
      {metrics.filter((m) => m.status === 'Selected').map((m) => (
        <div
          key={m.model}
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16,
            padding: '18px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} color="#6366f1" />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Deployed Production Model
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{m.model}</div>
          </div>
          {[
            ['Accuracy', m.accuracy],
            ['Precision', m.precision],
            ['Recall',   m.recall],
            ['F1-Score', m.f1Score],
            ['ROC-AUC',  m.rocAuc],
          ].map(([k, v]) => (
            <div key={k} style={{ textAlign: 'center', minWidth: 64 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                {(v * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
            </div>
          ))}
        </div>
      ))}

      {/* ── Charts row ──────────────────────────── */}
      <div className="charts-grid">
        {/* Bar: selected metric */}
        <ChartCard
          title="Metric Comparison Across Algorithms"
          action={
            <select
              value={activeMetric}
              onChange={(e) => setActiveMetric(e.target.value)}
              id="metric-select"
              aria-label="Select metric to compare"
              style={{
                background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 8,
                padding: '4px 28px 4px 10px', fontSize: '0.75rem', fontWeight: 600,
                color: '#475569', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
              }}
            >
              {Object.entries(METRICS_LABELS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                axisLine={false} tickLine={false}
                angle={-10} textAnchor="end"
              />
              <YAxis
                domain={[0.7, 1]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${(v * 100).toFixed(2)}%`, METRICS_LABELS[activeMetric]]}
                contentStyle={{ borderRadius: 10, fontSize: '0.78rem', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="value" name={METRICS_LABELS[activeMetric]} radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar multi-metric */}
        <ChartCard title="Multi-Metric Profile Comparison">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
              {metrics.map((m, i) => (
                <Radar
                  key={m.model}
                  name={m.model}
                  dataKey={m.model}
                  stroke={CHART_PALETTE[i % CHART_PALETTE.length]}
                  fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: '0.78rem' }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Experimental Benchmark Results Table ────────────────────── */}
      <div className="chart-card" style={{ marginTop: 24 }}>
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Experimental Evaluation Results</div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th>Model Algorithm</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>ROC-AUC</th>
                <th>Deployment Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.model}>
                  <td className="model-name">{m.model}</td>
                  {['accuracy', 'precision', 'recall', 'f1Score', 'rocAuc'].map((key) => (
                    <td key={key}>
                      <MetricBar value={m[key]} color={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    </td>
                  ))}
                  <td>
                    <Badge variant={m.status === 'Selected' ? 'info' : 'neutral'}>
                      {m.status === 'Selected' ? 'Active / Deployed' : 'Evaluated Baseline'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
