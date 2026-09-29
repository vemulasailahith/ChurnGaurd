import React, { useState } from 'react';
import {
  User, Wifi, CreditCard, Brain, BarChart2,
  RefreshCw, AlertCircle, Star, Sparkles,
  ShieldAlert, ShieldCheck, Shield, Users, ArrowRight,
} from 'lucide-react';
import ErrorMessage from '../components/ui/ErrorMessage';
import { predictChurn } from '../services/api';

// ── Initial form state — all 37 training features ─────────────────────────────
const INITIAL = {
  // 1. Customer Profile
  gender:             'Male',
  age:                '35',
  seniorCitizen:      'No',
  married:            'No',
  dependents:         'No',
  referredAFriend:    'No',

  // 2. Service Information
  offer:              'No Offer',
  phoneService:       'Yes',
  multipleLines:      'No',
  internetService:    'Yes',
  internetType:       'Fiber Optic',
  onlineSecurity:     'No',
  onlineBackup:       'No',
  deviceProtectionPlan: 'No',
  premiumTechSupport: 'No',
  streamingTV:        'No',
  streamingMovies:    'No',
  streamingMusic:     'No',
  unlimitedData:      'Yes',

  // 3. Account Information
  contract:           'Month-to-Month',
  paperlessBilling:   'Yes',
  paymentMethod:      'Bank Withdrawal',
  tenureInMonths:     '12',

  // 4. Financial & Usage Information
  numberOfDependents: '0',
  population:         '15000',
  numberOfReferrals:  '0',
  avgMonthlyLongDistanceCharges: '20.00',
  avgMonthlyGBDownload:          '25.0',
  monthlyCharge:                 '85.00',
  totalCharges:                  '1020.00',
  totalRefunds:                  '0.00',
  totalExtraDataCharges:         '0.00',
  totalLongDistanceCharges:      '240.00',
  totalRevenue:                  '1260.00',
  satisfactionScore:             '3',
  cltv:                          '4200.00',
};

// ── Preset samples for quick evaluation ──────────────────────────────────────
const PRESET_HIGH_RISK = {
  gender: 'Male',
  age: '24', // Under 30 = Yes
  seniorCitizen: 'No',
  married: 'No',
  dependents: 'No',
  referredAFriend: 'No',
  offer: 'No Offer',
  phoneService: 'Yes',
  multipleLines: 'No',
  internetService: 'Yes',
  internetType: 'Fiber Optic',
  onlineSecurity: 'No',
  onlineBackup: 'No',
  deviceProtectionPlan: 'No',
  premiumTechSupport: 'No',
  streamingTV: 'No',
  streamingMovies: 'No',
  streamingMusic: 'No',
  unlimitedData: 'Yes',
  contract: 'Month-to-Month',
  paperlessBilling: 'Yes',
  paymentMethod: 'Bank Withdrawal',
  tenureInMonths: '3',
  numberOfDependents: '0',
  population: '12000',
  numberOfReferrals: '0',
  avgMonthlyLongDistanceCharges: '25.00',
  avgMonthlyGBDownload: '15.0',
  monthlyCharge: '78.50',
  totalCharges: '235.50',
  totalRefunds: '0.00',
  totalExtraDataCharges: '0.00',
  totalLongDistanceCharges: '75.00',
  totalRevenue: '310.50',
  satisfactionScore: '1',
  cltv: '3200.00',
};

