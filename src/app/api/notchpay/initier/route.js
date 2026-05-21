import { NextResponse } from 'next/server';

const NOTCHPAY_API = 'https://api.notchpay.co';

export async function POST(req) {
  try {
    const apiKey = process.env.NOTCHPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NOTCHPAY_API_KEY manquant dans .env' }, { status: 500 });
    }

    const { amount, currency, customer, description, reference, callback } = await req.json();

    if (!amount || !customer?.name || !customer?.email || !reference) {
      return NextResponse.json({ error: 'Champs requis: amount, customer.{name,email}, reference' }, { status: 400 });
    }

    const body = { amount, currency: currency || 'XAF', customer, description, reference, callback: callback || 'https://notchpay.co' };

    const response = await fetch(`${NOTCHPAY_API}/payments`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.message || data }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
