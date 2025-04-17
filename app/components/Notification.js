"use client"
import React, { useState, useEffect } from 'react';

const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export default function SimpleNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleShowNotification = (event) => {
      const { title, type, message, duration = 5000 } = event.detail;
      const id = Date.now();

      setNotifications(prev => [...prev, { id, title, type, message }]);

      if (duration) {
        setTimeout(() => {
          closeNotification(id);
        }, duration);
      }
    };

    window.addEventListener('show-notification', handleShowNotification);
    return () => {
      window.removeEventListener('show-notification', handleShowNotification);
    };
  }, []);

  const closeNotification = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isClosing: true }
          : notification
      )
    );

    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 300);
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex rounded-lg shadow-lg overflow-hidden transition-all duration-300 
                      ${notification.isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                      ${getBgColor(notification.type)}
          `}
        >
          <div className={`w-12 flex items-center justify-center text-white text-lg ${getIconBg(notification.type)}`}>
            {getIcon(notification.type)}
          </div>
          <div className="p-3 flex-1 bg-white">
            <h4 className="font-semibold text-black mb-1">{notification.title}</h4>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-700 px-3 py-2 text-lg"
            onClick={() => closeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Helpers
export function showNotification(title, type, message, duration = 5000) {
  const event = new CustomEvent('show-notification', {
    detail: { title, type, message, duration }
  });
  window.dispatchEvent(event);
}

export { NotificationTypes };

function getIcon(type) {
  switch (type) {
    case NotificationTypes.SUCCESS: return '✓';
    case NotificationTypes.ERROR: return '✕';
    case NotificationTypes.WARNING: return '⚠';
    case NotificationTypes.INFO: return 'ℹ';
    default: return '!';
  }
}

function getBgColor(type) {
  switch (type) {
    case NotificationTypes.SUCCESS: return 'bg-green-100';
    case NotificationTypes.ERROR: return 'bg-red-100';
    case NotificationTypes.WARNING: return 'bg-yellow-100';
    case NotificationTypes.INFO: return 'bg-blue-100';
    default: return 'bg-gray-100';
  }
}

function getIconBg(type) {
  switch (type) {
    case NotificationTypes.SUCCESS: return 'bg-green-500';
    case NotificationTypes.ERROR: return 'bg-red-500';
    case NotificationTypes.WARNING: return 'bg-yellow-500';
    case NotificationTypes.INFO: return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
}