const PRESET_LOW_RISK = {
  gender: 'Female',
  age: '52', // Under 30 = No
  seniorCitizen: 'No',
  married: 'Yes',
  dependents: 'Yes',
  referredAFriend: 'Yes',
  offer: 'Offer A',
  phoneService: 'Yes',
  multipleLines: 'Yes',
  internetService: 'Yes',
  internetType: 'Fiber Optic',
  onlineSecurity: 'Yes',
  onlineBackup: 'Yes',
  deviceProtectionPlan: 'Yes',
  premiumTechSupport: 'Yes',
  streamingTV: 'Yes',
  streamingMovies: 'Yes',
  streamingMusic: 'Yes',
  unlimitedData: 'Yes',
  contract: 'Two Year',
  paperlessBilling: 'No',
  paymentMethod: 'Credit Card',
  tenureInMonths: '60',
  numberOfDependents: '2',
  population: '25000',
  numberOfReferrals: '5',
  avgMonthlyLongDistanceCharges: '12.50',
  avgMonthlyGBDownload: '35.0',
  monthlyCharge: '85.00',
  totalCharges: '5100.00',
  totalRefunds: '0.00',
  totalExtraDataCharges: '0.00',
  totalLongDistanceCharges: '750.00',
  totalRevenue: '5850.00',
  satisfactionScore: '5',
  cltv: '5200.00',
};

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errors = {};
  const req = (k, label) => {
    if (!form[k] && form[k] !== 0) errors[k] = `${label} is required`;
  };
  const num = (k, label, min = 0, max = Infinity) => {
    if (form[k] === '' || form[k] === null || form[k] === undefined) {
      errors[k] = `${label} is required`;
    } else {
      const v = parseFloat(form[k]);
      if (isNaN(v)) errors[k] = `${label} must be a number`;
      else if (v < min) errors[k] = `${label} must be ≥ ${min}`;
      else if (v > max) errors[k] = `${label} must be ≤ ${max}`;
    }
  };

  // Section 1: Customer Profile
  req('gender', 'Gender');
  num('age', 'Age', 18, 100);
  req('seniorCitizen', 'Senior Citizen');
  req('married', 'Married');
  req('dependents', 'Dependents');
  req('referredAFriend', 'Referred a Friend');

  // Section 2: Services
  req('offer', 'Offer');
  req('phoneService', 'Phone Service');
  req('multipleLines', 'Multiple Lines');
  req('internetService', 'Internet Service');
  req('internetType', 'Internet Type');
  req('onlineSecurity', 'Online Security');
  req('onlineBackup', 'Online Backup');
  req('deviceProtectionPlan', 'Device Protection Plan');
  req('premiumTechSupport', 'Premium Tech Support');
  req('streamingTV', 'Streaming TV');
  req('streamingMovies', 'Streaming Movies');
  req('streamingMusic', 'Streaming Music');
  req('unlimitedData', 'Unlimited Data');

  // Section 3: Account Information
  req('contract', 'Contract');
  req('paperlessBilling', 'Paperless Billing');
  req('paymentMethod', 'Payment Method');
  num('tenureInMonths', 'Tenure in Months', 0, 100);

  // Section 4: Financial & Usage
  num('numberOfDependents', 'Number of Dependents', 0, 10);
  num('population', 'Population', 0);
  num('numberOfReferrals', 'Number of Referrals', 0, 20);
  num('avgMonthlyLongDistanceCharges', 'Avg Monthly Long Distance Charges', 0);
  num('avgMonthlyGBDownload', 'Avg Monthly GB Download', 0);
  num('monthlyCharge', 'Monthly Charge', 0);
  num('totalCharges', 'Total Charges', 0);
  num('totalRefunds', 'Total Refunds', 0);
  num('totalExtraDataCharges', 'Total Extra Data Charges', 0);
  num('totalLongDistanceCharges', 'Total Long Distance Charges', 0);
  num('totalRevenue', 'Total Revenue', 0);
  num('satisfactionScore', 'Satisfaction Score', 1, 5);
  num('cltv', 'CLTV', 0);

  return errors;
}

