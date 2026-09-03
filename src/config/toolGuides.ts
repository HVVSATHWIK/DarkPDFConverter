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
      'Convert bright white PDFs into dark mode, OLED black, or sepia reading themes. Processed locally in your browser without altering your original files.',
    metaKeywords:
      'dark mode pdf converter, invert pdf colors, pdf dark theme, night reading pdf, black background pdf, oled dark pdf, sepia pdf',
    howItWorksOverview:
      'The Dark Mode Inverter processes PDF pages directly within your browser using WebGL and Canvas color transformation matrices. It recalculates the luminance values of vector backgrounds and text layers, inverting bright whites into dark tones while maintaining typography contrast. Embedded raster images and charts are also processed through color-mapping filters. Because all rendering occurs in your browser RAM, your original PDF on disk remains completely untouched.',
    steps: [
      {
        stepNumber: 1,
        title: 'Choose or Drop Your PDF',
        description:
          'Select a PDF from your device or drag and drop it into the workspace. The file is loaded exclusively into local browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Select Theme & Contrast',
        description:
          'Choose your preferred reading palette: OLED Black for maximum contrast, Dark Slate for balanced viewing, or Sepia Warm for reduced blue light.',
      },
      {
        stepNumber: 3,
        title: 'Preview and Download',
        description:
          'Inspect the real-time preview of the converted pages. Click Download Result to save the dark mode PDF to your computer.',
      },
    ],
    features: [
      {
        title: 'Multiple Reading Palettes',
        description:
          'Switch between OLED Pure Black, Dark Slate Charcoal, Sepia Warm Tone, and High-Contrast Inversion.',
      },
      {
        title: 'Zero Server Transmission',
        description:
          'Page rendering and color transformations execute in local WebAssembly and Canvas buffers without sending data across the network.',
      },
      {
        title: 'Real-Time Interactive Preview',
        description:
          'Inspect individual pages with zoom and pan controls before finalizing the converted document.',
      },
      {
        title: 'Preserves Original Files',
        description:
          'Your source document is never overwritten; conversions generate fresh, standalone PDF downloads.',
      },
    ],
    technicalDetails: {
      engine: 'Client-side PDF.js rendering pipeline with WebGL/Canvas luminance inversion filters',
      memoryLifecycle: 'Document buffers reside in volatile browser RAM and are released when the tab is closed',
      supportedFormats: ['Standard PDF documents (.pdf)', 'Text-based PDFs', 'Scanned image PDFs'],
      outputFormat: 'PDF (.pdf) with inverted color raster/vector rendering',
      limitations: [
        'Raster images embedded within the PDF undergo color filtering alongside vector text.',
        'Scanned documents consisting purely of low-resolution image bitmaps are inverted as whole images.',
        'Very large documents (100+ pages) may take several seconds to process depending on your computer hardware.',
      ],
    },
    useCases: [
      {
        title: 'Late-Night Academic Research',
        scenario: 'Read textbooks, research papers, and lecture notes in low-light environments without screen glare.',
      },
      {
        title: 'Software Documentation & Code Reading',
        scenario: 'Match PDF manuals and API reference guides to your dark-themed IDE workspace.',
      },
      {
        title: 'E-Reader and OLED Tablet Optimization',
        scenario: 'Save battery life and reduce eye fatigue when reading technical manuals on OLED mobile screens.',
      },
    ],
    faqs: [
      {
        q: 'Does this tool modify or overwrite my original PDF file?',
        a: 'No. The converter reads your file into temporary browser memory and generates a new, separate PDF file for you to download. Your original file remains completely unchanged on your computer.',
      },
      {
        q: 'Are my document contents uploaded to any cloud server?',
        a: 'No. All color inversion calculations execute entirely in your browser using client-side JavaScript, Canvas, and WebAssembly. Zero bytes of document data are transmitted over the internet.',
      },
      {
        q: 'What happens to embedded photos and color diagrams in dark mode?',
        a: 'The color matrix inverts luminance across the page canvas. Photos and diagrams are filtered to maintain readable contrast against dark backgrounds.',
      },
      {
        q: 'Can I reverse a converted PDF back to light mode?',
        a: 'Because the original file on your computer is never modified, you can simply keep your original document. If needed, running the dark PDF through the inverter again will re-invert the colors.',
      },
      {
        q: 'Is there a page count limit for dark mode conversion?',
        a: 'There is no arbitrary server page limit. The only constraint is your computer’s available memory and processor speed.',
      },
    ],
    relatedToolSlugs: ['merge-pdf', 'compress-pdf', 'cleanse-metadata', 'split-pdf'],
  },

  'merge-pdf': {
    toolId: 2,
    slug: 'merge-pdf',
    title: 'Merge PDF Online - Combine Multiple PDF Files Free | LitasDark',
    h1: 'Merge PDF Files Online',
    subtitle:
      'Combine multiple PDF documents and chapters into a single file in seconds, entirely in your browser memory.',
    metaDescription:
      'Combine multiple PDF documents into a single file locally in your browser. Reorder files, preserve bookmarks, and merge without uploading files to a server.',
    metaKeywords:
      'merge pdf, combine pdf files, join pdf online free, merge pdf no upload, client side pdf merge, combine pdf documents',
    howItWorksOverview:
      'The PDF Merger uses the client-side pdf-lib library to load multiple PDF byte streams directly into device RAM. It parses the internal cross-reference tables, object dictionaries, and page trees of each selected file. It then copies the specified page objects in your chosen sequence into a newly constructed PDF document and writes the combined byte stream for immediate download. No files are uploaded to any external server during this operation.',
    steps: [
      {
        stepNumber: 1,
        title: 'Select Multiple PDF Files',
        description:
          'Click to browse or drop two or more PDF files into the workspace area. All files are loaded locally into browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Confirm File Order',
        description:
          'Verify that your files are listed in the exact sequence you want them to appear in the combined document.',
      },
      {
        stepNumber: 3,
        title: 'Merge and Download',
        description:
          'Click Merge Selected PDFs. The browser merges the document streams in RAM and provides a direct download link.',
      },
    ],
    features: [
      {
        title: 'Client-Side Stream Merging',
        description:
          'Combines document trees locally without network upload delays or third-party storage queues.',
      },
      {
        title: 'Preserves Vector Typography',
        description:
          'Maintains embedded fonts, vector shapes, lines, and bookmarks from each source document without rasterization.',
      },
      {
        title: 'Multi-File Batch Queue',
        description:
          'Load multiple reports, invoices, or chapters simultaneously and process them in a single batch operation.',
      },
      {
        title: 'Zero File Size Paywalls',
        description:
          'No artificial limits on the number of documents or total file sizes, bounded only by your browser hardware RAM.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib in-memory PDF document object model manipulation',
      memoryLifecycle: 'Raw Uint8Array buffers exist in browser heap memory during compilation and are garbage collected upon completion',
      supportedFormats: ['Standard PDF documents (.pdf) version 1.3 through 1.7', 'PDF/A archives'],
      outputFormat: 'Standardized merged PDF (.pdf)',
      limitations: [
        'Password-protected PDFs must be decrypted before merging.',
        'Extremely large multi-gigabyte document batches may experience memory constraints on low-RAM mobile devices.',
        'Interactive PDF forms (AcroForms) with conflicting field names across documents may have duplicate field identifiers unified.',
      ],
    },
    useCases: [
      {
        title: 'Legal Briefs & Exhibits',
        scenario: 'Assemble court filings, exhibits, declarations, and cover sheets into a single unified legal document.',
      },
      {
        title: 'Financial Reports & Invoices',
        scenario: 'Consolidate monthly receipts, bank statements, and tax declarations into an annual audit bundle.',
      },
      {
        title: 'Academic Thesis Compilation',
        scenario: 'Join front matter, individual research chapters, appendices, and bibliographies into a complete manuscript.',
      },
    ],
    faqs: [
      {
        q: 'How many PDF files can I merge at once?',
        a: 'You can merge as many PDF files as your computer’s memory can comfortably hold. Because processing happens locally rather than on a remote server, there are no artificial batch limits.',
      },
      {
        q: 'Does merging compress or reduce the visual quality of my pages?',
        a: 'No. The merging engine copies the underlying vector paths, text objects, and image XObjects directly from the source documents without re-encoding or compressing them.',
      },
      {
        q: 'Can I merge encrypted or password-protected PDFs?',
        a: 'Encrypted PDFs require decryption before their internal page streams can be read and merged by the browser engine.',
      },
      {
        q: 'Are any of my merged documents sent over the internet?',
        a: 'Never. All merging is performed locally in your browser memory via JavaScript. No document bytes leave your device.',
      },
      {
        q: 'What happens if two documents have different page orientations or sizes?',
        a: 'Each page retains its original orientation, width, and height. Portrait and landscape pages coexist seamlessly in the merged output.',
      },
    ],
    relatedToolSlugs: ['split-pdf', 'compress-pdf', 'cleanse-metadata', 'images-to-pdf'],
  },

  'split-pdf': {
    toolId: 3,
    slug: 'split-pdf',
    title: 'Split PDF Online - Separate PDF Pages Free | LitasDark',
    h1: 'Split PDF Pages Online',
    subtitle:
      'Extract custom page ranges or divide large PDF documents into smaller files directly in your browser.',
    metaDescription:
      'Extract page ranges or split a PDF into smaller documents in your browser. No server uploads, unconstrained by artificial server limits, and fast local processing.',
    metaKeywords:
      'split pdf, separate pdf pages, extract pages from pdf, cut pdf online free, split pdf without uploading, divide pdf',
    howItWorksOverview:
      'The PDF Splitter reads your document into browser RAM using pdf-lib. When you specify a target page range (such as pages 5 through 12), the engine instantiates a clean PDF document, copies the dictionary references and stream data for the selected pages, and outputs a new standalone PDF file containing only those pages. Your original document is not modified.',
    steps: [
      {
        stepNumber: 1,
        title: 'Upload Your PDF',
        description: 'Drop or browse for the PDF document you want to split. The file opens locally in your browser.',
      },
      {
        stepNumber: 2,
        title: 'Specify Page Range',
        description: 'Enter the start page and end page numbers for the section you want to extract.',
      },
      {
        stepNumber: 3,
        title: 'Split and Save',
        description: 'Click Split PDF. The browser extracts the designated pages and provides a direct download.',
      },
    ],
    features: [
      {
        title: 'Precise Range Selection',
        description: 'Extract any continuous page range from a single page to hundreds of pages in one operation.',
      },
      {
        title: 'In-Memory Extraction',
        description: 'Separates document pages in milliseconds using local WebAssembly without network latency.',
      },
      {
        title: 'Preserves Font Subsets',
        description: 'Embedded fonts and vector elements needed for the extracted pages are cleanly copied into the new file.',
      },
      {
        title: 'Strict Local Privacy',
        description: 'Your sensitive contracts, statements, or medical files are processed entirely on your local machine.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib page dictionary copying and object graph isolation',
      memoryLifecycle: 'Allocates memory only for the selected page indices in volatile client RAM',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Extracted PDF document (.pdf)',
      limitations: [
        'Interactive bookmarks pointing outside the extracted page range are stripped.',
        'Password-protected documents must be unlocked before splitting.',
      ],
    },
    useCases: [
      {
        title: 'Extracting Specific Contract Sections',
        scenario: 'Isolate signature pages or specific schedules from long legal agreements to share with stakeholders.',
      },
      {
        title: 'Dividing Large Scanned Manuals',
        scenario: 'Break 500-page operational manuals into individual chapter-sized files for easier email distribution.',
      },
      {
        title: 'Isolating Financial Statements',
        scenario: 'Extract a single monthly statement from a multi-year consolidated bank account report.',
      },
    ],
    faqs: [
      {
        q: 'Does splitting a PDF lower the text sharpness or image quality?',
        a: 'No. The splitting process copies the raw PDF object definitions directly into the new file without rasterizing or recompressing them.',
      },
      {
        q: 'Can I split a single page out of a large document?',
        a: 'Yes. Simply set both the start page and end page to the same number (e.g., Start: 4, End: 4).',
      },
      {
        q: 'Will my original document be altered when I split it?',
        a: 'No. The original file on your computer remains untouched. The split operation produces a new, separate file.',
      },
      {
        q: 'Is there a limit on how many pages the source PDF can have?',
        a: 'No fixed limit exists beyond your browser’s available memory.',
      },
      {
        q: 'Do you store any copy of my split PDF on a server?',
        a: 'No. LitasDark is a client-side web utility. Zero files are uploaded or stored on any server.',
      },
    ],
    relatedToolSlugs: ['merge-pdf', 'extract-pdf', 'compress-pdf', 'cleanse-metadata'],
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
      'The Rotate PDF tool adjusts the `/Rotate` attribute within the target PDF page dictionary objects. In the PDF specification, page rotation is defined as an integer angle (0, 90, 180, or 270 degrees clockwise). Because this operation only modifies orientation metadata, the underlying content streams, images, and fonts are preserved with high fidelity without re-rendering or compression degradation.',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Your PDF File',
        description: 'Drag and drop your PDF into the tool workspace. It loads immediately into local browser memory.',
      },
      {
        stepNumber: 2,
        title: 'Choose Rotation Angle',
        description: 'Select 90° Clockwise, 180° Inversion, or 270° Counter-Clockwise, and choose whether to apply it to all pages or specific pages.',
      },
      {
        stepNumber: 3,
        title: 'Apply and Download',
        description: 'The browser updates the rotation metadata. Click Download to save the corrected PDF.',
      },
    ],
    features: [
      {
        title: 'Zero Recompression Loss',
        description: 'Modifies internal rotation dictionaries without altering raster image streams or vector paths.',
      },
      {
        title: 'Permanent Orientation Fix',
        description: 'The updated rotation is saved into the PDF file structure, so it displays correctly across all PDF viewers and printers.',
      },
      {
        title: 'All Pages or Selective Target',
        description: 'Rotate all pages at once or adjust specific landscape/portrait orientation mismatches.',
      },
      {
        title: 'In-Browser Local Privacy',
        description: 'No files are sent across the internet, protecting private scans and confidential forms.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib page dictionary `/Rotate` attribute modification',
      memoryLifecycle: 'Fast in-place metadata patch in volatile browser memory',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Permanently rotated PDF document (.pdf)',
      limitations: [
        'If a PDF contains an image that was scanned crookedly at an irregular angle (e.g., 3.5 degrees), standard 90° increments will align it to the nearest quadrant but will not perform deskewing.',
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
        title: 'Mobile Document Scanner Cleanup',
        scenario: 'Fix orientation on smartphone receipts or contract photos before submitting for reimbursement.',
      },
    ],
    faqs: [
      {
        q: 'Is this rotation permanent when opened in Adobe Acrobat or mobile viewers?',
        a: 'Yes. The rotation angle is written directly into the PDF standard page dictionary, ensuring it opens in the correct orientation in all PDF readers, mobile devices, and print dialogs.',
      },
      {
        q: 'Does rotating a PDF degrade image or text quality?',
        a: 'No. Rotating only updates a metadata flag inside the PDF file. It does not re-encode or compress any text or images.',
      },
      {
        q: 'Can I rotate just one page in a multi-page document?',
        a: 'Yes. You can configure whether rotation applies to the entire document or specific target pages.',
      },
      {
        q: 'Are my rotated files uploaded to any server?',
        a: 'No. All processing happens entirely within your web browser on your own computer.',
      },
      {
        q: 'How fast is the rotation process?',
        a: 'Because it only updates dictionary metadata, rotation is fast, taking only a fraction of a second.',
      },
    ],
    relatedToolSlugs: ['merge-pdf', 'split-pdf', 'compress-pdf', 'cleanse-metadata'],
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
      'The PDF Compressor analyzes the internal object tree of your PDF in browser memory. It identifies orphan objects, unreferenced dictionary entries, and duplicate embedded metadata. It applies standard Flate/Deflate stream compression algorithms to structural content streams without aggressive lossy image downsampling. This makes it ideal for shrinking vector-heavy presentations, reports, and CAD exports without degrading diagram sharpness.',
    steps: [
      {
        stepNumber: 1,
        title: 'Select PDF to Optimize',
        description: 'Drop your PDF document into the compression workspace. It is parsed in local browser RAM.',
      },
      {
        stepNumber: 2,
        title: 'Process In-Memory Optimization',
        description: 'The engine deflates structural streams, removes redundant object references, and re-indexes the cross-reference table.',
      },
      {
        stepNumber: 3,
        title: 'Review and Download',
        description: 'Compare the resulting file size and download the optimized PDF document directly.',
      },
    ],
    features: [
      {
        title: 'Structural Stream Deflation',
        description: 'Applies Flate compression to uncompressed text streams and structural PDF object tables.',
      },
      {
        title: 'Orphan Object Removal',
        description: 'Purges unreferenced font subsets, unused annotation dictionaries, and detached metadata.',
      },
      {
        title: 'Preserves Visual Fidelity',
        description: 'Does not destroy diagram sharpness or introduce severe JPEG compression artifacts into vector illustrations.',
      },
      {
        title: 'Zero Cloud Exposure',
        description: 'Optimize confidential contracts, financial spreadsheets, and proprietary reports without uploading them to third-party servers.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib object tree compaction and Flate stream deflation',
      memoryLifecycle: 'Rebuilds document cross-reference table in volatile browser memory',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Optimized PDF document (.pdf)',
      limitations: [
        'If a PDF consists entirely of already-compressed JPEG image scans, structural optimization will yield modest reductions (typically 2% to 15%). Vector-dense, presentation, and text-heavy PDFs typically achieve much higher savings.',
        'Extremely large scanned files (>200MB) may take several seconds to process depending on device CPU.',
      ],
    },
    useCases: [
      {
        title: 'Email Attachment Size Limits',
        scenario: 'Shrink project proposals and portfolios to fit under strict corporate 20MB email attachment caps.',
      },
      {
        title: 'Web Publishing & Portal Uploads',
        scenario: 'Optimize government, academic, or court portal submissions that enforce maximum file size thresholds.',
      },
      {
        title: 'Storage Optimization',
        scenario: 'Clean up oversized presentation exports before archiving on local backup drives.',
      },
    ],
    faqs: [
      {
        q: 'Why do some PDFs shrink significantly while others shrink only a little?',
        a: 'PDFs created from software like Microsoft Word, PowerPoint, or CAD software often contain uncompressed structural streams and redundant objects that compress significantly. In contrast, scanned documents that already contain compressed JPEG images have less redundant structural data to eliminate.',
      },
      {
        q: 'Will compressing my PDF make the text blurry?',
        a: 'No. Vector text, true type fonts, and mathematical lines are preserved with vector quality intact during structural optimization.',
      },
      {
        q: 'Are my files sent to an external server to be compressed?',
        a: 'No. The optimization algorithm runs locally on your computer inside your web browser.',
      },
      {
        q: 'Is there a limit on how many PDFs I can compress per day?',
        a: 'No. There are no hourly or daily usage caps on LitasDark.',
      },
      {
        q: 'Does compression remove my passwords or signatures?',
        a: 'Encrypted or cryptographically signed PDFs must not be modified as altering byte streams invalidates digital signature hashes.',
      },
    ],
    relatedToolSlugs: ['merge-pdf', 'cleanse-metadata', 'dark-mode-pdf', 'split-pdf'],
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
      'The Page Extractor allows you to cherry-pick individual pages (such as pages 1, 3, and 7) or custom sets from a PDF document. The in-browser engine parses the document page catalog, isolates the selected page dictionaries along with their required font resources and graphic states, and writes a new standalone PDF containing only those selected pages.',
    steps: [
      {
        stepNumber: 1,
        title: 'Load Source PDF',
        description: 'Drop or select your PDF file in the workspace area. It opens locally in device memory.',
      },
      {
        stepNumber: 2,
        title: 'Select Target Page Numbers',
        description: 'Specify the exact page numbers you wish to extract into the new document.',
      },
      {
        stepNumber: 3,
        title: 'Generate Extracted PDF',
        description: 'Click Extract Pages to create and download your new document containing only the chosen pages.',
      },
    ],
    features: [
      {
        title: 'Selective Page Extraction',
        description: 'Pull individual non-consecutive pages or custom page groups into a single output file.',
      },
      {
        title: 'Font & Resource Isolation',
        description: 'Copies only the embedded fonts and graphic resources required by the extracted pages.',
      },
      {
        title: 'Original File Safety',
        description: 'Your source file on your computer remains untouched; extraction creates a separate new document.',
      },
      {
        title: 'Full Local Confidentiality',
        description: 'Extract confidential clauses or medical records without uploading documents to remote cloud storage.',
      },
    ],
    technicalDetails: {
      engine: 'pdf-lib selective page catalog copying',
      memoryLifecycle: 'Allocates memory in browser RAM strictly for selected pages',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Extracted PDF document (.pdf)',
      limitations: [
        'Document-level JavaScript or interactive actions referencing omitted pages are pruned.',
      ],
    },
    useCases: [
      {
        title: 'Extracting Invoice Cover Pages',
        scenario: 'Save the summary invoice page from a 100-page accounting ledger to email to an accounting team.',
      },
      {
        title: 'Sharing Key Presentation Slides',
        scenario: 'Pull 3 key slides from an 80-slide corporate presentation deck to include in an executive briefing.',
      },
      {
        title: 'Extracting Academic Figures',
        scenario: 'Save specific diagram and reference pages from a dense textbook for study review.',
      },
    ],
    faqs: [
      {
        q: 'Can I extract non-consecutive pages (e.g., page 2 and page 8)?',
        a: 'Yes. You can specify individual page numbers to be combined into the new output document.',
      },
      {
        q: 'Does page extraction change the layout or formatting of the pages?',
        a: 'No. Extracted pages retain their exact visual layout, fonts, colors, and embedded illustrations.',
      },
      {
        q: 'Are my extracted pages stored on your server?',
        a: 'No. Everything is processed locally in your browser memory. We never receive or store any of your files.',
      },
      {
        q: 'What is the difference between Split PDF and Extract Pages?',
        a: 'Split PDF is typically used for continuous ranges (e.g., pages 10 to 25), while Extract Pages is designed for cherry-picking specific pages or custom selections.',
      },
      {
        q: 'Does this tool work on mobile devices?',
        a: 'Yes. You can use the extractor directly in mobile Chrome, Safari, Firefox, or Edge without installing an app.',
      },
    ],
    relatedToolSlugs: ['split-pdf', 'merge-pdf', 'compress-pdf', 'cleanse-metadata'],
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
      'When you create or edit a PDF using software like Microsoft Word, Adobe InDesign, or macOS Preview, the application automatically embeds hidden Document Information Dictionaries and XMP metadata streams. This metadata often includes your operating system username, full author name, computer file path, software versions, and exact creation and modification timestamps. The Cleanse Metadata tool inspects your PDF in browser RAM, wipes these Info dictionary keys (`Title`, `Author`, `Subject`, `Keywords`, `Creator`, `Producer`, `CreationDate`, `ModDate`), and outputs a sanitized PDF file with no hidden author markers.',
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
        title: 'Clears Modification Timestamps',
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
      engine: 'pdf-lib Document Information Dictionary and XMP metadata stream scrubbing',
      memoryLifecycle: 'Parses and serializes sanitized document in browser RAM with immediate buffer revocation',
      supportedFormats: ['Standard PDF documents (.pdf)'],
      outputFormat: 'Sanitized PDF document (.pdf)',
      limitations: [
        'Metadata scrubbing removes document properties and header tags. It does NOT redact visible text printed on the page canvas or erase visual black-marker boxes that have unflattened text beneath them.',
        'If a document contains embedded file attachments with their own internal metadata, sanitize attachments individually.',
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
        a: 'The tool wipes the standard PDF Document Information Dictionary fields including Title, Author, Subject, Keywords, Creator, Producer, Creation Date, and Modification Date.',
      },
      {
        q: 'Does cleansing metadata remove visible text or images from my PDF?',
        a: 'No. Only hidden document properties and metadata tags are purged. The visual content on every page remains completely unchanged.',
      },
      {
        q: 'Can removing metadata be used to redact secret information from the page text?',
        a: 'No. Metadata scrubbing purges hidden file properties, not the visual text printed on the page. To redact visible text, a visual redaction tool is required.',
      },
      {
        q: 'Are my sanitized files uploaded to any server?',
        a: 'No. The metadata scrubbing executes locally on your computer inside your web browser. No document data is ever transmitted.',
      },
      {
        q: 'How can I verify that the metadata was removed?',
        a: 'After downloading your sanitized PDF, you can open it in Adobe Acrobat, Apple Preview, or Chrome, go to File > Properties, and confirm that Author, Title, and Creator fields are empty.',
      },
    ],
    relatedToolSlugs: ['dark-mode-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf'],
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
      'The Images to PDF compiler reads your selected image files directly into browser RAM. For standard PNG and JPG files, it extracts the raw image byte stream and embeds it as a native XObject into a newly instantiated PDF page using pdf-lib. For WebP or non-standard image formats, an in-memory Canvas rendering pipeline translates the raster data into a clean embeddable stream. You can customize page dimensions (Fit Image, A4, US Letter) and margin widths (0, 18pt, 36pt). All compilation happens locally in your device memory.',
    steps: [
      {
        stepNumber: 1,
        title: 'Add Image Files',
        description: 'Drop or select one or more PNG, JPG, JPEG, or WebP images into the workspace area.',
      },
      {
        stepNumber: 2,
        title: 'Configure Page Sizing & Margins',
        description: 'Choose your page dimensions (Fit Image, A4, or US Letter) and select a border margin if desired.',
      },
      {
        stepNumber: 3,
        title: 'Compile and Download',
        description: 'Click Compile Images to PDF. The browser constructs the PDF stream in RAM for direct download.',
      },
    ],
    features: [
      {
        title: 'Preserves Original Pixel Resolution',
        description: 'Embeds your images directly without aggressive server-side downsampling or lossy compression.',
      },
      {
        title: 'Custom Page Dimensions & Margins',
        description: 'Choose between Fit Image (exact photo dimensions), Standard A4, and US Letter with configurable margins.',
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
      engine: 'pdf-lib native XObject embedding with HTML5 Canvas normalization fallback',
      memoryLifecycle: 'Image ArrayBuffers are processed in browser RAM and garbage collected after download',
      supportedFormats: ['PNG (.png)', 'JPEG / JPG (.jpg, .jpeg)', 'WebP (.webp)'],
      outputFormat: 'Standard PDF document (.pdf)',
      limitations: [
        'Total output PDF file size reflects the combined size of the raw input images.',
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
        a: 'You can upload PNG, JPG, JPEG, and WebP image files. All formats are converted seamlessly in browser memory.',
      },
      {
        q: 'Can I choose standard page sizes like A4 or US Letter?',
        a: 'Yes. You can select Fit Image (which matches the exact dimensions of each photo), Standard A4, or US Letter, with optional margin spacing.',
      },
      {
        q: 'Are my personal photos uploaded to any server?',
        a: 'No. The image compilation takes place locally on your computer inside your web browser. No image data is transmitted across the internet.',
      },
      {
        q: 'Can I add multiple photos and arrange their order?',
        a: 'Yes. You can upload multiple images simultaneously and they will be compiled in sequence into a multi-page PDF.',
      },
    ],
    relatedToolSlugs: ['merge-pdf', 'compress-pdf', 'cleanse-metadata', 'dark-mode-pdf'],
  },
};

export function getToolGuideBySlug(slug: string): ToolGuideData | undefined {
  return TOOL_GUIDES[slug];
}

export function getToolGuideById(id: number): ToolGuideData | undefined {
  return Object.values(TOOL_GUIDES).find((g) => g.toolId === id);
}
