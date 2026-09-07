export interface ToolStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface ToolFeature {
  title: string;
  description: string;
}

export interface ToolFAQ {
  q: string;
  a: string;
}

export interface ToolGuideData {
  toolId: number;
  slug: string;
  title: string;
  h1: string;
  subtitle: string;
  metaDescription: string;
  metaKeywords: string;
  howItWorksOverview: string;
  steps: ToolStep[];
  features: ToolFeature[];
  technicalDetails: {
    engine: string;
    memoryLifecycle: string;
    supportedFormats: string[];
    outputFormat: string;
    limitations: string[];
  };
  useCases: {
    title: string;
    scenario: string;
  }[];
  faqs: ToolFAQ[];
  relatedToolSlugs: string[];
}

export const TOOL_GUIDES: Record<string, ToolGuideData> = {
  'dark-mode-pdf': {
    toolId: 1,
    slug: 'dark-mode-pdf',
    title: 'Dark Mode PDF Converter - Invert PDF Colors for Night Reading | LitasDark',
    h1: 'Dark Mode PDF Converter',
    subtitle:
      'Invert bright white backgrounds into eye-friendly dark, OLED black, or sepia themes entirely in your browser memory.',
    metaDescription:
      'Convert bright white PDFs into dark mode, OLED black, sepia, or slate reading themes. Processed locally in your browser without altering your original files.',
    metaKeywords:
      'dark mode pdf converter, invert pdf colors, pdf dark theme, night reading pdf, black background pdf, oled dark pdf, sepia pdf',
    howItWorksOverview:
      'The Dark Mode PDF Converter renders each page of your document onto an offscreen canvas at high resolution (2.0x scale) using PDF.js. It applies a precise luminance color transformation matrix directly to the pixel buffer, inverting bright white canvas backgrounds into deep dark tones while adjusting text and vector path luminance for maximum reading comfort. You can choose from six dedicated reading themes: Dark Slate, Darker, OLED Pure Black, Sepia Warm, Midnight, and Slate. The resulting dark canvas frames are re-encoded and assembled into a new, standalone PDF document for download. Your original file on disk remains completely untouched.',
    steps: [
      {
        stepNumber: 1,
        title: 'Choose or Drop Your PDF',
        description:
          'Select a PDF from your device or drag and drop it into the workspace. The file is loaded exclusively into local browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Select Theme & Reading Palette',
        description:
          'Choose your preferred theme: Dark Slate, Darker, OLED Pure Black, Sepia Warm, Midnight, or Slate to customize background contrast.',
      },
      {
        stepNumber: 3,
        title: 'Preview and Download Dark PDF',
        description:
          'Inspect the real-time preview of the converted dark pages. Click Apply Dark Mode or Download Result to save your new PDF.',
      },
    ],
    features: [
      {
        title: 'Six Customized Reading Themes',
        description:
          'Switch between Dark Slate, Darker, OLED Pure Black, Sepia Warm, Midnight, and Slate to reduce eye strain in low-light environments.',
      },
      {
        title: 'Generates Standalone Dark PDF File',
        description:
          'Unlike browser extensions that only invert your screen display, LitasDark creates a permanent dark-themed PDF file you can open on any device or PDF reader.',
      },
      {
        title: 'Zero Server Transmission',
        description:
          'Page rendering and color transformations execute locally in browser Canvas buffers without sending document bytes across the network.',
      },
      {
        title: 'Preserves Original Files',
        description:
          'Your source document is never overwritten; color transformations produce fresh, separate PDF downloads.',
      },
    ],
    technicalDetails: {
      engine: 'Client-side PDF.js canvas rendering pipeline with high-resolution luminance inversion transformation matrices',
      memoryLifecycle: 'Document byte streams reside strictly in volatile browser RAM and are purged when the tab is closed or reset',
      supportedFormats: ['Standard PDF documents (.pdf)', 'Text-based vector PDFs', 'Scanned image PDFs'],
      outputFormat: 'Standalone Dark-Themed PDF (.pdf)',
      limitations: [
        'Embedded photos and raster diagrams undergo pixel-level color filtering along with the rest of the page canvas.',
        'Because pages are rendered to canvas during inversion, interactive text layers in the output PDF become high-resolution dark raster pages.',
        'Extremely long documents (100+ pages) may take several seconds to process depending on device CPU speed.',
      ],
    },
    useCases: [
      {
        title: 'Late-Night Academic Research',
        scenario: 'Read dense textbooks, research papers, and lecture slides in dark rooms without harsh screen glare.',
      },
      {
        title: 'Software Manuals & Code Guides',
        scenario: 'Match PDF developer manuals and API reference guides to your dark-themed IDE workspace.',
      },
      {
        title: 'OLED Tablet & Mobile Reading',
        scenario: 'Save battery life and reduce blue light exposure when reading technical manuals on OLED mobile screens.',
      },
    ],
    faqs: [
      {
        q: 'How does LitasDark Dark Mode PDF differ from a dark mode browser extension?',
        a: 'Browser extensions only invert how a document looks on your current monitor. LitasDark transforms the PDF file itself, generating a new, standalone dark-themed PDF document that stays dark when saved, emailed, or opened on any tablet or PDF reader app.',
      },
      {
        q: 'Does this tool modify or overwrite my original PDF file?',
        a: 'No. The converter reads your file into temporary browser memory and generates a new, separate PDF file for you to download. Your original file remains completely unchanged on your computer.',
      },
      {
        q: 'Are my document contents uploaded to any cloud server?',
        a: 'No. All rendering and pixel inversion calculations execute entirely in your browser using client-side JavaScript and Canvas APIs. Zero bytes of document data are transmitted over the internet.',
      },
      {
        q: 'What visual reading themes are available?',
        a: 'You can select from six distinct themes: Dark Slate (balanced dark grey), Darker (extra contrast), OLED Pure Black (deepest dark for OLED screens), Sepia Warm (gentle amber tone for reduced blue light), Midnight (deep navy tint), and Slate (cool grey).',
      },
      {
        q: 'What happens to embedded photos and color diagrams in dark mode?',
        a: 'The color matrix inverts luminance across the entire page canvas, ensuring text and background contrast are swapped while maintaining readable contrast for embedded diagrams.',
      },
    ],
    relatedToolSlugs: ['rotate-pdf', 'compress-pdf', 'images-to-pdf', 'cleanse-metadata'],
  },

  'merge-pdf': {
    toolId: 2,
    slug: 'merge-pdf',
    title: 'Merge PDF Online - Combine Multiple PDF Files Free | LitasDark',
    h1: 'Merge PDF Files Online',
    subtitle:
      'Combine multiple PDF documents and chapters into a single file in seconds, entirely in your browser memory.',
    metaDescription:
      'Combine multiple PDF documents into a single file locally in your browser. Reorder files, preserve vector quality, and merge without uploading files to a server.',
    metaKeywords:
      'merge pdf, combine pdf files, join pdf online free, merge pdf no upload, client side pdf merge, combine pdf documents',
    howItWorksOverview:
      'The PDF Merger utilizes a high-speed Rust and WebAssembly (WASM) PDF engine running inside a background Web Worker (`pdf.worker.ts`). When you select multiple PDF files, their byte streams are transferred directly into WebAssembly memory buffers using zero-copy Transferable ArrayBuffers. The engine parses the internal cross-reference tables, object dictionaries, and page catalogs of each document, copying page references in your specified queue order into a newly compiled PDF document stream. All operations occur in local RAM with zero network uploads.',
    steps: [
      {
        stepNumber: 1,
        title: 'Select Multiple PDF Files',
        description:
          'Click to browse or drop two or more PDF files into the workspace queue. All files are loaded locally into browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Arrange File Sequence',
        description:
          'Verify and reorder your files in the exact sequence you want them to appear in the combined output document.',
      },
      {
        stepNumber: 3,
        title: 'Merge and Download',
        description:
          'Click Merge PDFs. The WebAssembly engine compiles the document streams in RAM and provides an immediate download.',
      },
    ],
    features: [
      {
        title: 'High-Speed WebAssembly Engine',
        description:
          'Combines document object trees in milliseconds using compiled Rust/WASM binaries running in a background Web Worker.',
      },
      {
        title: 'Preserves Vector Typography & Sharpness',
        description:
          'Copies original text vectors, embedded fonts, lines, and images directly without re-encoding or rasterizing pages.',
      },
      {
        title: 'Multi-File Batch Queue',
        description:
          'Load and combine multiple reports, invoices, chapters, or legal exhibits simultaneously in a single operation.',
      },
      {
        title: '100% Client-Side Privacy',
        description:
          'Zero document data is ever sent to a remote server, protecting sensitive financial, legal, and personal files.',
      },
    ],
    technicalDetails: {
      engine: 'Rust / WebAssembly PDF engine compiled to Web Worker (`pdf.worker.ts`) with zero-copy ArrayBuffer transfers',
      memoryLifecycle: 'Raw Uint8Array document buffers exist in volatile browser memory during compilation and are purged upon task completion',
      supportedFormats: ['Standard PDF documents (.pdf 1.3 - 1.7)'],
      outputFormat: 'Combined Single PDF Document (.pdf)',
      limitations: [
        'Password-protected or encrypted PDFs must be decrypted before their internal page streams can be merged.',
        'Extremely large multi-gigabyte document queues may be constrained by your computer’s available browser RAM.',
        'Interactive PDF forms with duplicate field identifiers across documents will have conflicting field names unified.',
      ],
    },
    useCases: [
      {
        title: 'Legal Briefs & Evidence Packets',
        scenario: 'Assemble court filings, declarations, exhibits, and cover sheets into a single structured legal document.',
      },
      {
        title: 'Financial Audits & Invoices',
        scenario: 'Consolidate monthly receipts, bank statements, and tax forms into an annual accounting binder.',
      },
      {
        title: 'Academic Manuscripts & Dissertations',
        scenario: 'Join title pages, individual research chapters, appendices, and bibliographies into a complete manuscript.',
      },
    ],
    faqs: [
      {
        q: 'How many PDF files can I merge at once?',
        a: 'You can merge as many PDF files as your computer’s memory can comfortably handle. Because processing happens locally rather than on a remote server, there are no artificial batch limits or paywalls.',
      },
      {
        q: 'Does merging reduce the text or image quality of my documents?',
        a: 'No. The WebAssembly engine copies the underlying vector paths, fonts, and image streams directly from the source files without rasterization or lossy re-encoding.',
      },
      {
        q: 'What happens to my original PDF files after merging?',
        a: 'Your original source files on your computer remain completely untouched. The merger generates a brand-new, separate PDF file for download.',
      },
      {
        q: 'Are my merged documents uploaded to any cloud server?',
        a: 'Never. All merging is performed locally in your browser memory via WebAssembly. No document bytes leave your device.',
      },
      {
        q: 'What happens if the documents have different page sizes or orientations?',
        a: 'Each page retains its original dimensions, width, height, and orientation. Portrait and landscape pages coexist seamlessly in the merged output.',
      },
    ],
    relatedToolSlugs: ['split-pdf', 'extract-pdf', 'compress-pdf'],
  },

  'split-pdf': {
    toolId: 3,
    slug: 'split-pdf',
    title: 'Split PDF Online - Separate PDF Page Ranges Free | LitasDark',
    h1: 'Split PDF Pages Online',
    subtitle:
      'Extract custom page ranges or divide large PDF documents into smaller files directly in your browser.',
    metaDescription:
      'Extract page ranges or split a PDF into smaller documents in your browser. No server uploads, unconstrained by artificial limits, and fast local processing.',
    metaKeywords:
      'split pdf, separate pdf pages, extract page range from pdf, cut pdf online free, split pdf without uploading, divide pdf',
    howItWorksOverview:
      'The PDF Splitter isolates a continuous contiguous range of pages (such as pages 5 through 12) from a larger PDF document. Using client-side `pdf-lib` parsing, the engine reads the source document dictionary in browser memory, instantiates a new PDF container, copies the dictionary nodes and stream references for the specified page range, and serializes a clean, standalone PDF file for download. Your original file remains completely unchanged.',
    steps: [
      {
        stepNumber: 1,
        title: 'Upload Your PDF',
        description: 'Drop or browse for the PDF document you want to split. The file opens locally in your browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Specify Page Range',
        description: 'Enter the start page and end page numbers for the exact contiguous section you want to isolate.',
      },
      {
        stepNumber: 3,
        title: 'Split and Save',
        description: 'Click Split PDF. The browser extracts the designated page range and provides an immediate download link.',
      },
    ],
    features: [
      {
        title: 'Contiguous Range Selection',
        description: 'Extract any continuous page slice—from a single page to hundreds of pages—in a single operation.',
      },
      {
        title: 'In-Memory Stream Isolation',
        description: 'Separates document pages in milliseconds locally in your browser without network latency.',
      },
      {
        title: 'Preserves Vector Quality & Fonts',
        description: 'Embedded fonts and vector drawing paths required by the selected pages are cleanly preserved in the new file.',
      },
      {
        title: 'Strict Local Privacy',
        description: 'Your sensitive contracts, financial statements, or confidential records never leave your local machine.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib page dictionary copying and object graph isolation in client browser RAM',
      memoryLifecycle: 'Allocates memory only for the selected page indices in volatile client RAM, purged upon reset',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Standalone Split PDF (.pdf)',
      limitations: [
        'Interactive bookmarks pointing to pages outside the extracted range are removed.',
        'Password-protected documents must be decrypted before page ranges can be isolated.',
        'Split PDF isolates a single continuous range (e.g. pages 5 to 10). To pick non-consecutive individual pages (e.g. pages 2, 5, and 9), use the Extract Pages tool.',
      ],
    },
    useCases: [
      {
        title: 'Isolating Contract Sections',
        scenario: 'Isolate signature pages or specific schedules from lengthy legal agreements to share with stakeholders.',
      },
      {
        title: 'Dividing Large Scanned Manuals',
        scenario: 'Break 500-page operational manuals into individual chapter-sized files for easier email distribution.',
      },
      {
        title: 'Extracting Financial Statements',
        scenario: 'Split out a single monthly statement from a multi-year consolidated bank account export.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between Split PDF and Extract Pages?',
        a: 'Split PDF isolates a continuous range of pages defined by a start and end page (e.g., pages 10 through 20). Extract Pages allows you to cherry-pick specific, non-consecutive individual pages (e.g., pages 1, 4, and 9) into a new document.',
      },
      {
        q: 'Does splitting a PDF lower text sharpness or image quality?',
        a: 'No. The splitting process copies raw vector objects, fonts, and image streams directly into the new file without re-encoding or compressing them.',
      },
      {
        q: 'Can I split a single page out of a document?',
        a: 'Yes. Simply set both the start page and end page to the same number (e.g., Start: 4, End: 4).',
      },
      {
        q: 'Will my original document be altered when I split it?',
        a: 'No. The original file on your computer remains untouched. The split operation produces a new, separate PDF file.',
      },
      {
        q: 'Do you store any copy of my split PDF on a server?',
        a: 'No. LitasDark operates 100% client-side. Zero files are uploaded or stored on any server.',
      },
    ],
    relatedToolSlugs: ['extract-pdf', 'merge-pdf', 'rotate-pdf'],
  },

  'rotate-pdf': {
    toolId: 4,
    slug: 'rotate-pdf',
    title: 'Rotate PDF Online - Rotate PDF Pages 90, 180, 270 Degrees | LitasDark',
    h1: 'Rotate PDF Pages Online',
    subtitle:
      'Permanently rotate upside-down or sideways PDF pages by 90°, 180°, or 270° directly in your browser.',
    metaDescription:
      'Rotate individual PDF pages or entire documents permanently. Fast, browser-based orientation correction with zero cloud uploads.',
    metaKeywords:
      'rotate pdf, rotate pdf online, flip pdf orientation, turn pdf pages 90 degrees, free pdf rotator, permanent pdf rotation',
    howItWorksOverview:
      'The Rotate PDF tool adjusts the `/Rotate` attribute directly within the PDF page dictionary objects using the high-speed WebAssembly engine (`pdf.worker.ts`). In the PDF specification, page rotation is defined as an integer angle (0, 90, 180, or 270 degrees clockwise). Because this operation only modifies orientation metadata in the document dictionary, the underlying page content, vector text, images, and fonts are preserved with 100% fidelity without rasterization or recompression.',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Your PDF File',
        description: 'Drag and drop your PDF into the tool workspace. It loads immediately into local browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Choose Rotation Angle & Target',
        description: 'Select 90° Clockwise, 180° Inversion, or 270° Counter-Clockwise, and apply it to all pages or specific pages.',
      },
      {
        stepNumber: 3,
        title: 'Apply and Download',
        description: 'Click Rotate PDF. The engine updates the rotation metadata in RAM and provides an immediate download.',
      },
    ],
    features: [
      {
        title: 'Zero Recompression or Quality Loss',
        description: 'Modifies page dictionary `/Rotate` keys directly without re-encoding raster image streams or rasterizing vector paths.',
      },
      {
        title: 'Permanent Orientation Fix',
        description: 'The updated rotation angle is saved directly into the PDF standard file structure, ensuring it opens correctly in all PDF viewers, mobile devices, and print dialogs.',
      },
      {
        title: 'All Pages or Target Selection',
        description: 'Rotate all pages simultaneously or adjust specific sideways landscape pages.',
      },
      {
        title: 'Instant WebAssembly Execution',
        description: 'Updates orientation dictionary keys in milliseconds off the main thread with zero network latency.',
      },
    ],
    technicalDetails: {
      engine: 'Rust / WebAssembly PDF engine modifying page dictionary `/Rotate` metadata keys off-thread in `pdf.worker.ts`',
      memoryLifecycle: 'In-place metadata patch in volatile browser RAM, revoked upon reset',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Permanently Rotated PDF Document (.pdf)',
      limitations: [
        'Page rotation applies standard 90°, 180°, or 270° quadrant rotations. It does not perform automatic deskewing for pages scanned crookedly at slight angles (e.g. 2.5 degrees).',
      ],
    },
    useCases: [
      {
        title: 'Fixing Upside-Down Scans',
        scenario: 'Correct inverted documents caused by multi-page document scanner feed errors.',
      },
      {
        title: 'Aligning Landscape Spreadsheets',
        scenario: 'Rotate wide architectural drawings, financial spreadsheets, or landscape presentation slides for comfortable reading.',
      },
      {
        title: 'Mobile Document Photo Cleanup',
        scenario: 'Fix orientation on smartphone receipts or contract photos before submitting for reimbursement.',
      },
    ],
    faqs: [
      {
        q: 'Is this rotation permanent when opened in Adobe Acrobat or mobile viewers?',
        a: 'Yes. The rotation angle is written directly into the standard PDF page dictionary, ensuring it opens in the correct orientation across all PDF readers, mobile devices, and print dialogs.',
      },
      {
        q: 'Does rotating a PDF degrade image or text quality?',
        a: 'No. Rotating only updates an internal metadata angle attribute inside the PDF file. It does not re-encode or compress any text or images.',
      },
      {
        q: 'How does LitasDark rotate PDF pages so quickly?',
        a: 'Because the operation only updates metadata integer keys in the document dictionary via WebAssembly rather than re-rendering page contents, processing takes only a fraction of a second.',
      },
      {
        q: 'Are my rotated files uploaded to any server?',
        a: 'No. All processing happens entirely within your web browser memory on your own computer.',
      },
      {
        q: 'Can I rotate a single page in a multi-page document?',
        a: 'Yes. You can configure whether rotation applies to the entire document or specific target pages.',
      },
    ],
    relatedToolSlugs: ['dark-mode-pdf', 'extract-pdf', 'images-to-pdf'],
  },

  'compress-pdf': {
    toolId: 5,
    slug: 'compress-pdf',
    title: 'Compress PDF Online - Reduce PDF File Size Locally | LitasDark',
    h1: 'Compress PDF Documents Online',
    subtitle:
      'Optimize PDF document structures, deflate uncompressed streams, and reduce file sizes directly in your browser.',
    metaDescription:
      'Optimize PDF file size in your browser by removing redundant structural objects and metadata. Transparent in-memory processing without third-party uploads.',
    metaKeywords:
      'compress pdf, optimize pdf, reduce pdf size, shrink pdf file free, fast pdf optimizer, private pdf compression',
    howItWorksOverview:
      'The PDF Compressor utilizes a hybrid classification pipeline running in a dedicated Web Worker (`optimizer.worker.ts`). When you upload a PDF, the engine inspects the operator stream to determine if the document is text/vector-heavy or image-heavy. For vector and text documents, it applies Flate stream deflation and strips unreferenced orphan objects losslessly. For scanned or image-heavy PDFs, it downsamples embedded raster streams with controlled JPEG compression. Crucially, a strict Size Safety Guard compares the output against the original file: if optimization does not produce a smaller file, the engine preserves your exact original file bytes and marks it as Already Optimized.',
    steps: [
      {
        stepNumber: 1,
        title: 'Select PDF to Optimize',
        description: 'Drop your PDF document into the compression workspace. It is parsed locally in browser RAM.',
      },
      {
        stepNumber: 2,
        title: 'Smart Optimization Execution',
        description: 'The background Web Worker classifies document streams, deflates vector streams, and optimizes image object tables.',
      },
      {
        stepNumber: 3,
        title: 'Review Size Savings & Download',
        description: 'Inspect the exact byte savings percentage and download your optimized PDF directly.',
      },
    ],
    features: [
      {
        title: 'Hybrid Classification Engine',
        description: 'Automatically distinguishes between text/vector documents and scanned image PDFs to apply the optimal compression strategy.',
      },
      {
        title: 'Lossless Flate Stream Deflation',
        description: 'Applies standard Flate compression algorithms to structural text streams and cross-reference object tables.',
      },
      {
        title: 'Strict Size Safety Guard',
        description: 'Guarantees that your PDF will never grow in size. If optimization produces a larger file, your original file is preserved with the label "ALREADY OPTIMIZED".',
      },
      {
        title: 'Zero Server Data Exposure',
        description: 'Optimize confidential contracts, financial spreadsheets, and proprietary reports without uploading them to third-party servers.',
      },
    ],
    technicalDetails: {
      engine: 'Dedicated Web Worker (`optimizer.worker.ts`) combining PDF.js classification with `pdf-lib` stream compaction and 12M pixel safety cap',
      memoryLifecycle: 'Rebuilds document cross-reference tables in volatile browser memory; revokes Blob URLs upon reset',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Optimized PDF Document (.pdf)',
      limitations: [
        'PDFs that consist entirely of pre-compressed high-density JPEG scans may yield modest reductions. If the optimized output is not smaller, LitasDark keeps your original file intact.',
        'Extremely large scanned documents (>200MB) may take several seconds to process depending on device CPU speed.',
      ],
    },
    useCases: [
      {
        title: 'Email Attachment Size Limits',
        scenario: 'Shrink project proposals, presentations, and portfolios to fit under strict corporate 20MB email attachment caps.',
      },
      {
        title: 'Web Publishing & Portal Uploads',
        scenario: 'Optimize government, academic, or court portal submissions that enforce maximum file size thresholds.',
      },
      {
        title: 'Local Storage Cleanup',
        scenario: 'Clean up oversized presentation exports and report drafts before archiving on local backup drives.',
      },
    ],
    faqs: [
      {
        q: 'Why do some PDFs shrink significantly while others show "ALREADY OPTIMIZED"?',
        a: 'PDFs generated from software like Microsoft Word, PowerPoint, or CAD programs contain uncompressed structural text streams and orphan objects that compress dramatically. In contrast, PDFs that consist entirely of pre-compressed JPEG images already have minimal redundant data. When no size reduction is achieved, LitasDark preserves your original file untouched.',
      },
      {
        q: 'Will compressing my PDF make the text blurry or lower quality?',
        a: 'No. Vector text, TrueType fonts, and mathematical diagrams are preserved with vector sharpness intact during structural optimization.',
      },
      {
        q: 'What happens if optimization produces a file that is larger than the original?',
        a: 'LitasDark includes an automatic Size Safety Guard. If re-encoding or stream rebuilding produces a larger file byte size, the engine rejects the output, keeps your exact original document bytes, and displays the "ALREADY OPTIMIZED" badge.',
      },
      {
        q: 'Are my files sent to an external server to be compressed?',
        a: 'No. The optimization algorithm runs locally on your computer inside a Web Worker thread within your web browser.',
      },
      {
        q: 'Is there a file size or daily compression limit?',
        a: 'No. There are no daily usage caps, hourly limits, or paywalls on LitasDark.',
      },
    ],
    relatedToolSlugs: ['merge-pdf', 'split-pdf', 'cleanse-metadata'],
  },

  'extract-pdf': {
    toolId: 6,
    slug: 'extract-pdf',
    title: 'Extract PDF Pages Online - Pull Specific Pages Free | LitasDark',
    h1: 'Extract Pages from PDF Online',
    subtitle:
      'Select and export individual target pages or custom page lists into a clean, standalone PDF document.',
    metaDescription:
      'Select and extract individual pages or custom ranges from any PDF into a new document. Processed locally in your browser.',
    metaKeywords:
      'extract pdf pages, pull pages from pdf, save specific pages pdf, export pdf pages free, private pdf extractor',
    howItWorksOverview:
      'The Page Extractor allows you to cherry-pick non-consecutive individual pages (such as pages 1, 3, 7, and 12) or custom page selections from a PDF document. Using the WebAssembly engine (`pdf.worker.ts`), the browser receives your array of 1-based page indices, maps them to zero-based dictionary pointers, isolates the selected page objects along with their required font resources and graphic states, and exports a clean, standalone PDF file containing only those selected pages.',
    steps: [
      {
        stepNumber: 1,
        title: 'Load Source PDF',
        description: 'Drop or select your PDF file in the workspace area. It opens locally in device memory.',
      },
      {
        stepNumber: 2,
        title: 'Specify Page Numbers',
        description: 'Enter the exact individual page numbers (e.g. 1, 3, 5-8) you wish to pull into the new document.',
      },
      {
        stepNumber: 3,
        title: 'Extract and Download',
        description: 'Click Extract Pages. The WebAssembly engine constructs the new PDF stream in RAM for immediate download.',
      },
    ],
    features: [
      {
        title: 'Non-Consecutive Page Extraction',
        description: 'Cherry-pick individual non-adjacent pages or custom page lists into a single new output document.',
      },
      {
        title: 'Resource & Font Isolation',
        description: 'Copies only the specific embedded fonts, vector assets, and graphic states required by the extracted pages.',
      },
      {
        title: 'Original File Safety',
        description: 'Your source file on your computer remains untouched; extraction generates a separate new document.',
      },
      {
        title: 'In-Browser WebAssembly Execution',
        description: 'Extract pages in milliseconds off the main thread with zero server uploads or cloud queue delays.',
      },
    ],
    technicalDetails: {
      engine: 'Rust / WebAssembly PDF engine executing `extractPages()` in background Web Worker (`pdf.worker.ts`)',
      memoryLifecycle: 'Allocates memory in browser RAM strictly for selected page indices, purged upon workspace reset',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Extracted PDF Document (.pdf)',
      limitations: [
        'Document-level JavaScript or interactive form actions referencing omitted pages are pruned.',
        'Password-protected documents must be unlocked before individual pages can be extracted.',
      ],
    },
    useCases: [
      {
        title: 'Extracting Invoice & Receipt Pages',
        scenario: 'Save the summary invoice page from a 100-page accounting ledger to email to your finance department.',
      },
      {
        title: 'Sharing Key Presentation Slides',
        scenario: 'Pull 3 key slides from an 80-slide corporate presentation deck to include in an executive briefing.',
      },
      {
        title: 'Extracting Academic Figures & References',
        scenario: 'Save specific diagram and bibliography pages from a dense textbook for study review.',
      },
    ],
    faqs: [
      {
        q: 'Can I extract non-consecutive pages (e.g., page 2 and page 8)?',
        a: 'Yes. Unlike Split PDF (which takes a continuous range), Extract Pages allows you to specify individual, non-consecutive page numbers to combine into your new PDF document.',
      },
      {
        q: 'Does page extraction change the layout or formatting of the pages?',
        a: 'No. Extracted pages retain their exact visual layout, fonts, colors, and embedded illustrations with 100% vector fidelity.',
      },
      {
        q: 'Are my extracted pages stored on your server?',
        a: 'No. Everything is processed locally in your browser memory via WebAssembly. Zero bytes are uploaded or stored on any server.',
      },
      {
        q: 'What is the difference between Split PDF and Extract Pages?',
        a: 'Split PDF isolates a continuous block of pages (e.g., pages 10 to 25), whereas Extract Pages is designed for cherry-picking specific non-consecutive pages or custom selections.',
      },
      {
        q: 'Does this tool work on mobile devices?',
        a: 'Yes. You can use the extractor directly in mobile Chrome, Safari, Firefox, or Edge without installing an app.',
      },
    ],
    relatedToolSlugs: ['split-pdf', 'merge-pdf', 'rotate-pdf'],
  },

  'cleanse-metadata': {
    toolId: 7,
    slug: 'cleanse-metadata',
    title: 'Clean PDF Metadata Online - Remove Document Info & Tags | LitasDark',
    h1: 'Cleanse PDF Document Metadata',
    subtitle:
      'Inspect and strip author names, software creators, editing timestamps, and producer tags from PDF documents directly in your browser.',
    metaDescription:
      'Inspect and strip author names, software creators, editing timestamps, and producer tags from PDF documents directly in your browser.',
    metaKeywords:
      'clean metadata pdf, scrub pdf metadata, remove author from pdf, strip pdf metadata online, pdf privacy tool, sanitize pdf info',
    howItWorksOverview:
      'When you create or edit a PDF using software like Microsoft Word, Adobe InDesign, or macOS Preview, the application automatically embeds hidden Document Information Dictionaries and XMP metadata headers. This metadata often reveals your operating system username, full author name, computer file path, software versions, and exact creation and modification timestamps. The Cleanse Metadata tool reads your PDF in browser RAM using `pdf-lib`, wipes the Info dictionary keys (`Title`, `Author`, `Subject`, `Keywords`, `Creator`, `Producer`, `CreationDate`, `ModDate`), and outputs a sanitized PDF file free of hidden author markers.',
    steps: [
      {
        stepNumber: 1,
        title: 'Select PDF Document',
        description: 'Drop or browse for the PDF file you want to sanitize. It is loaded into local browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Inspect & Scrub Metadata',
        description: 'The tool purges all Document Info dictionary fields and resets modification timestamps in RAM.',
      },
      {
        stepNumber: 3,
        title: 'Download Sanitized PDF',
        description: 'Click Download to save the cleansed PDF document free of author and software traces.',
      },
    ],
    features: [
      {
        title: 'Purges Document Info Dictionaries',
        description: 'Removes Author, Title, Subject, Keywords, Creator, and Producer tags from the PDF header.',
      },
      {
        title: 'Resets Modification Timestamps',
        description: 'Wipes internal creation and edit date records that reveal when and where a document was prepared.',
      },
      {
        title: 'Zero Third-Party Data Exposure',
        description: 'Sanitize confidential legal drafts, anonymous academic submissions, and internal company memos locally.',
      },
      {
        title: 'Preserves Visual Document Content',
        description: 'Leaves all visible text, vector drawings, tables, and images intact on every page.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib Document Information Dictionary and XMP metadata stream scrubbing in browser RAM',
      memoryLifecycle: 'Parses and serializes sanitized document in browser RAM with immediate buffer revocation',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Sanitized PDF Document (.pdf)',
      limitations: [
        'Metadata scrubbing purges hidden header properties and file tags. It does NOT redact visible text printed on the page canvas or erase visual black-marker boxes that have unflattened text beneath them.',
        'If a document contains embedded file attachments with their own internal metadata, sanitize those attachments individually.',
      ],
    },
    useCases: [
      {
        title: 'Sanitized Academic Submissions',
        scenario: 'Remove author names, university paths, and editing timestamps from manuscripts before blind peer review submission.',
      },
      {
        title: 'Legal Filings & Settlement Drafts',
        scenario: 'Strip internal law firm computer paths, author tags, and revision histories before sending documents to opposing counsel.',
      },
      {
        title: 'Journalism & Whistleblower Submissions',
        scenario: 'Clean document creation signatures and computer usernames from public records or leaked documents before publication.',
      },
    ],
    faqs: [
      {
        q: 'What specific metadata fields are removed by this tool?',
        a: 'The tool wipes standard PDF Document Information Dictionary fields including Title, Author, Subject, Keywords, Creator, Producer, Creation Date, and Modification Date.',
      },
      {
        q: 'Does cleansing metadata remove visible text or images from my PDF pages?',
        a: 'No. Only hidden document properties and metadata tags in the file header are purged. The visible text and graphics on every page remain completely unchanged.',
      },
      {
        q: 'Is metadata cleansing the same as redacting sensitive text?',
        a: 'No. Metadata scrubbing purges hidden background file properties, not the visible text printed on the page. To redact visible text, a visual redaction tool is required.',
      },
      {
        q: 'Are my sanitized files uploaded to any server?',
        a: 'No. The metadata scrubbing executes locally on your computer inside your web browser memory. No document data is ever transmitted over the internet.',
      },
      {
        q: 'How can I verify that the metadata was removed?',
        a: 'After downloading your sanitized PDF, open it in Adobe Acrobat, Apple Preview, or Chrome, go to File > Properties, and confirm that Author, Title, and Creator fields are empty.',
      },
    ],
    relatedToolSlugs: ['compress-pdf', 'merge-pdf', 'extract-pdf'],
  },

  'images-to-pdf': {
    toolId: 8,
    slug: 'images-to-pdf',
    title: 'Images to PDF Converter - Convert PNG & JPG to PDF Online | LitasDark',
    h1: 'Convert Images to PDF Online',
    subtitle:
      'Compile PNG, JPG, JPEG, and WebP images into standardized PDF documents locally in your browser.',
    metaDescription:
      'Convert PNG, JPG, JPEG, and WebP images into a single PDF document in your browser. Configure page sizes, margins, and preserve image resolution.',
    metaKeywords:
      'images to pdf, jpg to pdf, png to pdf, convert photos to pdf, combine images into pdf free, in-browser image to pdf',
    howItWorksOverview:
      'The Images to PDF compiler reads your selected image files directly into browser RAM using `pdf-lib`. For PNG and JPG files, it extracts raw byte streams and embeds them as native XObject raster resources inside newly created PDF pages. For WebP or non-standard image formats, an in-memory Canvas rendering pipeline normalizes the raster data into a clean embeddable stream. You can customize page dimensions (Fit Image, Standard A4, US Letter) and margin spacing (0, 18pt, 36pt). All compilation happens locally in device memory.',
    steps: [
      {
        stepNumber: 1,
        title: 'Add Image Files',
        description: 'Drop or select one or more PNG, JPG, JPEG, or WebP images into the workspace area.',
      },
      {
        stepNumber: 2,
        title: 'Configure Page Sizing & Margins',
        description: 'Choose your page dimensions (Fit Image, A4, or US Letter) and select margin spacing.',
      },
      {
        stepNumber: 3,
        title: 'Compile and Download PDF',
        description: 'Click Convert to PDF. The browser constructs the PDF stream in RAM for immediate download.',
      },
    ],
    features: [
      {
        title: 'Preserves Native Pixel Resolution',
        description: 'Embeds your images directly into PDF pages without aggressive downsampling or lossy recompression.',
      },
      {
        title: 'Custom Page Dimensions & Margins',
        description: 'Choose between Fit Image (exact photo dimensions), Standard A4, and US Letter with configurable margin spacing.',
      },
      {
        title: 'Multi-Format Image Support',
        description: 'Supports PNG, JPG, JPEG, and WebP images with automatic in-memory format normalization.',
      },
      {
        title: 'Client-Side Local Privacy',
        description: 'Convert sensitive identity cards, receipts, and personal photos without uploading them to remote cloud servers.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib native XObject embedding with HTML5 Canvas normalization fallback in browser RAM',
      memoryLifecycle: 'Image ArrayBuffers are processed in browser RAM and garbage collected after download or workspace reset',
      supportedFormats: ['PNG (.png)', 'JPEG / JPG (.jpg, .jpeg)', 'WebP (.webp)'],
      outputFormat: 'Standardized PDF Document (.pdf)',
      limitations: [
        'Total output PDF file size reflects the combined byte size of the input image files.',
        'Animated GIF frames or vector SVG files should be converted to PNG before compiling.',
      ],
    },
    useCases: [
      {
        title: 'Document Scanner Photo Compilation',
        scenario: 'Combine smartphone photos of receipts, signed contract pages, or whiteboard notes into a single neat PDF file.',
      },
      {
        title: 'Design Portfolios & Photography',
        scenario: 'Compile high-resolution graphic design mockups and photo sequences into an easily shareable presentation PDF.',
      },
      {
        title: 'Identity Verification & Onboarding',
        scenario: 'Package ID card front and back photos into a single PDF document for official submissions without third-party cloud uploads.',
      },
    ],
    faqs: [
      {
        q: 'Does converting images to PDF reduce their visual quality?',
        a: 'No. The compiler embeds your images at their native pixel dimensions without downsampling or applying lossy compression filters.',
      },
      {
        q: 'Which image formats are supported?',
        a: 'You can upload PNG, JPG, JPEG, and WebP image files. All supported formats are normalized seamlessly in browser memory.',
      },
      {
        q: 'Can I choose standard page sizes like A4 or US Letter?',
        a: 'Yes. You can select Fit Image (which matches the exact pixel dimensions of each photo), Standard A4, or US Letter, with optional margin spacing (None, Small, Medium).',
      },
      {
        q: 'Are my personal photos uploaded to any server?',
        a: 'No. The image compilation takes place locally on your computer inside your web browser. No image data is transmitted across the internet.',
      },
      {
        q: 'Can I add multiple photos and arrange their order?',
        a: 'Yes. You can upload multiple images simultaneously and they will be compiled in sequence into a multi-page PDF document.',
      },
    ],
    relatedToolSlugs: ['compress-pdf', 'merge-pdf', 'dark-mode-pdf'],
  },
};

export function getToolGuideBySlug(slug: string): ToolGuideData | undefined {
  return TOOL_GUIDES[slug];
}

export function getToolGuideById(id: number): ToolGuideData | undefined {
  return Object.values(TOOL_GUIDES).find((g) => g.toolId === id);
}