// ── Risk level presentation ──────────────────────────────────────────────────
function getRiskConfig(level) {
  if (level === 'HIGH') {
    return {
      color: '#dc2626',
      bg: 'rgba(239,68,68,0.08)',
      badge: 'risk-badge-high',
      icon: ShieldAlert,
      label: 'HIGH RISK',
      summary: 'Likely to Churn',
    };
  }
  if (level === 'MEDIUM') {
    return {
      color: '#d97706',
      bg: 'rgba(245,158,11,0.08)',
      badge: 'risk-badge-medium',
      icon: Shield,
      label: 'MEDIUM RISK',
      summary: 'Moderate Churn Risk',
    };
  }
  return {
    color: '#059669',
    bg: 'rgba(16,185,129,0.08)',
    badge: 'risk-badge-low',
    icon: ShieldCheck,
    label: 'LOW RISK',
    summary: 'Likely to Stay',
  };
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
function FormField({ label, id, children, error, hint }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

function SelectField({ id, name, value, onChange, options, placeholder, error }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`form-control${error ? ' error' : ''}`}
      aria-label={id}
    >
      <option value="">{placeholder || 'Select…'}</option>
      {options.map(([val, lbl]) => (
        <option key={val} value={val}>{lbl}</option>
      ))}
    </select>
  );
}

function NumberField({ id, name, value, onChange, min, max, step = '1', placeholder, error }) {
  return (
    <input
      id={id}
      name={name}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`form-control${error ? ' error' : ''}`}
      aria-label={id}
    />
  );
}

function Section({ icon: Icon, iconColor, iconBg, title, desc, children }) {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <div className="form-section-icon" style={{ background: iconBg }}>
          <Icon size={18} color={iconColor} />
        </div>
        <div>
          <div className="form-section-title">{title}</div>
          <div className="form-section-desc">{desc}</div>
        </div>
      </div>
      <div className="form-section-body">
        <div className="form-grid">{children}</div>
      </div>
    </div>
  );
}

const YES_NO = [['Yes', 'Yes'], ['No', 'No']];
const YES_NO_NIS = [...YES_NO, ['No Internet Service', 'No Internet Service']];
const YES_NO_NPS = [...YES_NO, ['No Phone Service', 'No Phone Service']];

