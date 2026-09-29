// ============================================================
//  Mock data — used as fallback when backend is unavailable
//  All values are derived from the Telco Customer Churn dataset
// ============================================================

export const overviewStats = {
  totalCustomers: 7043,
  churnedCustomers: 1869,
  retainedCustomers: 5174,
  churnRate: 26.54,
  customerSegments: 2,
};

export const churnByContract = [
  { contract: 'Month-to-Month', churned: 1655, retained: 2220 },
  { contract: 'One Year',       churned: 166,  retained: 1307 },
  { contract: 'Two Year',       churned: 48,   retained: 1647 },
];

export const churnByTenure = [
  { group: '0–12 mo',   churnRate: 47.7 },
  { group: '13–24 mo',  churnRate: 32.4 },
  { group: '25–36 mo',  churnRate: 22.1 },
  { group: '37–48 mo',  churnRate: 19.3 },
  { group: '49–60 mo',  churnRate: 14.8 },
  { group: '61–72 mo',  churnRate: 9.6  },
];

export const churnByInternet = [
  { service: 'Fiber Optic', churned: 1297, retained: 1799 },
  { service: 'DSL',         churned: 459,  retained: 1962 },
  { service: 'No Service',  churned: 113,  retained: 1413 },
];

export const churnByPayment = [
  { method: 'Electronic Check',    churnRate: 45.3 },
  { method: 'Mailed Check',        churnRate: 19.1 },
  { method: 'Bank Transfer (auto)',churnRate: 16.7 },
  { method: 'Credit Card (auto)',  churnRate: 15.2 },
];

export const churnBySenior = [
  { group: 'Non-Senior', churned: 1393, retained: 4508 },
  { group: 'Senior',     churned: 476,  retained: 666  },
];

export const churnByPartner = [
  { group: 'Has Partner',    churnRate: 19.7 },
  { group: 'No Partner',     churnRate: 33.0 },
  { group: 'Has Dependents', churnRate: 15.5 },
  { group: 'No Dependents',  churnRate: 31.3 },
];

export const segmentData = [
  {
    id: 0,
    label: 'Segment 0',
    size: 4799,
    percentage: 68.1,
    color: '#6366f1',
    avgTenure: 38.4,
    avgMonthlyCharges: 61.2,
    avgTotalCharges: 2389,
    churnRate: 18.3,
    topContract: 'Two Year',
    topInternet: 'DSL',
  },
  {
    id: 1,
    label: 'Segment 1',
    size: 2244,
    percentage: 31.9,
    color: '#ec4899',
    avgTenure: 17.8,
    avgMonthlyCharges: 84.7,
    avgTotalCharges: 1502,
    churnRate: 44.8,
    topContract: 'Month-to-Month',
    topInternet: 'Fiber Optic',
  },
];

export const modelMetrics = [
  {
    model: 'Logistic Regression',
    accuracy: 0.961,
    precision: 0.9518,
    recall: 0.8984,
    f1Score: 0.9243,
    rocAuc: 0.9921,
    status: 'Selected',
  },
  {
    model: 'Random Forest',
    accuracy: 0.9595,
    precision: 0.9703,
    recall: 0.8743,
    f1Score: 0.9198,
    rocAuc: 0.9837,
    status: 'Baseline',
  },
  {
    model: 'Decision Tree',
    accuracy: 0.9475,
    precision: 0.9011,
    recall: 0.9011,
    f1Score: 0.9011,
    rocAuc: 0.9327,
    status: 'Baseline',
  },
  {
    model: 'KNN',
    accuracy: 0.9241,
    precision: 0.8847,
    recall: 0.8209,
    f1Score: 0.8516,
    rocAuc: 0.9626,
    status: 'Baseline',
  },
];

export const CHART_COLORS = {
  churn:    '#ef4444',
  retain:   '#10b981',
  brand:    '#6366f1',
  warning:  '#f59e0b',
  pink:     '#ec4899',
  blue:     '#3b82f6',
  teal:     '#14b8a6',
  orange:   '#f97316',
  palette: ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#14b8a6'],
};
