import { loadPdf, generatePreview, convertToDarkMode, splitPdf, mergePdfs, rotatePage, globalPdfDoc, globalPdfJsDoc } from './pdfProcessing.js'; // Added globalPdfJsDoc to imports
import { showError, showMessage } from './messages.js'; 

document.getElementById("pdfUpload").addEventListener("change", loadPdf);
document.getElementById("generatePreviewButton").addEventListener("click", generatePreview);
document.getElementById("convertButton").addEventListener("click", convertToDarkMode);

document.getElementById("splitButton").addEventListener("click", () => {
    // Ensure globalPdfJsDoc is available for page count, and globalPdfDoc for the actual splitting operation
    if (!globalPdfJsDoc || !globalPdfDoc) { 
        showError("Please upload and process a PDF file first.");
        return;
    }
    const startPageInput = document.getElementById("startPage").value;
    const endPageInput = document.getElementById("endPage").value;
    const startPage = parseInt(startPageInput, 10);
    const endPage = parseInt(endPageInput, 10);
    const pageCount = globalPdfJsDoc.numPages; // Use pdf.js doc for consistent page count with viewers

    if (pageCount === 0 || isNaN(startPage) || isNaN(endPage) || startPage < 1 || endPage < 1 || startPage > endPage || endPage > pageCount) {
        let errorMsg = "Invalid page range.";
        if (pageCount > 0) {
            errorMsg += ` Please enter numbers between 1 and ${pageCount}, with start page <= end page.`;
        }
        showError(errorMsg);
        return;
    }
    splitPdf(startPage, endPage);
});

document.getElementById("mergeButton").addEventListener("click", async () => {
    const pdfFilesInput = document.getElementById("pdfFiles");
    const pdfFiles = pdfFilesInput.files;

    if (!pdfFiles || pdfFiles.length === 0) {
        showError("Please select PDF files to merge.");
        return;
    }

    const pdfArray = [];
    for (const file of pdfFiles) {
        const fileArrayBuffer = await file.arrayBuffer();
        pdfArray.push(fileArrayBuffer);
    }
    mergePdfs(pdfArray, Array.from(pdfFiles).map(file => file.name));
});

document.getElementById("rotateButton").addEventListener("click", () => {
    if (!globalPdfDoc) { 
        showError("Please upload a PDF file first.");
        return;
    }
    const pageNumberInput = document.getElementById("rotatePageNumber").value;
    const angleInput = document.getElementById("rotateAngle").value;
    const pageNumber = parseInt(pageNumberInput, 10);
    const angle = parseInt(angleInput, 10);
    // For rotation, pdf-lib's globalPdfDoc is used, so its page count is appropriate here.
    const pageCount = globalPdfDoc.getPageCount(); 

    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
        showError(`Invalid page number. Please enter a number between 1 and ${pageCount}.`);
        return;
    }
    if (isNaN(angle) || angle % 90 !== 0) {
        showError("Invalid angle. Please enter an angle that is a multiple of 90 (e.g., 0, 90, 180, 270).");
        return;
    }

    rotatePage(pageNumber, angle);
});

// Theme/filter changes trigger a re-generation of the dark mode preview
document.getElementById("themeSelect").addEventListener("change", () => generatePreviewOnFilterChange());
document.getElementById("brightness").addEventListener("input", () => generatePreviewOnFilterChange());
document.getElementById("contrast").addEventListener("input", () => generatePreviewOnFilterChange());

function generatePreviewOnFilterChange() {
    const pdfUpload = document.getElementById("pdfUpload");
    // Now globalPdfJsDoc is correctly in scope due to import
    if (pdfUpload.files.length > 0 && globalPdfJsDoc && document.getElementById('darkModePdfViewerSection').style.display === 'block') {
        generatePreview(); 
    }
}

// Scroll Sync Functionality
document.addEventListener('DOMContentLoaded', () => {
    const originalPdfViewer = document.getElementById('originalPdfPagesContainer');
    const darkModePdfViewer = document.getElementById('darkModePdfPagesContainer');
    const syncScrollButton = document.getElementById('syncScrollButton');

    let isScrollSynced = false;
    let isCurrentlySyncing = false; 

    if (syncScrollButton && originalPdfViewer && darkModePdfViewer) {
        syncScrollButton.addEventListener('click', () => {
            isScrollSynced = !isScrollSynced;
            syncScrollButton.textContent = isScrollSynced ? 'Disable Scroll Sync' : 'Enable Scroll Sync';
            if (isScrollSynced) {
                darkModePdfViewer.scrollTop = originalPdfViewer.scrollTop;
            }
            console.log(`Scroll Sync ${isScrollSynced ? 'Enabled' : 'Disabled'}`);
        });

        const syncScrollHandler = (sourceViewer, targetViewer) => {
            if (!isScrollSynced || isCurrentlySyncing) {
                return;
            }
            isCurrentlySyncing = true;
            targetViewer.scrollTop = sourceViewer.scrollTop;
            requestAnimationFrame(() => {
                isCurrentlySyncing = false;
            });
        };

        originalPdfViewer.addEventListener('scroll', () => {
            syncScrollHandler(originalPdfViewer, darkModePdfViewer);
        });

        darkModePdfViewer.addEventListener('scroll', () => {
            syncScrollHandler(darkModePdfViewer, originalPdfViewer);
        });

    } else {
        console.warn('Scroll sync elements not found. Ensure originalPdfPagesContainer, darkModePdfPagesContainer, and syncScrollButton IDs exist.');
    }
});