export default function PredictChurn() {
  const [form, setForm]         = useState(INITIAL);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult]     = useState(null);

  // Derived Under 30 value from Age (Age is the single source of truth)
  const parsedAge = parseInt(form.age, 10);
  const derivedUnder30 = !isNaN(parsedAge) && parsedAge < 30 ? 'Yes' : 'No';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const applyPreset = (preset) => {
    setForm(preset);
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErr = document.querySelector('.form-control.error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    try {
      // Build 37-feature payload with correct numerical and categorical types
      const payload = {
        gender:                        form.gender,
        age:                           parseInt(form.age, 10),
        under30:                       derivedUnder30,
        seniorCitizen:                 form.seniorCitizen,
        married:                       form.married,
        dependents:                    form.dependents,
        numberOfDependents:            parseInt(form.numberOfDependents, 10),
        referredAFriend:               form.referredAFriend,
        numberOfReferrals:             parseInt(form.numberOfReferrals, 10),

        offer:                         form.offer,
        phoneService:                  form.phoneService,
        multipleLines:                 form.multipleLines,
        internetService:               form.internetService,
        internetType:                  form.internetType,
        onlineSecurity:                form.onlineSecurity,
        onlineBackup:                  form.onlineBackup,
        deviceProtectionPlan:          form.deviceProtectionPlan,
        premiumTechSupport:            form.premiumTechSupport,
        streamingTV:                   form.streamingTV,
        streamingMovies:               form.streamingMovies,
        streamingMusic:                form.streamingMusic,
        unlimitedData:                 form.unlimitedData,

        contract:                      form.contract,
        paperlessBilling:              form.paperlessBilling,
        paymentMethod:                 form.paymentMethod,
        tenureInMonths:                parseInt(form.tenureInMonths, 10),

        avgMonthlyLongDistanceCharges: parseFloat(form.avgMonthlyLongDistanceCharges || 0),
        avgMonthlyGBDownload:          parseFloat(form.avgMonthlyGBDownload || 0),
        monthlyCharge:                 parseFloat(form.monthlyCharge),
        totalCharges:                  parseFloat(form.totalCharges),
        totalRefunds:                  parseFloat(form.totalRefunds || 0),
        totalExtraDataCharges:         parseFloat(form.totalExtraDataCharges || 0),
        totalLongDistanceCharges:      parseFloat(form.totalLongDistanceCharges || 0),
        totalRevenue:                  parseFloat(form.totalRevenue),
        satisfactionScore:             parseInt(form.satisfactionScore, 10),
        cltv:                          parseFloat(form.cltv || 0),
        population:                    parseInt(form.population || 10000, 10),
      };

      const data = await predictChurn(payload);
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    setResult(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Result View ───────────────────────────────────────────────────────────
  if (result) {
    const prob      = result.churn_probability ?? 0;
    const cfg       = getRiskConfig(result.risk_level);
    const RiskIcon  = cfg.icon;
    const pct       = (prob * 100).toFixed(2);
    const willChurn = result.prediction === 1;

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Prediction Result</h1>
          <p className="page-subtitle">Real-time Machine Learning Inference</p>
        </div>

        <div className="prediction-result" id="prediction-result-card">
          {/* Header */}
          <div className="prediction-result-header" style={{ background: cfg.bg }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${cfg.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RiskIcon size={26} color={cfg.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b' }}>
                CHURN PREDICTION
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {willChurn ? 'Likely to Churn' : 'Likely to Stay'}
              </div>
            </div>
          </div>

          <div className="prediction-result-body">
            {/* Left: probability and risk meter */}
            <div className="risk-gauge-wrap" style={{ borderRight: '1px solid #e2e8f0' }}>
              <div className="risk-label-text" style={{ marginBottom: 8 }}>Churn Probability</div>
              <div className="risk-prob" style={{ color: cfg.color }} id="result-churn-prob">
                {pct}%
              </div>
              <div className="risk-label-text" style={{ marginBottom: 14 }}>Model Output Score</div>
              <div className={`risk-badge-large ${cfg.badge}`} id="result-risk-level">
                <RiskIcon size={16} />
                {cfg.label}
              </div>

              {/* Risk gauge bar */}
              <div style={{ width: '85%', marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                  <span>0% Low</span><span>35% Medium</span><span>65%+ High</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min(96, Math.max(4, prob * 100))}%`,
                    top: '50%', transform: 'translate(-50%, -50%)',
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white', border: `3px solid ${cfg.color}`,
                    boxShadow: `0 0 0 3px ${cfg.color}30`,
                  }} />
                </div>
              </div>
            </div>

            {/* Right: details */}
            <div style={{ padding: '28px 32px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 14 }}>
                Prediction Summary
              </div>
              {[
                { label: 'Prediction',        value: willChurn ? 'Likely to Churn' : 'Likely to Stay', color: willChurn ? '#dc2626' : '#059669', id: 'res-pred' },
                { label: 'Churn Probability', value: `${pct}%`, color: cfg.color, id: 'res-prob' },
                { label: 'Risk Level',        value: cfg.label, color: cfg.color, id: 'res-risk' },
                { label: 'Model Used',        value: result.model_used || 'Logistic Regression', id: 'res-model' },
                { label: 'Cluster',           value: `Cluster ${result.cluster ?? '—'}`, id: 'res-cluster' },
                { label: 'Segment',           value: result.segment_label || '—', id: 'res-segment' },
              ].map(({ label, value, color, id }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(226,232,240,0.6)', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
                  <span id={id} style={{ fontWeight: 700, color: color || '#0f172a' }}>{value}</span>
                </div>
              ))}

              {/* Segment info box */}
              {result.segment_label && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={15} color="#6366f1" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}>
                      Assigned to: {result.segment_label}
                    </span>
                  </div>
                </div>
              )}

              {/* Key Model Factors */}
              {result.key_factors && result.key_factors.length > 0 && (
                <div style={{ marginTop: 22 }} id="key-model-factors-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>
                      Key Model Factors
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 12 }}>
                    Factors contributing to the model's prediction
                  </div>
                  {result.key_factors.slice(0, 6).map(({ feature, importance }) => (
                    <div key={feature} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 3 }}>
                        <span style={{ color: '#334155', fontWeight: 600 }}>{feature}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{(importance * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, importance * 100)}%`,
                          background: cfg.color,
                          borderRadius: 3,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer with clear action button */}
          <div style={{ padding: '18px 32px', borderTop: '1px solid #e2e8f0', background: 'rgba(248,250,252,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Inference completed using fitted pipeline & coefficients.
            </span>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleReset}
              id="predict-another-btn"
            >
              <RefreshCw size={15} />
              Predict Another Customer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form View ─────────────────────────────────────────────────────────────
  const errorCount = Object.keys(errors).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Predict Customer Churn</h1>
          <p className="page-subtitle">Input 37 customer attributes to run real-time inference via the trained model pipeline</p>
        </div>
        {/* Quick evaluation samples */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => applyPreset(PRESET_HIGH_RISK)}
            id="preset-high-risk-btn"
            title="Load a high churn risk customer profile"
          >
            <Sparkles size={13} color="#ef4444" />
            Load High-Risk Profile
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => applyPreset(PRESET_LOW_RISK)}
            id="preset-low-risk-btn"
            title="Load a low churn risk customer profile"
          >
            <Sparkles size={13} color="#10b981" />
            Load Low-Risk Profile
          </button>
        </div>
      </div>

      {apiError && <ErrorMessage error={apiError} />}

      {errorCount > 0 && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{errorCount} field{errorCount > 1 ? 's' : ''} require attention — please review the form below.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate id="churn-predict-form">

        {/* ── 1. CUSTOMER PROFILE ────────────────────────────────────────── */}
        <Section
          icon={User} iconColor="#6366f1" iconBg="rgba(99,102,241,0.1)"
          title="CUSTOMER PROFILE" desc="Demographic attributes and personal customer details"
        >
          <FormField label="Gender" id="gender" error={errors.gender}>
            <SelectField
              id="gender" name="gender" value={form.gender} onChange={handleChange} error={errors.gender}
              options={[['Male','Male'],['Female','Female']]} placeholder="Select gender"
            />
          </FormField>

          {/* Under 30 is derived from Age (Age is the source of truth) */}
          <div className="form-group">
            <label className="form-label" htmlFor="under30-badge">Under 30</label>
            <div
              id="under30-badge"
              style={{
                background: derivedUnder30 === 'Yes' ? 'rgba(99,102,241,0.08)' : 'rgba(241,245,249,0.8)',
                border: '1.5px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: derivedUnder30 === 'Yes' ? '#4f46e5' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{derivedUnder30}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#94a3b8' }}>
                Auto-derived from Age ({form.age || '—'})
              </span>
            </div>
          </div>

          <FormField label="Senior Citizen" id="seniorCitizen" error={errors.seniorCitizen}>
            <SelectField
              id="seniorCitizen" name="seniorCitizen" value={form.seniorCitizen} onChange={handleChange} error={errors.seniorCitizen}
              options={YES_NO} placeholder="Select"
            />
          </FormField>

          <FormField label="Married" id="married" error={errors.married}>
            <SelectField
              id="married" name="married" value={form.married} onChange={handleChange} error={errors.married}
              options={YES_NO} placeholder="Select"
            />
          </FormField>

          <FormField label="Dependents" id="dependents" error={errors.dependents}>
            <SelectField
              id="dependents" name="dependents" value={form.dependents} onChange={handleChange} error={errors.dependents}
              options={YES_NO} placeholder="Select"
            />
          </FormField>

          <FormField label="Referred a Friend" id="referredAFriend" error={errors.referredAFriend}>
            <SelectField
              id="referredAFriend" name="referredAFriend" value={form.referredAFriend} onChange={handleChange} error={errors.referredAFriend}
              options={YES_NO} placeholder="Select"
            />
          </FormField>
        </Section>

        {/* ── 2. SERVICE INFORMATION ─────────────────────────────────────── */}
        <Section
          icon={Wifi} iconColor="#10b981" iconBg="rgba(16,185,129,0.1)"
          title="SERVICE INFORMATION" desc="Subscribed services, connectivity, and digital add-ons"
        >
          <FormField label="Offer" id="offer" error={errors.offer}>
            <SelectField
              id="offer" name="offer" value={form.offer} onChange={handleChange} error={errors.offer}
              options={[['No Offer','No Offer'],['Offer A','Offer A'],['Offer B','Offer B'],['Offer C','Offer C'],['Offer D','Offer D'],['Offer E','Offer E']]}
              placeholder="Select offer"
            />
          </FormField>

          <FormField label="Phone Service" id="phoneService" error={errors.phoneService}>
            <SelectField
              id="phoneService" name="phoneService" value={form.phoneService} onChange={handleChange} error={errors.phoneService}
              options={YES_NO} placeholder="Select"
            />
          </FormField>

          <FormField label="Multiple Lines" id="multipleLines" error={errors.multipleLines}>
            <SelectField
              id="multipleLines" name="multipleLines" value={form.multipleLines} onChange={handleChange} error={errors.multipleLines}
              options={YES_NO_NPS} placeholder="Select"
            />
          </FormField>

          <FormField label="Internet Service" id="internetService" error={errors.internetService}>
            <SelectField
              id="internetService" name="internetService" value={form.internetService} onChange={handleChange} error={errors.internetService}
              options={YES_NO} placeholder="Select"
            />
          </FormField>

          <FormField label="Internet Type" id="internetType" error={errors.internetType}>
            <SelectField
              id="internetType" name="internetType" value={form.internetType} onChange={handleChange} error={errors.internetType}
              options={[['DSL','DSL'],['Fiber Optic','Fiber Optic'],['Cable','Cable'],['No Internet','No Internet']]}
              placeholder="Select type"
            />
          </FormField>

          <FormField label="Online Security" id="onlineSecurity" error={errors.onlineSecurity}>
            <SelectField
              id="onlineSecurity" name="onlineSecurity" value={form.onlineSecurity} onChange={handleChange} error={errors.onlineSecurity}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Online Backup" id="onlineBackup" error={errors.onlineBackup}>
            <SelectField
              id="onlineBackup" name="onlineBackup" value={form.onlineBackup} onChange={handleChange} error={errors.onlineBackup}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Device Protection Plan" id="deviceProtectionPlan" error={errors.deviceProtectionPlan}>
            <SelectField
              id="deviceProtectionPlan" name="deviceProtectionPlan" value={form.deviceProtectionPlan} onChange={handleChange} error={errors.deviceProtectionPlan}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Premium Tech Support" id="premiumTechSupport" error={errors.premiumTechSupport}>
            <SelectField
              id="premiumTechSupport" name="premiumTechSupport" value={form.premiumTechSupport} onChange={handleChange} error={errors.premiumTechSupport}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Streaming TV" id="streamingTV" error={errors.streamingTV}>
            <SelectField
              id="streamingTV" name="streamingTV" value={form.streamingTV} onChange={handleChange} error={errors.streamingTV}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Streaming Movies" id="streamingMovies" error={errors.streamingMovies}>
            <SelectField
              id="streamingMovies" name="streamingMovies" value={form.streamingMovies} onChange={handleChange} error={errors.streamingMovies}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Streaming Music" id="streamingMusic" error={errors.streamingMusic}>
            <SelectField
              id="streamingMusic" name="streamingMusic" value={form.streamingMusic} onChange={handleChange} error={errors.streamingMusic}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>

          <FormField label="Unlimited Data" id="unlimitedData" error={errors.unlimitedData}>
            <SelectField
              id="unlimitedData" name="unlimitedData" value={form.unlimitedData} onChange={handleChange} error={errors.unlimitedData}
              options={YES_NO_NIS} placeholder="Select"
            />
          </FormField>
        </Section>

        {/* ── 3. ACCOUNT INFORMATION ─────────────────────────────────────── */}
        <Section
          icon={CreditCard} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.1)"
          title="ACCOUNT INFORMATION" desc="Subscription contract, tenure, billing type, and payment methods"
        >
          <FormField label="Contract" id="contract" error={errors.contract}>
            <SelectField
              id="contract" name="contract" value={form.contract} onChange={handleChange} error={errors.contract}
              options={[['Month-to-Month','Month-to-Month'],['One Year','One Year'],['Two Year','Two Year']]}
              placeholder="Select contract"
            />
          </FormField>

          <FormField label="Paperless Billing" id="paperlessBilling" error={errors.paperlessBilling}>
            <SelectField
              id="paperlessBilling" name="paperlessBilling" value={form.paperlessBilling} onChange={handleChange} error={errors.paperlessBilling}
              options={YES_NO} placeholder="Select"
            />
          </FormField>

          <FormField label="Payment Method" id="paymentMethod" error={errors.paymentMethod}>
            <SelectField
              id="paymentMethod" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} error={errors.paymentMethod}
              options={[['Bank Withdrawal','Bank Withdrawal'],['Credit Card','Credit Card'],['Mailed Check','Mailed Check']]}
              placeholder="Select method"
            />
          </FormField>

          <FormField label="Tenure in Months" id="tenureInMonths" error={errors.tenureInMonths} hint="0–100 months">
            <NumberField
              id="tenureInMonths" name="tenureInMonths" value={form.tenureInMonths} onChange={handleChange}
              min={0} max={100} placeholder="e.g. 12" error={errors.tenureInMonths}
            />
          </FormField>
        </Section>

        {/* ── 4. FINANCIAL & USAGE INFORMATION ───────────────────────────── */}
        <Section
          icon={BarChart2} iconColor="#ec4899" iconBg="rgba(236,72,153,0.1)"
          title="FINANCIAL & USAGE INFORMATION" desc="Age, family size, usage volume, financial charges, and value score"
        >
          {/* Age (Source of truth for Under 30) */}
          <FormField label="Age" id="age" error={errors.age} hint="18–100 (updates Under 30 automatically)">
            <NumberField
              id="age" name="age" value={form.age} onChange={handleChange}
              min={18} max={100} placeholder="e.g. 35" error={errors.age}
            />
          </FormField>

          <FormField label="Number of Dependents" id="numberOfDependents" error={errors.numberOfDependents}>
            <NumberField
              id="numberOfDependents" name="numberOfDependents" value={form.numberOfDependents} onChange={handleChange}
              min={0} max={10} placeholder="0" error={errors.numberOfDependents}
            />
          </FormField>

          <FormField label="Population" id="population" error={errors.population} hint="City / area population">
            <NumberField
              id="population" name="population" value={form.population} onChange={handleChange}
              min={0} max={1000000} placeholder="e.g. 15000" error={errors.population}
            />
          </FormField>

          <FormField label="Number of Referrals" id="numberOfReferrals" error={errors.numberOfReferrals}>
            <NumberField
              id="numberOfReferrals" name="numberOfReferrals" value={form.numberOfReferrals} onChange={handleChange}
              min={0} max={20} placeholder="0" error={errors.numberOfReferrals}
            />
          </FormField>

          <FormField label="Avg Monthly Long Distance ($)" id="avgMonthlyLongDistanceCharges" error={errors.avgMonthlyLongDistanceCharges}>
            <NumberField
              id="avgMonthlyLongDistanceCharges" name="avgMonthlyLongDistanceCharges" value={form.avgMonthlyLongDistanceCharges} onChange={handleChange}
              min={0} max={200} step="0.01" placeholder="e.g. 20.00" error={errors.avgMonthlyLongDistanceCharges}
            />
          </FormField>

          <FormField label="Avg Monthly GB Download" id="avgMonthlyGBDownload" error={errors.avgMonthlyGBDownload}>
            <NumberField
              id="avgMonthlyGBDownload" name="avgMonthlyGBDownload" value={form.avgMonthlyGBDownload} onChange={handleChange}
              min={0} max={500} step="0.1" placeholder="e.g. 25.0" error={errors.avgMonthlyGBDownload}
            />
          </FormField>

          <FormField label="Monthly Charge ($)" id="monthlyCharge" error={errors.monthlyCharge}>
            <NumberField
              id="monthlyCharge" name="monthlyCharge" value={form.monthlyCharge} onChange={handleChange}
              min={0} max={2000} step="0.01" placeholder="e.g. 85.00" error={errors.monthlyCharge}
            />
          </FormField>

          <FormField label="Total Charges ($)" id="totalCharges" error={errors.totalCharges}>
            <NumberField
              id="totalCharges" name="totalCharges" value={form.totalCharges} onChange={handleChange}
              min={0} step="0.01" placeholder="e.g. 1020.00" error={errors.totalCharges}
            />
          </FormField>

          <FormField label="Total Refunds ($)" id="totalRefunds" error={errors.totalRefunds}>
            <NumberField
              id="totalRefunds" name="totalRefunds" value={form.totalRefunds} onChange={handleChange}
              min={0} step="0.01" placeholder="0.00" error={errors.totalRefunds}
            />
          </FormField>

          <FormField label="Total Extra Data Charges ($)" id="totalExtraDataCharges" error={errors.totalExtraDataCharges}>
            <NumberField
              id="totalExtraDataCharges" name="totalExtraDataCharges" value={form.totalExtraDataCharges} onChange={handleChange}
              min={0} step="0.01" placeholder="0.00" error={errors.totalExtraDataCharges}
            />
          </FormField>

          <FormField label="Total Long Distance Charges ($)" id="totalLongDistanceCharges" error={errors.totalLongDistanceCharges}>
            <NumberField
              id="totalLongDistanceCharges" name="totalLongDistanceCharges" value={form.totalLongDistanceCharges} onChange={handleChange}
              min={0} step="0.01" placeholder="e.g. 240.00" error={errors.totalLongDistanceCharges}
            />
          </FormField>

          <FormField label="Total Revenue ($)" id="totalRevenue" error={errors.totalRevenue}>
            <NumberField
              id="totalRevenue" name="totalRevenue" value={form.totalRevenue} onChange={handleChange}
              min={0} step="0.01" placeholder="e.g. 1260.00" error={errors.totalRevenue}
            />
          </FormField>

          <FormField label="Satisfaction Score (1–5)" id="satisfactionScore" error={errors.satisfactionScore} hint="1 = Dissatisfied, 5 = Satisfied">
            <SelectField
              id="satisfactionScore" name="satisfactionScore" value={form.satisfactionScore} onChange={handleChange} error={errors.satisfactionScore}
              options={[['1','1 — Very Dissatisfied'],['2','2 — Dissatisfied'],['3','3 — Neutral'],['4','4 — Satisfied'],['5','5 — Very Satisfied']]}
              placeholder="Select score"
            />
          </FormField>

          <FormField label="Customer Lifetime Value (CLTV)" id="cltv" error={errors.cltv}>
            <NumberField
              id="cltv" name="cltv" value={form.cltv} onChange={handleChange}
              min={0} step="0.01" placeholder="e.g. 4200.00" error={errors.cltv}
            />
          </FormField>
        </Section>

        {/* ── Submit actions ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            id="submit-predict-btn"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Running Inference…
              </>
            ) : (
              <>
                <Brain size={18} strokeWidth={2.5} />
                Predict Customer Churn
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            id="reset-form-btn"
          >
            <RefreshCw size={14} />
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
