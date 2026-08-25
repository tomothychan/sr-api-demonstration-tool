import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export default function NotificationBanner({ notification, onClose }) {
  if (!notification) return null;

  const { 
    message, 
    type = 'warning', 
    onConfirm, 
    confirmText = 'Confirm', 
    onCancel 
  } = notification;

  useEffect(() => {
    if (onConfirm) return; // Do not auto-dismiss when confirmation action is required
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose, onConfirm]);

  const renderIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} className="sr-notification-icon sr-notification-icon-warning" />;
      case 'error':
        return <AlertTriangle size={18} className="sr-notification-icon sr-notification-icon-error" />;
      case 'success':
        return <CheckCircle size={18} className="sr-notification-icon sr-notification-icon-success" />;
      default:
        return <Info size={18} className="sr-notification-icon sr-notification-icon-info" />;
    }
  };

  const handleDismiss = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className={`sr-notification-banner sr-notification-banner-${type}`}>
      {renderIcon()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
        <span className="sr-notification-message">{message}</span>
        {onConfirm && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <button
              className="sr-btn sr-btn-primary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
            <button
              className="sr-btn sr-btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem' }}
              onClick={handleDismiss}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <button 
        onClick={handleDismiss}
        className="sr-notification-close-btn"
        title="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}