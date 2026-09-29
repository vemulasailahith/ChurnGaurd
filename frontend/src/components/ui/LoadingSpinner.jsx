import React from 'react';

export default function LoadingSpinner({ text = 'Loading…', size = 40 }) {
  return (
    <div className="spinner-wrap">
      <div
        className="spinner"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      />
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
}
