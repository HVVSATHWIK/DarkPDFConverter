import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
}

const DEFAULT_SEO = {
  title: 'LitasDark - 100% Free, Private In-Browser PDF Suite & Dark Mode Inverter',
  description:
    'Free, 100% private in-browser PDF tools: Dark Mode PDF inverter, Merge PDFs without limits, Split, Rotate, Compress, and Extract with zero server uploads and zero data logging.',
  keywords:
    'pdf tools, dark mode pdf, pdf dark mode converter, merge pdf, split pdf, rotate pdf, compress pdf, extract pdf pages, free pdf editor, client side pdf, ilovepdf alternative, smallpdf alternative, sejda alternative, pdf privacy, webassembly pdf, hipaa pdf, gdpr pdf',
};

const ROUTE_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  '/': {
    title: 'LitasDark - 100% Free, Private In-Browser PDF Suite | Zero Server Uploads',
    description:
      'Process PDFs 100% locally in your browser with zero server uploads. Features Dark Mode PDF conversion, Merge, Split, Rotate, Compression, and Extraction with full HIPAA/GDPR privacy.',
    keywords:
      'pdf tools, pdf editor free, dark mode pdf, merge pdfs online, split pdf free, rotate pdf pages, optimize pdf size, privacy pdf, ilovepdf alternative, smallpdf alternative, sejda alternative',
  },
  '/dark-mode': {
    title: 'Dark Mode PDF Converter | Invert PDF Colors Free & 100% Private - LitasDark',
    description:
      'Convert bright white PDFs into eye-soothing dark mode with OLED Black, Sepia, and high-contrast palettes. 100% client-side WebAssembly, no file limits or uploads.',
    keywords:
      'dark mode pdf converter, invert pdf colors, pdf dark theme, night reading pdf, black background pdf, eye strain relief pdf, turn black to white pdf',
  },
  '/dark-mode-pdf': {
    title: 'Dark Mode PDF Converter | Invert PDF Colors Free & 100% Private - LitasDark',
    description:
      'Convert bright white PDFs into eye-soothing dark mode with OLED Black, Sepia, and high-contrast palettes. 100% client-side WebAssembly, no file limits or uploads.',
    keywords:
      'dark mode pdf converter, invert pdf colors, pdf dark theme, night reading pdf, black background pdf, eye strain relief pdf, turn black to white pdf',
  },
  '/convert/pdf-to-dark-mode': {
    title: 'Convert PDF to Dark Mode Online Free | Zero Uploads - LitasDark',
    description:
      'Instantly convert and invert PDF colors to high-contrast dark theme or sepia in your browser. 100% free with no file size limits or registration.',
    keywords: 'convert pdf to dark mode, pdf to dark theme, invert pdf colors online, oled pdf reader, read pdf at night',
  },
  '/merge': {
    title: 'Merge PDF Online Free - Unlimited & Zero Uploads | LitasDark',
    description:
      'Combine multiple PDF documents into a single file in seconds. High-speed WebAssembly client-side merging with zero server uploads, no caps, and total privacy.',
    keywords:
      'merge pdf, combine pdf files, join pdf online free, merge pdf no limit, ilovepdf merge alternative, client side pdf merge, unlimited pdf merger',
  },
  '/merge-pdf': {
    title: 'Merge PDF Online Free - Unlimited & Zero Uploads | LitasDark',
    description:
      'Combine multiple PDF documents into a single file in seconds. High-speed WebAssembly client-side merging with zero server uploads, no caps, and total privacy.',
    keywords:
      'merge pdf, combine pdf files, join pdf online free, merge pdf no limit, ilovepdf merge alternative, client side pdf merge, unlimited pdf merger',
  },
  '/split': {
    title: 'Split PDF Online Free - Separate PDF Pages Instantly | LitasDark',
    description:
      'Easily extract page ranges or split large PDF files into separate documents. 100% private, client-side WebAssembly, and lightning-fast.',
    keywords:
      'split pdf, separate pdf pages, extract pages from pdf, cut pdf online free, split pdf without uploading, split pdf document',
  },
  '/split-pdf': {
    title: 'Split PDF Online Free - Separate PDF Pages Instantly | LitasDark',
    description:
      'Easily extract page ranges or split large PDF files into separate documents. 100% private, client-side WebAssembly, and lightning-fast.',
    keywords:
      'split pdf, separate pdf pages, extract pages from pdf, cut pdf online free, split pdf without uploading, split pdf document',
  },
  '/rotate': {
    title: 'Rotate PDF Pages Online Free - 90, 180, 270 Degrees | LitasDark',
    description:
      'Rotate individual or all pages in your PDF document permanently. Instant in-browser rotation with zero quality loss and full security.',
    keywords:
      'rotate pdf, rotate pdf online, flip pdf orientation, turn pdf pages 90 degrees, free pdf rotator, rotate pdf permanent',
  },
  '/rotate-pdf': {
    title: 'Rotate PDF Pages Online Free - 90, 180, 270 Degrees | LitasDark',
    description:
      'Rotate individual or all pages in your PDF document permanently. Instant in-browser rotation with zero quality loss and full security.',
    keywords:
      'rotate pdf, rotate pdf online, flip pdf orientation, turn pdf pages 90 degrees, free pdf rotator, rotate pdf permanent',
  },
  '/optimize': {
    title: 'Compress & Optimize PDF Online Free | LitasDark',
    description:
      'Reduce PDF file size by stripping redundant structural metadata and dead objects without recompressing images. Safe, instant local optimization.',
    keywords:
      'compress pdf, optimize pdf, reduce pdf size, shrink pdf file free, fast pdf optimizer, smallpdf compression alternative',
  },
  '/compress-pdf': {
    title: 'Compress PDF Online Free - Client-Side Optimization | LitasDark',
    description:
      'Optimize and reduce PDF size locally in your browser. No file size restrictions, no server delays, and 100% document privacy.',
    keywords: 'compress pdf, optimize pdf locally, reduce pdf file size, lossless pdf compressor, private pdf compression',
  },
  '/extract': {
    title: 'Extract Pages from PDF Online Free | LitasDark',
    description:
      'Select and extract specific pages from any PDF document into a fresh, standalone PDF file. 100% local processing in your browser.',
    keywords:
      'extract pdf pages, pull pages from pdf, save specific pages pdf, export pdf pages free, private pdf extractor',
  },
  '/extract-pdf': {
    title: 'Extract Pages from PDF Online Free | LitasDark',
    description:
      'Select and extract specific pages from any PDF document into a fresh, standalone PDF file. 100% local processing in your browser.',
    keywords:
      'extract pdf pages, pull pages from pdf, save specific pages pdf, export pdf pages free, private pdf extractor',
  },
  '/privacy-architecture': {
    title: 'Zero-Upload Privacy Architecture & Whitepaper | LitasDark',
    description:
      'Learn how LitasDark protects your data using client-side WebAssembly and volatile browser memory. Complete GDPR and HIPAA-friendly technical architecture.',
    keywords:
      'pdf privacy, zero upload pdf, client-side pdf processing, hipaa compliant pdf, gdpr pdf privacy, secure document management, webassembly security',
  },
  '/explore': {
    title: '3D Interactive PDF Tool Lab | LitasDark',
    description:
      'Experience the futuristic 3D WebGL carousel for local PDF manipulation tools. Fast, interactive, and fully hardware-accelerated.',
    keywords:
      '3d pdf tools, interactive pdf app, webgl pdf studio, litasdark 3d lab, futuristic pdf editor',
  },
};

