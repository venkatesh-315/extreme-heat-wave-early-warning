import React from 'react';
import { InfoIcon } from './icons';
import './ModelConfidenceCard.css';

function ModelConfidenceCard({ confidence = 89, lastUpdated }) {
  const displayTime = lastUpdated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // SVG calculation for circular gauge
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="card model-confidence-card" id="model-confidence-card">
      <div className="confidence-card-top">
        <h3 className="card-heading">
          Model Confidence
          <span className="info-tooltip-wrap" title="Machine learning model prediction certainty score across multi-ensemble numerical weather models">
            <InfoIcon size={14} />
          </span>
        </h3>
      </div>

      <div className="confidence-card-body">
        {/* Circular Progress Gauge */}
        <div className="confidence-gauge-wrap">
          <svg viewBox="0 0 80 80" className="confidence-svg">
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="conf-bg-ring"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="conf-progress-ring"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="conf-center-text">
            <span className="conf-pct-num">{confidence}%</span>
          </div>
        </div>

        {/* Text Block */}
        <div className="confidence-text-block">
          <div className="conf-rating-title">High Confidence</div>
          <p className="conf-desc">Model accuracy is high for this forecast.</p>
          <div className="conf-timestamp">Last Updated: {displayTime}</div>
        </div>
      </div>
    </div>
  );
}

export default ModelConfidenceCard;
