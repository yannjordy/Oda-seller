
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
const uuidv4 = randomUUID;

const PAWAPAY_URL      = 'https://api.sandbox.pawapay.io/v2/deposits'; 
const PAWAPAY_TOKEN    = process.env.PAWAPAY_API_TOKEN;                
const PAWAPAY_PROVIDER = process.env.PAWAPAY_PROVIDER || 'MTN_MOMO_CMR'; 
const PAWAPAY_CURRENCY = process.env.PAWAPAY_CURRENCY || 'XAF';

export async function POST(req) {
  try {
    /* ── 0. Guard : token manquant ── */
    if (!PAWAPAY_TOKEN) {
      console.error('[PawaPay] PAWAPAY_API_TOKEN manquant dans .env.local');
      return NextResponse.json(
        { error: 'Configuration serveur incomplète (token manquant)' },
        { status: 500 }
      );
    }

    /* ── 1. Lire le corps de la requête ── */
    const { amount, phone, planNom, planKey, userId, clientReferenceId } = await req.json();

    /* ── 2. Validation basique ── */
    if (!amount || !phone || !userId) {
      return NextResponse.json(
        { error: 'Champs requis manquants : amount, phone, userId' },
        { status: 400 }
      );
    }

    /* ── 3. Générer un depositId unique (UUIDv4 de 36 chars) ── */
    const depositId = uuidv4();

    /* ── 4. Normaliser customerMessage (regex PawaPay : ^[a-zA-Z0-9 ]+$, 4-22 chars) ── */
    const rawMessage = `Abo ${planNom || planKey || 'Plan'}`;
    const customerMessage = rawMessage
      .normalize('NFD')                     // décompose les accents : é → e + ´
      .replace(/[\u0300-\u036f]/g, '')      // supprime les diacritiques
      .replace(/[^a-zA-Z0-9 ]/g, '')       // supprime tout caractère non autorisé
      .slice(0, 22)                         // max 22 chars
      .padEnd(4, ' ');                      // min 4 chars

    /* ── 5. Construire le payload PawaPay (structure correcte) ── */
    const payload = {
      depositId,
      payer: {
        type: 'MMO',                        // ✅ correct selon la doc PawaPay
        accountDetails: {
          phoneNumber: String(phone),       // ex: 237690000000 (sans +)
          provider:    PAWAPAY_PROVIDER,    // ex: MTN_MOMO_CMR
        },
      },
      amount:            String(amount),    // PawaPay attend une string
      currency:          PAWAPAY_CURRENCY,
      clientReferenceId: clientReferenceId || `ODA-${userId}-${Date.now()}`,
      customerMessage,
      metadata: [
        { orderId: `ODA-${planKey}-${Date.now()}` },
        { userId,  isPII: true },
      ],
    };

    /* ── 6. Appel PawaPay ── */
    const pawapayRes = await fetch(PAWAPAY_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${PAWAPAY_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await pawapayRes.json();

    /* ── 7. Vérifier le statut HTTP ── */
    if (!pawapayRes.ok) {
      console.error('[PawaPay] Erreur HTTP', pawapayRes.status, data);
      return NextResponse.json(
        { error: data?.message || `Erreur serveur PawaPay (${pawapayRes.status})` },
        { status: pawapayRes.status }
      );
    }

    /* ── 8. Vérifier le statut métier ── */
    if (data.status === 'REJECTED') {
      return NextResponse.json(
        { error: `Dépôt rejeté : ${data.failureReason?.message || 'raison inconnue'}` },
        { status: 422 }
      );
    }

    if (data.status === 'DUPLICATE_IGNORED') {
      return NextResponse.json(
        { error: 'Dépôt ignoré (doublon) : depositId déjà utilisé' },
        { status: 409 }
      );
    }

    /* ACCEPTED → retourner le depositId (fallback sur local si absent) */
    return NextResponse.json({
      depositId: data.depositId ?? depositId,   // ✅ fallback sécurisé
      status:    data.status,                   // 'ACCEPTED'
    });

  } catch (err) {
    console.error('[PawaPay] Exception:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}