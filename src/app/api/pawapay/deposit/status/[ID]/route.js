import { NextResponse } from 'next/server';

const PAWAPAY_TOKEN = process.env.PAWAPAY_API_TOKEN;

export async function GET(req, { params }) {
  const { id } = params;

  if (!PAWAPAY_TOKEN) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 500 });
  }

  const res = await fetch(`https://api.sandbox.pawapay.io/v2/deposits/${id}`, {
    headers: { 'Authorization': `Bearer ${PAWAPAY_TOKEN}` },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data?.message || 'Erreur PawaPay' }, { status: res.status });
  }

  // PawaPay renvoie un tableau, on prend le premier élément
  const deposit = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({
    status:        deposit.status,
    depositId:     deposit.depositId,
    failureReason: deposit.failureReason ?? null,
  });
}