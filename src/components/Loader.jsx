import React from 'react';
import './Loader.css';

const Loader = ({ label, sublabel }) => {
  return (
    <div className="custom-loader-wrapper">
      <div className="custom-loader" />
      {label && <div className="loading-title" style={{ marginTop: '16px' }}>{label}</div>}
      {sublabel && <div className="loading-sub">{sublabel}</div>}
    </div>
  );
};

export default Loader;
