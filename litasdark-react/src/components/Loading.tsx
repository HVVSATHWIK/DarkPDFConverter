import React from 'react';
import { usePdfSettings } from '../hooks/usePdfSettings';

const Loading: React.FC = () => {
  const { loading } = usePdfSettings();
  
  return loading ? (
    <div className="loading-overlay">
      <div className="spinner-container">
        <div className="spinner" />
        <p className="loading-text">Processing PDF...</p>
      </div>
    </div>
  ) : null;
};

export default Loading;