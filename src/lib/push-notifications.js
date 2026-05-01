'use client';

/**
 * Utility for handling push notifications in the OdaMarket PWA
 */

// VAPID public key - in production, this should come from environment variables
// For now, we'll use a placeholder that should be replaced with actual VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BN0sqR-qEWLD7c4sP3zGz7JY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6vY6';

/**
 * Request permission for notifications from the user
 * @returns {Promise<NotificationPermission>} The permission status
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  const permission = Notification.permission;
  if (permission === 'granted') {
    return permission;
  }

  if (permission === 'denied') {
    console.warn('Notification permission was previously denied');
    return permission;
  }

  try {
    const permissionResult = await Notification.requestPermission();
    return permissionResult;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Check if the current browser supports push notifications
 * @returns {boolean} True if push notifications are supported
 */
export function isPushSupported() {
  return ('serviceWorker' in navigator) && 
         ('PushManager' in window) && 
         ('Notification' in window);
}

/**
 * Subscribe the current user to push notifications
 * @returns {Promise<Object>} The subscription object or null if failed
 */
export async function subscribeToPushNotifications() {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>} True if unsubscribed successfully
 */
export async function unsubscribeFromPushNotifications() {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Convert a base64 string to a Uint8Array (used for VAPID keys)
 * @param {string} base64String - The base64 encoded string
 * @returns {Uint8Array} The converted array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Send a push notification to the user (this would typically be called from your backend)
 * This is a helper for testing - in production, you'd send this from your server
 * @param {Object} notificationData - The notification data to send
 */
export async function sendTestNotification(notificationData) {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.warn('No push subscription found');
      return false;
    }

    // In a real app, you would send this to your backend which would then
    // use a web push library to send the notification to the user's device
    // For demonstration, we're showing how the data would be structured
    
    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
      }
    };

    console.log('Would send to backend for push notification:', {
      subscription: payload,
      notification: notificationData
    });

    // For immediate testing, we can also trigger a notification directly
    // Note: This only works if we have a service worker that can handle push events
    // and we're simulating a push message
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Show a notification directly (without going through push service)
 * Useful for in-app notifications
 * @param {Object} options - Notification options
 */
export function showNotification(options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Cannot show notification: permission not granted or not supported');
    return false;
  }

  const defaultOptions = {
    title: 'OdaMarket',
    body: 'Vous avez une nouvelle notification',
    icon: '/icons/oda-192.png',
    badge: '/icons/oda-192.png',
    vibrate: [200, 100, 200],
    tag: 'oda-market-notification',
    renotify: true
  };

  const notificationOptions = { ...defaultOptions, ...options };
  
  try {
    new Notification(notificationOptions.title, notificationOptions);
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

export default {
  requestNotificationPermission,
  isPushSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestNotification,
  showNotification
};