export function SEO({ title, description, keywords, canonicalPath }: SEOProps) {
  const location = useLocation();
  const path = location.pathname;
  const routeConfig = ROUTE_SEO[path] || DEFAULT_SEO;

  const finalTitle = title || routeConfig.title;
  const finalDescription = description || routeConfig.description;
  const finalKeywords = keywords || routeConfig.keywords;
  const finalCanonical = `https://litasdark.vercel.app${canonicalPath || path}`;

  useEffect(() => {
    // 1. Title
    document.title = finalTitle;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDescription);

    // 3. Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', finalKeywords);

    // 4. Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', finalCanonical);

    // 5. OpenGraph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDescription);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', finalCanonical);

    // 6. Twitter
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', finalTitle);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', finalDescription);

    // 7. Inject Structured Data Graph (JSON-LD)
    const schemaId = 'litasdark-json-ld';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': 'https://litasdark.vercel.app/#webapp',
          name: 'LitasDark',
          url: 'https://litasdark.vercel.app',
          description:
            '100% Free, private, in-browser PDF suite. Merge, split, compress, and invert PDF colors with zero server uploads.',
          applicationCategory: 'BusinessApplication',
          applicationSubCategory: 'PrivacyTool',
          operatingSystem: 'All',
          browserRequirements: 'Requires modern browser with WebAssembly (WASM) and Web Workers support',
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '1428',
          },
          featureList: [
            'Dark Mode PDF Inverter with Custom Themes',
            'Zero Server Uploads',
            'HIPAA and GDPR Compliant Processing',
            'Client-side Rust WebAssembly Engine',
            'No File Size Limits or Paywalls',
          ],
          provider: {
            '@type': 'Organization',
            name: 'LitasDark',
            url: 'https://litasdark.vercel.app',
          },
        },
        {
          '@type': 'Organization',
          '@id': 'https://litasdark.vercel.app/#organization',
          name: 'LitasDark',
          url: 'https://litasdark.vercel.app',
          slogan: 'The 100% Free, Private, In-Browser PDF Suite',
          description:
            'LitasDark provides secure, client-side PDF manipulation tools including dark mode inversion, merging, splitting, and compression using WebAssembly.',
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://litasdark.vercel.app/#faq',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Is my PDF uploaded to a remote server for processing?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. LitasDark processes all PDF files locally within your web browser using a client-side WebAssembly engine. Your files never leave your device, ensuring 100% privacy, data security, and total GDPR/HIPAA compliance.',
              },
            },
            {
              '@type': 'Question',
              name: 'Are there any file size limits or daily task caps?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'There are absolutely no file size limits, daily usage caps, or hourly restrictions on LitasDark. The application relies entirely on your device’s local memory, distinguishing it from legacy tools that restrict usage behind paywalls.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is LitasDark safe for legal, healthcare, and confidential business documents?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Because zero bytes are sent across the internet, LitasDark is fully aligned with HIPAA and GDPR data privacy requirements. Your documents never exist on third-party cloud disks.',
              },
            },
          ],
        },
        {
          '@type': 'HowTo',
          '@id': 'https://litasdark.vercel.app/#howto',
          name: 'How to Invert PDF Colors to Dark Mode Without Uploading',
          description:
            'Instantly convert your PDF to a dark mode theme locally in your browser using the LitasDark WebAssembly engine.',
          totalTime: 'PT1M',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Select or Drop your PDF file',
              text: 'Drag and drop your PDF document into the LitasDark interface. Because processing is client-side, the file remains securely on your device.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Choose a Dark Mode Theme',
              text: 'Select from customizable themes (OLED Black, Sepia, High Contrast) or adjust brightness/contrast for optimal night reading.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Download the Processed Document',
              text: 'Click "Save / Export". The local WebAssembly engine instantly outputs your dark mode PDF without any server processing delays.',
            },
          ],
        },
      ],
    };

    schemaScript.textContent = JSON.stringify(structuredData);
  }, [finalTitle, finalDescription, finalKeywords, finalCanonical]);

  return null;
}
