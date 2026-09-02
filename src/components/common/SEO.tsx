import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TOOL_GUIDES } from '@/config/toolGuides';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  faqList?: { q: string; a: string }[];
  steps?: { title: string; description: string }[];
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'LitasDark - Free, Private In-Browser PDF Suite & Dark Mode Inverter',
  description:
    'Free client-side PDF suite: Dark Mode Inverter, Merge, Split, Rotate, Compress, Extract, Clean Metadata, and Images to PDF. Zero server uploads.',
  keywords:
    'pdf tools, dark mode pdf, merge pdf, split pdf, rotate pdf, compress pdf, extract pdf pages, clean pdf metadata, images to pdf, private pdf tools, webassembly pdf',
};

const STATIC_ROUTE_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  '/': {
    title: 'LitasDark - Free In-Browser PDF Tools | Zero Server Uploads',
    description:
      'Free, privacy-focused PDF tools running 100% locally in your browser memory via WebAssembly. Dark Mode Inverter, Merge, Split, Rotate, Compress, Extract, and Metadata Cleaner.',
    keywords:
      'pdf tools, free pdf editor, dark mode pdf, merge pdf online, split pdf free, rotate pdf, compress pdf locally, sanitize pdf metadata, images to pdf, client side pdf',
  },
  '/tools': {
    title: 'All PDF Tools - Free, Private In-Browser Utilities | LitasDark',
    description:
      'Browse our complete suite of free in-browser PDF utilities: Dark Mode Converter, Merge, Split, Rotate, Compress, Extract Pages, Clean Metadata, and Images to PDF.',
    keywords:
      'pdf tools list, free pdf utilities, online pdf tools no upload, client side pdf tools, all pdf editors',
  },
  '/privacy-architecture': {
    title: 'Technical & Privacy Architecture Whitepaper | LitasDark',
    description:
      'Learn how LitasDark processes documents entirely within volatile client-side browser RAM via WebAssembly and Web Workers with zero cloud transmission.',
    keywords:
      'pdf technical architecture, client side pdf security, zero upload architecture, in browser pdf processing, webassembly document privacy',
  },
  '/privacy': {
    title: 'Privacy Policy | LitasDark',
    description:
      'Read our transparent Privacy Policy. LitasDark is an in-browser utility that does not collect, transmit, or store your document files or personal data.',
    keywords: 'litasdark privacy policy, zero data retention, client side document privacy',
  },
  '/terms': {
    title: 'Terms of Service | LitasDark',
    description:
      'Terms of Service and legal disclosures for using LitasDark in-browser client-side PDF manipulation tools.',
    keywords: 'litasdark terms of service, legal terms, software disclaimers',
  },
  '/explore': {
    title: 'Interactive PDF Tools Gallery | LitasDark',
    description:
      'Explore the full suite of client-side PDF manipulation tools with interactive visual previews and instant local processing.',
    keywords: 'interactive pdf tools, litasdark gallery, visual pdf suite',
  },
};

