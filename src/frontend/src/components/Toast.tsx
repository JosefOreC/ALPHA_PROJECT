import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className={`toast-notification toast-${type}`} id="toast-message" role="alert">
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '⚠'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className="toast-text">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar notificación" id="toast-close-btn">
        ×
      </button>
    </div>
  );
};
