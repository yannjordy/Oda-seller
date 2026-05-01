import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { endpoint, keys, userId } = await request.json();

    if (!endpoint || !keys || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, keys, userId' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check if subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', endpoint)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is OK
      console.error('Error checking existing subscription:', checkError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          keys: JSON.stringify(keys),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Subscription updated successfully',
        subscriptionId: existingSubscription.id 
      });
    } else {
      // Create new subscription
      const { data: newSubscription, error: insertError } = await supabase
        .from('push_subscriptions')
        .insert([
          {
            endpoint,
            keys: JSON.stringify(keys),
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Subscription created successfully',
        subscriptionId: newSubscription.id 
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in notification subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}