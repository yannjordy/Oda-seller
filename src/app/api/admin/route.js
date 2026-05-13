import { NextResponse } from 'next/server';
import { getAdminClient, verifierAdmin } from '@/lib/admin';

const TABLE_MAP = {
  users: 'auth.users',
  produits: 'produits',
  services: 'services',
  commandes: 'commandes',
  clients: 'clients',
  boosts: 'boosts',
  signalements: 'signalements',
  abonnements: 'abonnements',
  conversations: 'conversations',
  visiteurs: 'visiteurs',
};

export async function GET(req) {
  try {
    const adminId = req.headers.get('x-admin-id');
    const role = await verifierAdmin(adminId);
    if (!role) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const admin = getAdminClient();

    if (action === 'stats') {
      const [produits, services, users, commandes, signalements, boosts] = await Promise.all([
        admin.from('produits').select('id,statut', { count: 'exact', head: false }),
        admin.from('services').select('id,statut', { count: 'exact', head: false }),
        admin.rpc('get_users_count'),
        admin.from('commandes').select('id,montant_total,statut', { count: 'exact', head: false }),
        admin.from('signalements').select('id,statut', { count: 'exact', head: false }),
        admin.from('boosts').select('id,total_a_payer,statut', { count: 'exact', head: false }),
      ]);

      const [caGLOBAL, caMOIS] = await Promise.all([
        admin.from('commandes').select('montant_total'),
        admin.from('commandes').select('montant_total').gte('created_at', new Date(Date.now() - 30*86400000).toISOString()),
      ]);

      const ca = caGLOBAL.data?.reduce((s, c) => s + Number(c.montant_total||0), 0) || 0;
      const caMois = caMOIS.data?.reduce((s, c) => s + Number(c.montant_total||0), 0) || 0;
      const totalProduits = produits.count || produits.data?.length || 0;
      const prodPublies = produits.data?.filter(p => p.statut === 'published').length || 0;
      const totalServices = services.count || services.data?.length || 0;
      const servActifs = services.data?.filter(s => s.statut === 'actif').length || 0;
      const totalCommandes = commandes.count || commandes.data?.length || 0;
      const signalementsAttente = signalements.data?.filter(s => s.statut === 'en_attente').length || 0;
      const totalBoosts = boosts.count || boosts.data?.length || 0;
      const boostsPayes = boosts.data?.filter(b => b.statut !== 'en_attente_paiement').length || 0;

      return NextResponse.json({
        users: users.data || 0,
        produits: { total: totalProduits, publies: prodPublies },
        services: { total: totalServices, actifs: servActifs },
        commandes: { total: totalCommandes, ca, caMois },
        signalements: signalementsAttente,
        boosts: { total: totalBoosts, payes: boostsPayes },
      });
    }

    if (action === 'users') {
      const page = parseInt(searchParams.get('page')||'1');
      const limit = 20;
      const offset = (page-1)*limit;
      const fromAuth = await admin.auth.admin.listUsers({ page, perPage: limit });
      const users = fromAuth.data?.users || [];
      const total = fromAuth.data?.total || 0;

      const userIds = users.map(u => u.id);
      const { data: abos } = await admin.from('abonnements').select('user_id,plan,statut').in('user_id', userIds);
      const { data: roles } = await admin.from('admin_roles').select('user_id,role').in('user_id', userIds);
      const { data: counts } = await admin.from('produits').select('user_id,id').in('user_id', userIds);

      const aboMap = Object.fromEntries((abos||[]).map(a => [a.user_id, a]));
      const roleMap = Object.fromEntries((roles||[]).map(r => [r.user_id, r]));
      const prodCounts = {};
      (counts||[]).forEach(p => { prodCounts[p.user_id] = (prodCounts[p.user_id]||0)+1; });

      const enriched = users.map(u => ({
        id: u.id,
        email: u.email,
        nom: u.user_metadata?.display_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Inconnu',
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        photo: u.user_metadata?.avatar_url || null,
        abonnement: aboMap[u.id]?.plan || 'gratuit',
        abonnementStatut: aboMap[u.id]?.statut || 'inactif',
        role: roleMap[u.id]?.role || null,
        produitsCount: prodCounts[u.id] || 0,
        banned: u.banned_until ? true : false,
      }));

      return NextResponse.json({ users: enriched, total, page, totalPages: Math.ceil(total/limit) });
    }

    if (action === 'produits') {
      const page = parseInt(searchParams.get('page')||'1');
      const limit = 20;
      const offset = (page-1)*limit;
      const { data, count } = await admin.from('produits')
        .select('id,user_id,nom,prix,stock,categorie,statut,created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset+limit-1);
      return NextResponse.json({ produits: data||[], total: count, page });
    }

    if (action === 'services') {
      const page = parseInt(searchParams.get('page')||'1');
      const limit = 20;
      const offset = (page-1)*limit;
      const { data, count } = await admin.from('services')
        .select('id,user_id,nom,prix,lieu,statut,created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset+limit-1);
      return NextResponse.json({ services: data||[], total: count, page });
    }

    if (action === 'signalements') {
      const page = parseInt(searchParams.get('page')||'1');
      const limit = 20;
      const offset = (page-1)*limit;
      const { data, count } = await admin.from('signalements')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset+limit-1);
      return NextResponse.json({ signalements: data||[], total: count, page });
    }

    if (action === 'visiteurs') {
      const periode = searchParams.get('periode') || '7d';
      const jours = periode === '30d' ? 30 : periode === '90d' ? 90 : 7;
      const since = new Date(Date.now() - jours*86400000).toISOString();
      const { data } = await admin.from('visiteurs')
        .select('id,user_id,timestamp,page')
        .gte('timestamp', since)
        .order('timestamp', { ascending: false });
      const total = data?.length || 0;
      const joursData = {};
      for (let i = 0; i < jours; i++) {
        const d = new Date(Date.now() - i*86400000).toISOString().split('T')[0];
        joursData[d] = 0;
      }
      (data||[]).forEach(v => {
        const d = v.timestamp?.split('T')[0];
        if (joursData[d] !== undefined) joursData[d]++;
      });
      const visitsParJour = Object.entries(joursData).sort().map(([date, count]) => ({ date, count }));
      const pages = {};
      (data||[]).forEach(v => { pages[v.page] = (pages[v.page]||0)+1; });
      const topPages = Object.entries(pages).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([page, count]) => ({ page, count }));
      return NextResponse.json({ total, visitsParJour, topPages, periode });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const adminId = req.headers.get('x-admin-id');
    const role = await verifierAdmin(adminId);
    if (!role) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const body = await req.json();
    const { action } = body;
    const admin = getAdminClient();

    if (action === 'block_user') {
      const { userId } = body;
      if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
      await admin.auth.admin.updateUserById(userId, { ban_duration: '730d' });
      await logAction(admin, adminId, 'block_user', 'utilisateur', userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'unblock_user') {
      const { userId } = body;
      if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
      await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      await logAction(admin, adminId, 'unblock_user', 'utilisateur', userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_user') {
      const { userId } = body;
      if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
      await admin.auth.admin.deleteUser(userId);
      await logAction(admin, adminId, 'delete_user', 'utilisateur', userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'set_admin') {
      const { userId, newRole } = body;
      if (!userId || !newRole) return NextResponse.json({ error: 'userId et role requis' }, { status: 400 });
      await admin.from('admin_roles').upsert(
        { user_id: userId, role: newRole, created_by: adminId },
        { onConflict: 'user_id' }
      );
      await logAction(admin, adminId, 'set_admin', 'admin_roles', userId, { role: newRole });
      return NextResponse.json({ success: true });
    }

    if (action === 'remove_admin') {
      const { userId } = body;
      if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
      await admin.from('admin_roles').delete().eq('user_id', userId);
      await logAction(admin, adminId, 'remove_admin', 'admin_roles', userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_produit') {
      const { produitId } = body;
      if (!produitId) return NextResponse.json({ error: 'produitId requis' }, { status: 400 });
      await admin.from('produits').delete().eq('id', produitId);
      await logAction(admin, adminId, 'delete_produit', 'produit', produitId);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_service') {
      const { serviceId } = body;
      if (!serviceId) return NextResponse.json({ error: 'serviceId requis' }, { status: 400 });
      await admin.from('services').delete().eq('id', serviceId);
      await logAction(admin, adminId, 'delete_service', 'service', serviceId);
      return NextResponse.json({ success: true });
    }

    if (action === 'traiter_signalement') {
      const { signalementId, statut, actionPrise } = body;
      if (!signalementId || !statut) return NextResponse.json({ error: 'signalementId et statut requis' }, { status: 400 });
      await admin.from('signalements').update({
        statut,
        traite_par: adminId,
        traite_le: new Date().toISOString(),
        action_prise: actionPrise || '',
      }).eq('id', signalementId);
      await logAction(admin, adminId, 'traiter_signalement', 'signalement', signalementId, { statut, actionPrise });
      return NextResponse.json({ success: true });
    }

    if (action === 'update_abonnement') {
      const { userId, plan, limiteProduits } = body;
      if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
      await admin.from('abonnements').upsert(
        { user_id: userId, plan: plan || 'gratuit', limite_produits: limiteProduits || 10, statut: 'actif' },
        { onConflict: 'user_id' }
      );
      await logAction(admin, adminId, 'update_abonnement', 'utilisateur', userId, { plan, limiteProduits });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function logAction(admin, adminId, action, targetType, targetId, details = {}) {
  try {
    await admin.from('admin_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch (e) {
    console.error('Log error:', e);
  }
}
