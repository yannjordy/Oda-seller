import { NextResponse } from 'next/server';

const NOTCHPAY_API = 'https://api.notchpay.co';

export async function GET(req, { params }) {
  try {
    const apiKey = process.env.NOTCHPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NOTCHPAY_API_KEY manquant dans .env' }, { status: 500 });
    }

    const { reference } = params;
    if (!reference) return NextResponse.json({ error: 'Reference manquante' }, { status: 400 });

    const response = await fetch(`${NOTCHPAY_API}/payments/${reference}`, {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.message || data }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
