export interface ToolOperationBenefit {
  title: string;
  description: string;
}

export interface ToolOperationDetail {
  id: number;
  slug: string;
  name: string;
  categoryLabel: string;
  functionSummary: string;
  mechanism: string;
  coreBenefits: ToolOperationBenefit[];
  idealFor: string;
  proTip: string;
  privacyGuarantee: string;
}

export const TOOL_OPERATION_DETAILS: Record<number, ToolOperationDetail> = {
  1: {
    id: 1,
    slug: 'dark-mode-pdf',
    name: 'Dark Mode PDF',
    categoryLabel: 'Reading & Display',
    functionSummary:
      'Transforms bright white PDF backgrounds into high-contrast dark, OLED pure black, or warm sepia reading themes without altering source files.',
    mechanism:
      'Renders each page to high-DPI offscreen canvas buffers via PDF.js, executes luminance color-matrix transformations directly on pixel buffers, and compiles a permanent standalone dark PDF.',
    coreBenefits: [
      {
        title: 'Ocular Fatigue Relief',
        description: 'Eliminates screen glare during nighttime reading and research sessions.',
      },
      {
        title: 'OLED Display Battery Savings',
        description: 'True black pixels switch off on AMOLED and OLED panels to conserve energy.',
      },
      {
        title: 'Universal Standalone File',
        description: 'Creates a standard PDF readable on any device or reader, not just in-browser.',
      },
    ],
    idealFor: 'Research papers, legal briefs, technical documentation, and late-night e-books.',
    proTip: 'Use OLED Pure Black for maximal contrast and battery conservation on mobile displays.',
    privacyGuarantee: 'Canvas pixel matrices are calculated in local memory; no page images are transmitted.',
  },
  2: {
    id: 2,
    slug: 'merge-pdf',
    name: 'Merge PDFs',
    categoryLabel: 'Document Assembly',
    functionSummary:
      'Stitches multiple separate PDF files into a single ordered document with synchronized pagination and bookmarks.',
    mechanism:
      'Parses binary PDF streams using client-side WebAssembly, merges cross-reference tables and page dictionary trees into a unified PDF structure in volatile RAM.',
    coreBenefits: [
      {
        title: 'Lossless Vector Preservation',
        description: 'Maintains crisp vector text, embedded typography, and line art without rasterization.',
      },
      {
        title: 'Instant Multi-File Assembly',
        description: 'No network latency or server queue delays when combining dozens of files.',
      },
      {
        title: 'Confidential Batch Processing',
        description: 'Ideal for combining sensitive client exhibits and banking records privately.',
      },
    ],
    idealFor: 'Combining invoices, contracts, multi-part reports, and portfolio submissions.',
    proTip: 'Arrange files in the workspace preview to ensure the exact desired page order before merging.',
    privacyGuarantee: 'Files remain strictly inside volatile browser memory and are wiped when the tab closes.',
  },
  3: {
    id: 3,
    slug: 'split-pdf',
    name: 'Split PDF',
    categoryLabel: 'Page Management',
    functionSummary:
      'Divides large multi-page PDF documents into individual single-page files or custom page range segments.',
    mechanism:
      'Traverses the PDF document page tree, isolates target page object references and content streams, and builds independent valid PDF containers using zero-copy slicing.',
    coreBenefits: [
      {
        title: 'Targeted Document Extraction',
        description: 'Isolate signed agreements, individual statements, or chapters in seconds.',
      },
      {
        title: 'Reduced File Footprint',
        description: 'Generate compact files containing solely the pages your recipient requires.',
      },
      {
        title: 'Original File Protection',
        description: 'Source files are never overwritten; new files are generated as fresh downloads.',
      },
    ],
    idealFor: 'Extracting signed signature pages, tax form subsets, and individual catalog chapters.',
    proTip: 'Specify custom comma-separated page ranges (e.g., "1-3, 5, 8-10") for batch segment output.',
    privacyGuarantee: 'Page parsing runs 100% on your device hardware with zero cloud storage.',
  },
  4: {
    id: 4,
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    categoryLabel: 'Orientation Alignment',
    functionSummary:
      'Corrects misaligned or inverted PDF pages by adjusting rotational orientation in 90°, 180°, or 270° increments.',
    mechanism:
      'Updates the native /Rotate dictionary attribute on individual page dictionary nodes in the PDF object model without re-encoding image streams or destroying vector sharpness.',
    coreBenefits: [
      {
        title: 'Lossless Orientation Fix',
        description: 'Zero quality loss because internal text, vectors, and photos remain untouched.',
      },
      {
        title: 'Batch & Selective Rotation',
        description: 'Rotate all pages uniformly or target individual landscape/portrait orientations.',
      },
      {
        title: 'Instantaneous Execution',
        description: 'Modifying metadata flags completes in milliseconds regardless of document size.',
      },
    ],
    idealFor: 'Inverted document scans, mixed-orientation presentation slides, and landscape spreadsheets.',
    proTip: 'Setting orientation flags preserves original crisp vector text for professional printing.',
    privacyGuarantee: 'All dictionary adjustments occur locally; no document data leaves the browser session.',
  },
  5: {
    id: 5,
    slug: 'compress-pdf',
    name: 'Optimize PDF',
    categoryLabel: 'Compression & Performance',
    functionSummary:
      'Reduces PDF file size by deflating object streams, scrubbing unreferenced objects, and removing metadata bloat.',
    mechanism:
      'Traverses the indirect object graph, removes orphaned resources, deduplicates identical stream objects, and recompresses structural stream bytes within a dedicated Web Worker.',
    coreBenefits: [
      {
        title: 'Email Attachment Readiness',
        description: 'Quickly shrink oversized documents to fit within 10MB–25MB email size limits.',
      },
      {
        title: 'Smooth Web Loading',
        description: 'Optimized files open significantly faster on mobile readers and web viewers.',
      },
      {
        title: 'Non-Blocking Background Worker',
        description: 'Heavy compression algorithms run in a Web Worker so the browser interface stays responsive.',
      },
    ],
    idealFor: 'Scanned legal briefs, architectural blueprints, presentation decks, and email attachments.',
    proTip: 'Documents created by scanners with high-DPI uncompressed images yield the largest size reduction.',
    privacyGuarantee: 'Document streams are unpacked and compressed locally in ephemeral worker memory.',
  },
  6: {
    id: 6,
    slug: 'extract-pdf',
    name: 'Extract Pages',
    categoryLabel: 'Selective Extraction',
    functionSummary:
      'Pulls specific pages or page selections out of a PDF to generate a new, focused document containing only what is needed.',
    mechanism:
      'Leverages native Rust WebAssembly memory management to copy page descriptors, font references, and media streams into a clean, new document catalog.',
    coreBenefits: [
      {
        title: 'Precise Excerpt Sharing',
        description: 'Share only relevant paragraphs or sections without revealing confidential surrounding text.',
      },
      {
        title: 'Clean Redaction Support',
        description: 'Exclude private annexes, sensitive pricing sheets, or internal notes from distribution.',
      },
      {
        title: 'Zero-Degradation Output',
        description: 'Copies exact underlying binary streams without re-encoding fonts or rasterizing text.',
      },
    ],
    idealFor: 'Sharing contracts without sensitive exhibits, academic paper excerpts, and specific tax forms.',
    proTip: 'Use visual thumbnails to verify page selections before exporting your extracted document.',
    privacyGuarantee: 'Direct WebAssembly extraction ensures no file bytes ever touch a cloud endpoint.',
  },
  7: {
    id: 7,
    slug: 'cleanse-metadata',
    name: 'Cleanse Metadata',
    categoryLabel: 'Privacy & Security',
    functionSummary:
      'Removes hidden document metadata including author names, software versions, edit histories, and local file paths.',
    mechanism:
      'Locates and wipes the /Info document dictionary and XMP metadata streams, replaces identification tags with sanitized identifiers, and prevents information leakage.',
    coreBenefits: [
      {
        title: 'Prevents Information Leakage',
        description: 'Stops recipients from discovering author identities, internal company paths, or software tools.',
      },
      {
        title: 'Blind Peer Review Compliance',
        description: 'Sanitizes academic and legal submissions to meet strict double-blind standards.',
      },
      {
        title: 'Sanitized Distribution',
        description: 'Replaces sensitive production metadata with clean, generic publishing tags.',
      },
    ],
    idealFor: 'Legal filings, competitive bid proposals, anonymous manuscript submissions, and sensitive reports.',
    proTip: 'Always scrub metadata before distributing confidential proposals or public whitepapers.',
    privacyGuarantee: 'Metadata sanitization is performed in-place in browser RAM with zero external logging.',
  },
  8: {
    id: 8,
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    categoryLabel: 'Image Conversion',
    functionSummary:
      'Converts JPG, PNG, and WebP images into a clean, standardized multi-page PDF document with optimal aspect-ratio scaling.',
    mechanism:
      'Decodes image dimensions in browser memory, calculates matching PDF media box coordinates, and embeds compressed image streams into standard PDF pages.',
    coreBenefits: [
      {
        title: 'Unified Document Format',
        description: 'Transforms messy folders of phone photos and scanned receipts into a single professional file.',
      },
      {
        title: 'Automatic Page Scaling',
        description: 'Fits diverse image aspect ratios cleanly onto standard printable document bounds.',
      },
      {
        title: 'High-Resolution Fidelity',
        description: 'Embeds full photographic resolution without aggressive lossy recompression artifacts.',
      },
    ],
    idealFor: 'Expense receipt packets, homework submissions, photo archiving, and visual documentation.',
    proTip: 'Reorder your image list in the staging preview to control page sequence before compiling.',
    privacyGuarantee: 'Image conversion runs entirely inside HTML5 canvas and WebAssembly with zero uploads.',
  },
};

export function getToolOperationDetail(id: number): ToolOperationDetail | undefined {
  return TOOL_OPERATION_DETAILS[id];
}

export function getToolOperationDetailByPath(path: string): ToolOperationDetail | undefined {
  const cleanPath = path.replace('/', '').replace('-pdf', '');
  return Object.values(TOOL_OPERATION_DETAILS).find(
    (detail) => detail.slug === path.replace('/', '') || detail.slug.includes(cleanPath)
  );
}
