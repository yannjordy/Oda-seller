import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import webpush from 'web-push';

// VAPID keys should be stored in environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Configure webpush with VAPID keys
webpush.setVapidDetails(
  'mailto:info@odamarket.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request) {
  try {
    // Check if VAPID keys are configured
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.error('VAPID keys not configured');
      return NextResponse.json(
        { error: 'Push notification service not properly configured' },
        { status: 500 }
      );
    }

    const { userId, notificationData } = await request.json();

    if (!userId || !notificationData) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, notificationData' },
        { status: 400 }
      );
    }

    // Validate notification data has required fields
    const requiredFields = ['title', 'body', 'image', 'productName', 'shopName', 'subject'];
    for (const field of requiredFields) {
      if (!notificationData[field]) {
        return NextResponse.json(
          { error: `Missing required notification field: ${field}` },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabase();

    // Get subscription for the user
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subscriptionError) {
      console.error('Error fetching subscriptions:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found for user' },
        { status: 404 }
      );
    }

    // Send notification to each subscription
    const results = [];
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: JSON.parse(subscription.keys)
        };

        // Prepare notification payload with all required data
        const payload = JSON.stringify({
          title: notificationData.title,
          body: notificationData.body,
          icon: notificationData.image || '/icons/oda-192.png',
          badge: notificationData.image || '/icons/oda-192.png',
          image: notificationData.image, // For notification image
          data: {
            url: notificationData.url || '/',
            productName: notificationData.productName,
            shopName: notificationData.shopName,
            subject: notificationData.subject,
            timestamp: new Date().toISOString()
          },
          actions: [
            {
              action: 'open',
              title: 'Voir les détails'
            },
            {
              action: 'close',
              title: 'Fermer'
            }
          ],
          vibrate: [200, 100, 200],
          tag: notificationData.subject || 'oda-market-notification',
          renotify: true
        });

        // Send the push notification
        const result = await webpush.sendNotification(
          pushSubscription,
          payload
        );

        results.push({
          subscriptionId: subscription.id,
          success: true,
          statusCode: result.statusCode
        });

      } catch (error) {
        console.error('Error sending push notification:', error);
        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: error.message
        });
      }
    }

    // Check if all notifications failed
    const failedNotifications = results.filter(r => !r.success);
    if (failedNotifications.length === results.length) {
      return NextResponse.json(
        { 
          error: 'Failed to send push notifications',
          details: failedNotifications
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Push notifications sent successfully',
      results: results
    });

  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}