export function SEO({
  title,
  description,
  keywords,
  canonicalPath,
  faqList,
  steps,
  noindex = false,
}: SEOProps) {
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, '') || '/';

  // Check tool guides first
  const cleanSlug = path.replace(/^\//, '');
  const toolGuide = TOOL_GUIDES[cleanSlug];

  let calculatedTitle = title;
  let calculatedDesc = description;
  let calculatedKeywords = keywords;

  if (toolGuide && !title) {
    calculatedTitle = toolGuide.title;
    calculatedDesc = toolGuide.metaDescription;
    calculatedKeywords = toolGuide.metaKeywords;
  } else if (!calculatedTitle && STATIC_ROUTE_SEO[path]) {
    calculatedTitle = STATIC_ROUTE_SEO[path].title;
    calculatedDesc = STATIC_ROUTE_SEO[path].description;
    calculatedKeywords = STATIC_ROUTE_SEO[path].keywords;
  }

  const finalTitle = calculatedTitle || DEFAULT_SEO.title;
  const finalDescription = calculatedDesc || DEFAULT_SEO.description;
  const finalKeywords = calculatedKeywords || DEFAULT_SEO.keywords;
  const finalCanonicalPath = canonicalPath || path;
  const finalCanonical = `https://litasdark.vercel.app${finalCanonicalPath === '/' ? '' : finalCanonicalPath}`;

  const activeFaqs = faqList || toolGuide?.faqs;
  const activeSteps = steps || toolGuide?.steps;

  useEffect(() => {
    // 1. Document Title
    document.title = finalTitle;

    // 2. Meta Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute(
      'content',
      noindex ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );

    // 3. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDescription);

    // 4. Meta Keywords
    let metaKw = document.querySelector('meta[name="keywords"]');
    if (!metaKw) {
      metaKw = document.createElement('meta');
      metaKw.setAttribute('name', 'keywords');
      document.head.appendChild(metaKw);
    }
    metaKw.setAttribute('content', finalKeywords);

    // 5. Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', finalCanonical);

    // 6. OpenGraph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDescription);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', finalCanonical);

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', 'https://litasdark.vercel.app/og-image.jpg?v=2');

    let ogImageSecure = document.querySelector('meta[property="og:image:secure_url"]');
    if (!ogImageSecure) {
      ogImageSecure = document.createElement('meta');
      ogImageSecure.setAttribute('property', 'og:image:secure_url');
      document.head.appendChild(ogImageSecure);
    }
    ogImageSecure.setAttribute('content', 'https://litasdark.vercel.app/og-image.jpg?v=2');

    // 7. Twitter
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', finalTitle);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', finalDescription);

    let twImage = document.querySelector('meta[name="twitter:image"]');
    if (!twImage) {
      twImage = document.createElement('meta');
      twImage.setAttribute('name', 'twitter:image');
      document.head.appendChild(twImage);
    }
    twImage.setAttribute('content', 'https://litasdark.vercel.app/og-image.jpg?v=2');

    // 8. Inject Page-Specific Structured Data Graph (JSON-LD)
    const schemaId = 'litasdark-json-ld';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const graphItems: any[] = [
      {
        '@type': 'WebSite',
        '@id': 'https://litasdark.vercel.app/#website',
        url: 'https://litasdark.vercel.app',
        name: 'LitasDark',
        description: 'Free, private in-browser PDF suite with zero server uploads.',
      },
      {
        '@type': 'Organization',
        '@id': 'https://litasdark.vercel.app/#organization',
        name: 'LitasDark',
        url: 'https://litasdark.vercel.app',
        slogan: 'In-Browser PDF Suite with Zero Server Uploads',
      },
    ];

    if (path === '/') {
      graphItems.push({
        '@type': 'WebApplication',
        '@id': 'https://litasdark.vercel.app/#webapp',
        name: 'LitasDark PDF Suite',
        url: 'https://litasdark.vercel.app/',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web, Windows, macOS, Linux, iOS, Android)',
        browserRequirements: 'Requires JavaScript and WebAssembly support',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        description:
          'Free, 100% private in-browser PDF tools: Dark Mode PDF inverter, Cleanse Metadata, Images to PDF, Merge, Split, Rotate, Compress, and Extract without uploading files to any server.',
        featureList: [
          'Smart Dark Mode Inversion for Eye Strain Relief',
          'Local Forensic Metadata Sanitizer and Cleaner',
          'Lossless In-Browser Image to PDF Compiler',
          'Fast WebAssembly-Powered PDF Merge',
          'Granular PDF Page Splitting',
          'Multi-angle PDF Page Rotation',
          'PDF Structure Compression',
          'Selective Page Extraction',
          '100% Client-Side Privacy with Zero Server Uploads',
        ],
        provider: {
          '@type': 'Organization',
          '@id': 'https://litasdark.vercel.app/#organization',
        },
      });
    }

    if (toolGuide) {
      graphItems.push({
        '@type': 'WebApplication',
        '@id': `https://litasdark.vercel.app/${toolGuide.slug}#webapp`,
        name: toolGuide.h1,
        url: `https://litasdark.vercel.app/${toolGuide.slug}`,
        description: toolGuide.metaDescription,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any modern web browser with WebAssembly support',
        browserRequirements: 'Requires HTML5, Web Workers, and WebAssembly',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: toolGuide.features.map((f) => f.title),
        provider: {
          '@type': 'Organization',
          name: 'LitasDark',
          url: 'https://litasdark.vercel.app',
        },
      });

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://litasdark.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tools',
            item: 'https://litasdark.vercel.app/tools',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: toolGuide.h1,
            item: `https://litasdark.vercel.app/${toolGuide.slug}`,
          },
        ],
      });
    }

    if (activeFaqs && activeFaqs.length > 0) {
      graphItems.push({
        '@type': 'FAQPage',
        '@id': `${finalCanonical}#faq`,
        mainEntity: activeFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      });
    }

    if (activeSteps && activeSteps.length > 0 && toolGuide) {
      graphItems.push({
        '@type': 'HowTo',
        '@id': `${finalCanonical}#howto`,
        name: `How to use ${toolGuide.h1}`,
        description: toolGuide.subtitle,
        totalTime: 'PT1M',
        step: activeSteps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.title,
          text: step.description,
        })),
      });
    }

    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graphItems,
    });
  }, [finalTitle, finalDescription, finalKeywords, finalCanonical, activeFaqs, activeSteps, noindex, toolGuide, path]);

  return null;
}
export default SEO;
