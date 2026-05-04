import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await supabase
    .from('parametres_boutique')
    .select('config')
    .eq('config->identifiant->>slug', slug)
    .single();

  const config = data?.config || {};
  const nom = config.general?.nom || 'OdaMarket Boutique';
  const description = config.general?.description || 'Découvrez cette boutique sur OdaMarket';
  const favicon = config.apparence?.favicon || '';
  const logo = config.apparence?.logo || '';
  const imageUrl = favicon || logo || '';

  const shopUrl = `/dashboard/boutique?shop=${slug}`;

  const metadata = {
    title: `${nom} - Boutique en ligne`,
    description,
    openGraph: {
      title: nom,
      description,
      url: shopUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: nom,
      description,
    },
  };

  if (imageUrl) {
    metadata.openGraph.images = [{ url: imageUrl, width: 512, height: 512 }];
    metadata.twitter.images = [imageUrl];
  }

  return metadata;
}

export default async function ShareRedirectPage({ params }) {
  const { slug } = await params;
  redirect(`/dashboard/boutique?shop=${slug}`);
}
