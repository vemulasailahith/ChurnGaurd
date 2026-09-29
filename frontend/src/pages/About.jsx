import React from 'react';
import {
  Brain, Database, BarChart3, Users, Shield, Zap,
  GitBranch, Activity, BookOpen, Code2, Server,
} from 'lucide-react';

const models = [
  { name: 'Logistic Regression', role: 'Primary model — highest overall accuracy & AUC', color: '#6366f1' },
  { name: 'Random Forest',       role: 'Ensemble method with strong precision',           color: '#ec4899' },
  { name: 'Decision Tree',       role: 'Balanced precision/recall classifier',            color: '#10b981' },
  { name: 'K-Nearest Neighbors', role: 'Distance-based classification baseline',          color: '#f59e0b' },
  { name: 'K-Means Clustering',  role: 'Unsupervised customer segmentation (k=2)',        color: '#3b82f6' },
];

const techStack = {
  Frontend: ['React 19', 'Vite 8', 'React Router', 'Recharts', 'Lucide React', 'Axios'],
  Backend:  ['Python', 'FastAPI', 'scikit-learn', 'joblib', 'pandas', 'numpy'],
  ML:       ['Logistic Regression', 'Random Forest', 'Decision Tree', 'KNN', 'K-Means'],
  Database: ['SQLite', 'SQLAlchemy'],
};

const preprocessing = [
  'Label encoding for binary categorical features (Yes/No)',
  'One-hot encoding for multi-category features (e.g. Contract, Internet Service)',
  'Standard scaling for numerical features (Tenure, Monthly & Total Charges)',
  'Train/test split with stratification to preserve churn ratio',
  'Handling of dependent features (e.g. MultipleLines requires PhoneService)',
];

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: '#94a3b8', marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function InfoCard({ children, style }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.8)',
        borderRadius: 20, boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.06)',
        backdropFilter: 'blur(8px)', padding: '24px', ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">About ChurnGuard</h1>
        <p className="page-subtitle">Project overview, dataset, machine learning pipeline, and technology stack</p>
      </div>

      {/* ── Hero info banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          borderRadius: 20, padding: '32px 36px', marginBottom: 28,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative glows */}
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '10%', width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)', flexShrink: 0,
            }}
          >
            <Shield size={28} color="white" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 4 }}>
              ChurnGuard
            </div>
            <div style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: 520 }}>
              AI-Powered Customer Churn Prediction &amp; Segmentation — built on the Telco Customer Churn dataset with scikit-learn &amp; FastAPI.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { value: '7,043', label: 'Customers' },
              { value: '5', label: 'ML Models' },
              { value: '96.1%', label: 'Best Accuracy' },
              { value: '2', label: 'Clusters' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{value}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="about-grid">
        {/* Left column */}
        <div>
          {/* Project Purpose */}
          <InfoCard style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color="#6366f1" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Project Purpose</div>
            </div>
            <p className="about-text" style={{ marginBottom: 12 }}>
              ChurnGuard is a machine learning analytics platform designed to help businesses identify customers at risk of churning and understand customer segments. By predicting churn before it happens, companies can proactively intervene with targeted retention strategies.
            </p>
            <p className="about-text">
              The system combines supervised classification models for churn prediction with unsupervised K-Means clustering for customer segmentation, providing both predictive insights and descriptive analytics in a single unified interface.
            </p>
          </InfoCard>

          {/* Dataset */}
          <InfoCard style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Dataset</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Dataset', value: 'Telco Customer Churn' },
                { label: 'Total Records', value: '7,043 customers' },
                { label: 'Churned', value: '1,869 (26.5%)' },
                { label: 'Features', value: '21 variables' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{value}</div>
                </div>
              ))}
            </div>
            <p className="about-text">
              The dataset includes customer demographics (gender, senior citizen status, partner/dependents), service subscriptions (phone, internet, streaming), and account information (contract type, payment method, billing, tenure, and charges).
            </p>
          </InfoCard>

          {/* Preprocessing */}
          <InfoCard style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitBranch size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Data Preprocessing</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {preprocessing.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.83rem', color: '#475569' }}>
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, color: '#6366f1', flexShrink: 0, marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  {step}
                </div>
              ))}
            </div>
          </InfoCard>

          {/* ML Models */}
          <InfoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={18} color="#6366f1" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Machine Learning Models</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {models.map((m) => (
                <div
                  key={m.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 1 }}>{m.role}</div>
                  </div>
                  <Activity size={14} color={m.color} />
                </div>
              ))}
            </div>
          </InfoCard>
        </div>

        {/* Right column */}
        <div>
          {/* Technology Stack */}
          <InfoCard style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={18} color="#ec4899" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Tech Stack</div>
            </div>
            {Object.entries(techStack).map(([category, items]) => (
              <div key={category} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  {category}
                </div>
                <div className="tech-list">
                  {items.map((item) => (
                    <span key={item} className="tech-pill">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </InfoCard>

          {/* Architecture */}
          <InfoCard style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Architecture</div>
            </div>
            {[
              { label: 'React Frontend', desc: 'SPA with React Router & Recharts', color: '#6366f1' },
              { label: 'Axios HTTP Client', desc: 'Centralized API service layer', color: '#94a3b8' },
              { label: 'FastAPI Backend', desc: 'RESTful API with Pydantic validation', color: '#ec4899' },
              { label: 'ML Pipeline', desc: 'scikit-learn models + preprocessor', color: '#10b981' },
              { label: 'SQLite Database', desc: 'Prediction history & analytics cache', color: '#f59e0b' },
            ].map((step, i, arr) => (
              <div key={step.label} style={{ display: 'flex', gap: 12, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${step.color}18`, border: `2px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color }} />
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'linear-gradient(to bottom, #e2e8f0, transparent)', minHeight: 20, margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0, paddingTop: 4 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{step.label}</div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 1 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </InfoCard>

          {/* Features */}
          <InfoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#6366f1" />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Key Features</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: Brain, label: 'Real-time churn prediction', color: '#6366f1' },
                { icon: Users, label: 'K-Means customer segmentation', color: '#ec4899' },
                { icon: BarChart3, label: 'Interactive analytics dashboard', color: '#10b981' },
                { icon: Activity, label: 'ML model performance comparison', color: '#f59e0b' },
                { icon: Shield, label: 'Risk-level scoring & visual indicators', color: '#3b82f6' },
                { icon: Database, label: 'Prediction history persistence', color: '#8b5cf6' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(226,232,240,0.5)', fontSize: '0.83rem', color: '#475569' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={color} />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
