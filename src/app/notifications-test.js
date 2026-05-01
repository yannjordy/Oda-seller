'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, subscribeToPushNotifications, isPushSupported, showNotification } from '@/lib/push-notifications';
import { useSupabaseUser } from '@/contexts/AuthContext';

export default function NotificationTest() {
  const { user } = useSupabaseUser();
  const [supported, setSupported] = useState(isPushSupported());
  const [permission, setPermission] = useState(Notification.permission);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSupported(isPushSupported());
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const permissionStatus = await requestNotificationPermission();
    setPermission(permissionStatus);
    if (permissionStatus === 'granted') {
      await handleSubscribe();
    }
  };

  const handleSubscribe = async () => {
    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        // Send to our API
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: subscription.getKeys ? JSON.stringify(subscription.getKeys()) : {},
            userId: user?.id
          }),
        });
        setSubscribed(true);
        setMessage('Subscribed to push notifications successfully!');
      }
    } catch (error) {
      setMessage(`Error subscribing: ${error.message}`);
      console.error('Subscription error:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeFromPushNotifications();
      setSubscribed(false);
      setMessage('Unsubscribed from push notifications');
    } catch (error) {
      setMessage(`Error unsubscribing: ${error.message}`);
      console.error('Unsubscription error:', error);
    }
  };

  const handleShowNotification = async () => {
    try {
      const result = showNotification({
        title: 'Test Notification',
        body: 'This is a test notification from OdaMarket',
        icon: '/icons/oda-192.png'
      });
      if (result) {
        setMessage('Notification displayed successfully!');
      } else {
        setMessage('Failed to show notification');
      }
    } catch (error) {
      setMessage(`Error showing notification: ${error.message}`);
      console.error('Notification error:', error);
    }
  };

  const handleSendTestPush = async () => {
    if (!user) {
      setMessage('Please log in to test push notifications');
      return;
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          notificationData: {
            title: 'Test Push Notification',
            body: 'This is a test push notification with all required data',
            image: '/icons/oda-192.png',
            productName: 'Test Product',
            shopName: 'Test Shop',
            subject: 'Test Subject',
            url: '/'
          }
        })
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Test push notification sent successfully!');
      } else {
        setMessage(`Error sending push: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error sending test push: ${error.message}`);
      console.error('Test push error:', error);
    }
  };

  if (!supported) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h2 className="text-red-600">Push notifications not supported</h2>
        <p className="text-red-500">This browser does not support push notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Push Notification Test</h1>
      
      {!user && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-600">Please log in to test subscription functionality</p>
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-600"><strong>Status:</strong></p>
        <p className="mb-2">Supported: {supported ? 'Yes' : 'No'}</p>
        <p className="mb-2">Permission: {permission}</p>
        <p className="mb-2">Subscribed: {subscribed ? 'Yes' : 'No'}</p>
        {message && <p className="mt-2 text-sm {message.includes('success') ? 'text-green-600' : 'text-red-600'}">{message}</p>}
      </div>
      
      <div className="space-y-3">
        {!user ? (
          <div>
            <p className="text-sm text-gray-500">Log in to test subscription functionality</p>
          </div>
        ) : (
          <>
            {permission === 'default' && (
              <button 
                onClick={handleRequestPermission}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Request Permission
              </button>
            )}
            {permission === 'denied' && (
              <div className="text-sm text-red-500">
                Notification permission denied. Please enable in browser settings.
              </div>
            )}
            {permission === 'granted' && !subscribed && (
              <button 
                onClick={handleSubscribe}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Subscribe to Push Notifications
              </button>
            )}
            {permission === 'granted' && subscribed && (
              <button 
                onClick={handleUnsubscribe}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Unsubscribe from Push Notifications
              </button>
            )}
          </>
        )}
        
        <button 
          onClick={handleShowNotification}
          disabled={permission !== 'granted'}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors opacity-70"
        >
          Show Test Notification
        </button>
        
        {user && (
          <button 
            onClick={handleSendTestPush}
            disabled={permission !== 'granted' || !subscribed}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors opacity-70"
          >
            Send Test Push Notification
          </button>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <h2 className="text-lg font-semibold mb-2">How it works:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Request permission to show notifications</li>
          <li>Subscribe to push notifications (requires permission)</li>
          <li>Send test push notifications with all required data (image, description, product name, shop name, subject)</li>
          <li>Notifications appear with the specified data and can be clicked to open the app</li>
        </ul>
      </div>
    </div>
  );
}