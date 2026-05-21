import { NextResponse } from 'next/server';

const NOTCHPAY_API = 'https://api.notchpay.co';

export async function POST(req) {
  try {
    const apiKey = process.env.NOTCHPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NOTCHPAY_API_KEY manquant dans .env' }, { status: 500 });
    }

    const { reference, channel, phone } = await req.json();

    if (!reference || !channel || !phone) {
      return NextResponse.json({ error: 'Champs requis: reference, channel, phone' }, { status: 400 });
    }

    const response = await fetch(`${NOTCHPAY_API}/payments/${reference}`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ channel, data: { phone } }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.message || data }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
