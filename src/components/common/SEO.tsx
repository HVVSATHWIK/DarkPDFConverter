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
    title: 'LitasDark - Free In-Browser PDF Suite | Zero Server Uploads',
    description:
      'Free, privacy-focused PDF tools running locally in your browser memory via WebAssembly: Dark Mode Inverter, Merge, Split, Rotate, Compress, and Metadata Cleaner.',
    keywords:
      'pdf tools, free pdf editor, dark mode pdf, merge pdf online, split pdf free, rotate pdf, compress pdf locally, sanitize pdf metadata, images to pdf, client side pdf',
  },
  '/tools': {
    title: 'All PDF Tools - Free, Private In-Browser Suite | LitasDark',
    description:
      'Browse our complete suite of free in-browser PDF utilities: Dark Mode Converter, Merge, Split, Rotate, Compress, Extract Pages, Clean Metadata, and Images to PDF.',
    keywords:
      'pdf tools list, free pdf utilities, online pdf tools no upload, client side pdf tools, all pdf editors',
  },
  '/explore': {
    title: 'Interactive PDF Tools Gallery & 3D Lab | LitasDark',
    description:
      'Explore the full suite of client-side PDF manipulation tools with interactive visual previews, 3D controls, and fast local processing.',
    keywords: 'interactive pdf tools, litasdark gallery, visual pdf suite, browser pdf utilities',
  },
  // Tool Workspaces
  '/dark-mode-pdf': {
    title: 'Dark Mode PDF Converter - Invert PDF Colors Free | LitasDark',
    description:
      'Invert bright PDF backgrounds into dark mode, OLED black, or warm sepia reading themes. Read comfortably with zero eye strain and zero server uploads.',
    keywords:
      'dark mode pdf, invert pdf colors, pdf dark theme, night reading pdf, oled black pdf, sepia pdf, free pdf reader dark mode, client side pdf inverter',
  },
  '/merge-pdf': {
    title: 'Merge PDF Online - Combine Multiple PDF Files Free | LitasDark',
    description:
      'Combine multiple PDF documents into a single file in seconds. Reorder files, preserve sharp vector quality, and merge safely with zero server uploads.',
    keywords:
      'merge pdf online, combine pdf files, join pdf documents, merge multiple pdfs free, client side pdf merge, webassembly pdf merger, no upload pdf merger',
  },
  '/split-pdf': {
    title: 'Split PDF Online - Separate PDF Page Ranges Free | LitasDark',
    description:
      'Split large PDF documents and extract continuous page ranges directly in your browser. Fast, free, and completely private with zero server uploads.',
    keywords:
      'split pdf online, separate pdf pages, extract page range from pdf, divide pdf into smaller files, cut pdf pages free, in browser pdf splitter',
  },
  '/rotate-pdf': {
    title: 'Rotate PDF Online - Rotate PDF Pages 90, 180, 270 | LitasDark',
    description:
      'Permanently rotate PDF pages 90°, 180°, or 270° in your browser. Fix sideways or upside-down scans instantly with zero quality loss and no server uploads.',
    keywords:
      'rotate pdf online, flip pdf orientation, turn pdf pages 90 degrees, permanent pdf rotation, fix upside down pdf, free pdf rotator no upload',
  },
  '/compress-pdf': {
    title: 'Compress PDF Online - Reduce PDF File Size Free | LitasDark',
    description:
      'Compress and optimize PDF file sizes directly in browser memory. Strip redundant objects and deflate streams with zero quality loss and no cloud uploads.',
    keywords:
      'compress pdf online, reduce pdf file size, shrink pdf free, pdf optimizer in browser, lossy and lossless pdf compression, private pdf compressor',
  },
  '/extract-pdf': {
    title: 'Extract PDF Pages Online - Pull Specific Pages Free | LitasDark',
    description:
      'Extract specific, non-consecutive pages or custom page selections from any PDF into a new standalone document. Fast, private local WebAssembly processing.',
    keywords:
      'extract pdf pages, pull specific pages from pdf, save individual pdf pages, cherry pick pdf pages, export pdf pages free, private pdf extractor',
  },
  '/cleanse-metadata': {
    title: 'Clean PDF Metadata Online - Strip Author & Tags | LitasDark',
    description:
      'Strip hidden author names, software creator tags, editing timestamps, and revision histories from PDF files. Sanitize documents locally with zero uploads.',
    keywords:
      'clean pdf metadata, scrub pdf metadata, remove author from pdf, sanitize pdf document, strip pdf properties, pdf privacy cleaner, wipe pdf tags',
  },
  '/images-to-pdf': {
    title: 'Images to PDF Converter - Convert PNG & JPG to PDF | LitasDark',
    description:
      'Convert JPG, PNG, and WebP images into clean, high-resolution PDF documents. Customize page sizes, margins, and layout with zero server uploads.',
    keywords:
      'images to pdf, jpg to pdf, png to pdf converter, combine photos to pdf, webp to pdf online, create pdf from images free, local image to pdf',
  },
  // Dedicated Tool Guides & Tutorials
  '/dark-mode-pdf/guide': {
    title: 'How to Invert PDF to Dark Mode - Complete Guide | LitasDark',
    description:
      'Learn how to convert bright white PDFs into dark mode, OLED black, and sepia themes. Step-by-step guide with contrast tips and technical canvas specs.',
    keywords:
      'how to dark mode pdf, guide invert pdf colors, pdf reading contrast guide, night mode pdf tutorial, oled dark pdf instructions, pdf eye strain relief',
  },
  '/merge-pdf/guide': {
    title: 'How to Merge PDF Files Online - Step-by-Step Guide | LitasDark',
    description:
      'Master merging multiple PDF documents into a unified file. Learn about file ordering, vector preservation, and client-side WebAssembly processing.',
    keywords:
      'how to merge pdfs, combine pdf files tutorial, step by step pdf merge guide, join pdf documents instructions, webassembly pdf merge explained',
  },
  '/split-pdf/guide': {
    title: 'How to Split PDF Pages Online - Step-by-Step Guide | LitasDark',
    description:
      'Complete tutorial on splitting PDF files and isolating continuous page ranges. Learn when to use Split vs Extract with practical step-by-step examples.',
    keywords:
      'how to split pdf, divide pdf guide, separate pdf pages tutorial, split vs extract pdf, extract page range instructions, cut pdf document guide',
  },
  '/rotate-pdf/guide': {
    title: 'How to Rotate PDF Pages Permanently - User Guide | LitasDark',
    description:
      'Learn how to permanently rotate individual or all PDF pages by 90°, 180°, or 270°. Discover how orientation dictionary flags preserve 100% quality.',
    keywords:
      'how to rotate pdf, permanent pdf rotation guide, fix sideways pdf tutorial, rotate pdf pages 90 degrees instructions, pdf rotate dictionary attribute',
  },
  '/compress-pdf/guide': {
    title: 'How to Compress PDF Documents - Optimization Guide | LitasDark',
    description:
      'Explore PDF optimization strategies: Flate stream deflation, image downsampling, and object deduplication. Shrink file sizes while preserving text quality.',
    keywords:
      'how to compress pdf, pdf optimization guide, reduce pdf size tutorial, flate compression pdf, image downsampling in pdf, pdf size safety guard',
  },
  '/extract-pdf/guide': {
    title: 'How to Extract Specific PDF Pages - Complete Guide | LitasDark',
    description:
      'Learn how to cherry-pick and extract non-consecutive pages from multi-page PDFs. Step-by-step instructions for creating focused excerpt documents.',
    keywords:
      'how to extract pdf pages, cherry pick pdf pages tutorial, extract non consecutive pages guide, pull specific pages from pdf, export pdf pages guide',
  },
  '/cleanse-metadata/guide': {
    title: 'How to Remove PDF Metadata & Author Tags - Guide | LitasDark',
    description:
      'Comprehensive guide to sanitizing PDF metadata: wipe author names, software fingerprints, and edit timestamps before sharing sensitive documents.',
    keywords:
      'how to remove pdf metadata, sanitize pdf guide, scrub author tags tutorial, wipe pdf creation date, inspect pdf metadata properties, pdf redaction vs metadata',
  },
  '/images-to-pdf/guide': {
    title: 'How to Convert Images to PDF Online - User Guide | LitasDark',
    description:
      'Step-by-step tutorial on compiling JPG, PNG, and WebP photos into structured PDFs. Configure fit options, page margins, and maintain native resolution.',
    keywords:
      'how to convert images to pdf, jpg to pdf guide, png to pdf tutorial, compile photos into pdf instructions, image to pdf margins and sizing guide',
  },
  // Technical, Legal & Architecture
  '/privacy-architecture': {
    title: 'Technical & Privacy Architecture Whitepaper | LitasDark',
    description:
      'Learn how LitasDark processes documents entirely within volatile client-side browser RAM via WebAssembly and Web Workers with zero cloud transmission.',
    keywords:
      'pdf technical architecture, client side pdf security, zero upload architecture, in browser pdf processing, webassembly document privacy',
  },
  '/privacy': {
    title: 'Privacy Policy - Zero Data Retention | LitasDark',
    description:
      'Read our transparent Privacy Policy. LitasDark is an in-browser utility that does not collect, transmit, or store your document files or personal data.',
    keywords: 'litasdark privacy policy, zero data retention, client side document privacy, no cloud storage pdf',
  },
  '/terms': {
    title: 'Terms of Service & Usage Disclaimers | LitasDark',
    description:
      'Terms of Service and legal disclosures for using LitasDark in-browser client-side PDF manipulation tools. Free, open, and private utility service.',
    keywords: 'litasdark terms of service, legal terms, software disclaimers, free pdf tool terms',
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

  // Check static route definitions first
  const staticSeo = STATIC_ROUTE_SEO[path];

  // Check tool guides
  const cleanSlug = path.replace(/^\//, '');
  const isGuideRoute = cleanSlug.endsWith('/guide');
  const baseSlug = isGuideRoute ? cleanSlug.replace(/\/guide$/, '') : cleanSlug;
  const toolGuide = TOOL_GUIDES[baseSlug];

  let calculatedTitle = title;
  let calculatedDesc = description;
  let calculatedKeywords = keywords;

  if (!calculatedTitle && staticSeo) {
    calculatedTitle = staticSeo.title;
    calculatedDesc = staticSeo.description;
    calculatedKeywords = staticSeo.keywords;
  } else if (!calculatedTitle && toolGuide) {
    if (isGuideRoute) {
      calculatedTitle = toolGuide.guideTitle || `How to Use ${toolGuide.h1} - Complete Guide | LitasDark`;
      calculatedDesc = toolGuide.guideMetaDescription || toolGuide.metaDescription;
      calculatedKeywords = toolGuide.guideMetaKeywords || toolGuide.metaKeywords;
    } else {
      calculatedTitle = toolGuide.workspaceTitle || toolGuide.title;
      calculatedDesc = toolGuide.workspaceMetaDescription || toolGuide.metaDescription;
      calculatedKeywords = toolGuide.workspaceMetaKeywords || toolGuide.metaKeywords;
    }
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
          'Free private in-browser PDF tools: Dark Mode PDF inverter, Cleanse Metadata, Images to PDF, Merge, Split, Rotate, Compress, and Extract without uploading files to any server.',
        featureList: [
          'Smart Dark Mode Inversion for Eye Strain Relief',
          'Local Metadata Sanitizer and Cleaner',
          'In-Browser Image to PDF Compiler',
          'Fast WebAssembly-Powered PDF Merge',
          'Granular PDF Page Splitting',
          'Multi-angle PDF Page Rotation',
          'PDF Structure Compression',
          'Selective Page Extraction',
          'Client-Side Privacy with Zero Server Uploads',
        ],
        provider: {
          '@type': 'Organization',
          '@id': 'https://litasdark.vercel.app/#organization',
        },
      });
    }

    if (toolGuide) {
      const isGuide = path.endsWith('/guide');
      const pageTitle = isGuide
        ? (toolGuide.guideTitle || `How to Use ${toolGuide.h1} - Complete Guide`)
        : (toolGuide.workspaceTitle || toolGuide.h1);
      const pageDesc = isGuide
        ? (toolGuide.guideMetaDescription || toolGuide.metaDescription)
        : (toolGuide.workspaceMetaDescription || toolGuide.metaDescription);

      if (!isGuide) {
        graphItems.push({
          '@type': 'WebApplication',
          '@id': `https://litasdark.vercel.app/${toolGuide.slug}#webapp`,
          name: pageTitle,
          url: `https://litasdark.vercel.app/${toolGuide.slug}`,
          description: pageDesc,
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
      }

      const breadcrumbItems: any[] = [
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
      ];

      if (isGuide) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 4,
          name: 'Guide & Tutorial',
          item: `https://litasdark.vercel.app/${toolGuide.slug}/guide`,
        });
      }

      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
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
