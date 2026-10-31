export const site = {
  name: 'Triton Piscinas',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://tritonpiscinas.com.br').replace(/\/$/, ''),
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || '5521991215101').replace(/\D/g, ''),
  phone: '(21) 99121-5101',
  address: 'Rua Manoel Rodrigues, 1020 — Saquarema, RJ',
  mapsUrl: 'https://maps.google.com/?q=Rua+Manoel+Rodrigues+1020+Saquarema',
  hours: { days: 'Terça a sábado', opens: '9h', closes: '18h', closed: 'Segunda-feira' },
};

export function media(path) {
  if (!path) return '/placeholder.svg';
  return `${(process.env.NEXT_PUBLIC_ASSET_BASE_URL || '').replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function whatsappUrl(message = 'Olá, Triton! Gostaria de conversar sobre meu projeto.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function quoteMessage(product, variation) {
  return [
    'Olá, Triton! Gostaria de solicitar um orçamento.',
    `Produto: ${product.nome}`,
    `Referência: ${product.id}`,
    variation
      ? `Configuração: ${variation.atributos.map((a) => `${a.nome}: ${a.valores.join(', ')}`).join(' / ')}`
      : null,
    variation?.sku ? `SKU: ${variation.sku}` : null,
    `${site.url}/produtos/${product.slug}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export const categories = [
  { slug: 'piscinas', name: 'Piscinas', detail: 'Filtros & motobombas', icon: 'waves' },
  { slug: 'spas', name: 'Spas', detail: 'Seu momento de pausa', icon: 'sparkles' },
  {
    slug: 'banheiras',
    name: 'Banheiras & ofurôs',
    detail: 'Conforto em cada detalhe',
    icon: 'bath',
  },
  { slug: 'saunas', name: 'Saunas', detail: 'Bem-estar por inteiro', icon: 'wind' },
  { slug: 'aquecimento', name: 'Aquecimento', detail: 'A temperatura ideal', icon: 'sun' },
  { slug: 'acessorios', name: 'Acessórios', detail: 'Tudo se completa', icon: 'droplets' },
];
