'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, subscribeToPushNotifications, isPushSupported, showNotification } from '@/lib/push-notifications';
import { useSupabaseUser } from '@/contexts/AuthContext';

export default function NotificationPermission() {
  const { user } = useSupabaseUser();
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(isPushSupported());

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(isPushSupported());
    
    // Check current permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Subscribe to push notifications when permission is granted
    if (permissionStatus === 'granted' && user && !isSubscribed && isSupported) {
      subscribe();
    }
    
    // Unsubscribe if permission is denied or revoked
    if ((permissionStatus === 'denied' || permissionStatus === 'default') && isSubscribed) {
      unsubscribe();
    }
  }, [permissionStatus, user, isSubscribed, isSupported]);

  const subscribe = async () => {
    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        // Send subscription to backend
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: subscription.getKeys ? JSON.stringify(subscription.getKeys()) : {},
            userId: user.id
          }),
        });
        setIsSubscribed(true);
        
        // Show a welcome notification
        showNotification({
          title: 'Bienvenue sur OdaMarket!',
          body: 'Vous allez maintenant recevoir des notifications push.',
          icon: '/icons/oda-192.png'
        });
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const unsubscribe = async () => {
    try {
      await unsubscribeFromPushNotifications();
      // In a real app, you would also notify your backend to remove the subscription
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  };

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setPermissionStatus(permission);
    
    if (permission === 'granted') {
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-500">
        Les notifications push ne sont pas supportées dans ce navigateur.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {!user && (
        <span className="text-xs text-gray-500">
          Connectez-vous pour activer les notifications
        </span>
      )}
      {user && (
        <>
          {permissionStatus === 'default' && (
            <button 
              onClick={requestPermission}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
            >
              Activer les notifications
            </button>
          )}
          {permissionStatus === 'denied' && (
            <span className="text-xs text-gray-500">
              Les notifications sont désactivées. Activez-les dans les paramètres du navigateur.
            </span>
          )}
          {permissionStatus === 'granted' && (
            <>
              {isSubscribed ? (
                <span className="flex items-center space-x-1 text-xs text-green-600">
                  <span role="img" aria-label="Notifications activées">🔔</span>
                  <span>Notifications activées</span>
                </span>
              ) : (
                <button 
                  onClick={subscribe}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                >
                  S'abonner aux notifications
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}