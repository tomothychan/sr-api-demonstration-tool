import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export default function NotificationBanner({ notification, onClose }) {
  if (!notification) return null;

  const { message, type = 'warning' } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

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

  return (
    <div className={`sr-notification-banner sr-notification-banner-${type}`}>
      {renderIcon()}
      <span className="sr-notification-message">{message}</span>
      <button 
        onClick={onClose}
        className="sr-notification-close-btn"
        title="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}