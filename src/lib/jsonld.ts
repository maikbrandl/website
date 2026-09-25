// Kleine Bausteine fuer JSON-LD, gemeinsam genutzt von den Lexikon Seiten.

export interface BreadcrumbEintrag {
  name: string;
  url?: string;
}

export function breadcrumbListJsonLd(items: BreadcrumbEintrag[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function collectionPageJsonLd(opts: { name: string; description?: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: opts.url,
  };
}

export function articleJsonLd(opts: {
  headline: string;
  description?: string;
  url: string;
  datumGeprueft?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    ...(opts.description ? { description: opts.description } : {}),
    mainEntityOfPage: opts.url,
    ...(opts.datumGeprueft ? { dateModified: opts.datumGeprueft } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Hybridlog',
    },
  };
}

export function faqPageJsonLd(eintraege: { frage: string; antwort: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: eintraege.map((e) => ({
      '@type': 'Question',
      name: e.frage,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.antwort,
      },
    })),
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hybridlog',
    url: 'https://hybridlog.de',
    logo: 'https://hybridlog.de/images/Logo/Logo.png',
    description: 'Wissensplattform ueber den Menschen',
    founder: { '@type': 'Person', name: 'Maik Brandl' },
    sameAs: ['https://www.instagram.com/hybridlogjournals/'],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hybridlog',
    url: 'https://hybridlog.de/',
    inLanguage: 'de-DE',
  };
}

export function softwareApplicationJsonLd(opts: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: 'de',
    description: opts.description,
    url: opts.url,
  };
}

export function productJsonLd(opts: {
  name: string;
  description: string;
  bild: string;
  amazonUrl: string;
  sku?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    ...(opts.sku ? { sku: opts.sku } : {}),
    image: opts.bild,
    brand: { '@type': 'Brand', name: 'hybridlog' },
    offers: {
      '@type': 'Offer',
      url: opts.amazonUrl,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };
}

