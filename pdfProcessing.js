
import { showLoading, hideLoading, showError, showMessage } from './messages.js';

export let globalPdfDoc; // For pdf-lib (manipulation)
export let globalPdfJsDoc; // For pdf.js (rendering)

async function displayOriginalPdf(pdfJsDoc) {
    const container = document.getElementById("originalPdfPagesContainer");
    if (!container) {
        console.error("Original PDF pages container not found!");
        return;
    }
    container.innerHTML = ''; 
    const loadingElement = document.getElementById("loading");
    showLoading(loadingElement);

    try {
        const numPages = pdfJsDoc.numPages;
        if (numPages === 0) {
            container.textContent = 'No pages in this PDF.';
            document.getElementById('originalPdfViewerSection').style.display = 'block';
            return;
        }

        for (let i = 1; i <= numPages; i++) {
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); 
            
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'canvas-page-wrapper';

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            
            if (!context) {
                throw new Error(`Failed to get 2D context for original page canvas ${i}`);
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.setAttribute('aria-label', `Original Page ${i}`);

            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.className = 'page-number-overlay';
            pageNumberDiv.textContent = `Page ${i} / ${numPages}`;

            pageWrapper.appendChild(canvas);
            pageWrapper.appendChild(pageNumberDiv);
            container.appendChild(pageWrapper);

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;
        }
        document.getElementById('originalPdfViewerSection').style.display = 'block';
    } catch (error) {
        console.error("Error displaying original PDF:", error);
        showError("Could not display the original PDF.");
    } finally {
        hideLoading(loadingElement);
    }
}

export async function loadPdf(event) {
    const pdfUpload = document.getElementById("pdfUpload");
    const file = event ? event.target.files[0] : pdfUpload.files[0];

    if (!file) {
        showError("Please upload a PDF file.");
        return;
    }

    showLoading(document.getElementById("loading"));

    try {
        const fileArrayBuffer = await file.arrayBuffer();
        globalPdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
        const arrayBufferCopy = fileArrayBuffer.slice(0);
        globalPdfJsDoc = await pdfjsLib.getDocument({ data: arrayBufferCopy }).promise;
        
        showMessage("PDF loaded successfully! You can now generate a preview or convert.");
        
        await displayOriginalPdf(globalPdfJsDoc); 

        const darkModeViewer = document.getElementById('darkModePdfViewerSection');
        if(darkModeViewer) darkModeViewer.style.display = 'none';

    } catch (error) {
        showError("Error loading PDF. Please make sure the file is a valid PDF.");
        console.error("Error loading PDF:", error);
    } finally {
        hideLoading(document.getElementById("loading"));
    }
}

function applyFiltersAndTheme(context, width, height, theme, brightness, contrast) {
    const safeBrightness = Math.max(50, Math.min(150, parseFloat(brightness)));
    const safeContrast = Math.max(50, Math.min(200, parseFloat(contrast)));

    context.globalCompositeOperation = "difference";
    context.fillStyle = getFillColor(theme);
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.filter = `brightness(${safeBrightness}%) contrast(${safeContrast}%)`;
}

async function displayDarkModePreview() {
    const container = document.getElementById("darkModePdfPagesContainer");
    const viewerSection = document.getElementById("darkModePdfViewerSection");

    if (!globalPdfJsDoc) {
        showError("Please upload a PDF file first to generate a dark mode preview.");
        return;
    }
    if (!container || !viewerSection) {
        console.error("Dark mode PDF pages container or section not found!");
        showError("Preview container element is missing in HTML.");
        return;
    }

    container.innerHTML = ''; 
    viewerSection.style.display = 'block'; 
    console.log("darkModePdfViewerSection display style set to:", viewerSection.style.display);

    const loadingElement = document.getElementById("loading");
    showLoading(loadingElement);

    const themeValue = document.getElementById("themeSelect").value;
    const brightnessValue = document.getElementById("brightness").value;
    const contrastValue = document.getElementById("contrast").value;

    try {
        const numPages = globalPdfJsDoc.numPages;
        if (numPages === 0) {
            container.textContent = 'No pages in this PDF to preview in dark mode.';
            return;
        }
        console.log(`Generating dark mode preview for ${numPages} pages.`);

        for (let i = 1; i <= numPages; i++) {
            const page = await globalPdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); 
            
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'canvas-page-wrapper';

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                console.error(`Failed to get 2D context for dark mode preview page canvas ${i}`);
                const errorP = document.createElement('p');
                errorP.textContent = `Error rendering page ${i}.`;
                errorP.style.color = 'red';
                pageWrapper.appendChild(errorP);
                container.appendChild(pageWrapper);
                continue; 
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.setAttribute('aria-label', `Dark Mode Page ${i}`);
            
            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.className = 'page-number-overlay';
            pageNumberDiv.textContent = `Page ${i} / ${numPages}`;

            pageWrapper.appendChild(canvas);
            pageWrapper.appendChild(pageNumberDiv);
            container.appendChild(pageWrapper);
            console.log(`Appended canvas wrapper for dark mode page ${i} to container.`); // Diagnostic log

            const renderContext = { canvasContext: context, viewport: viewport };
            await page.render(renderContext).promise;
            
            applyFiltersAndTheme(context, canvas.width, canvas.height, themeValue, brightnessValue, contrastValue);
        }
        showMessage("Dark mode preview generated.");
    } catch (error) {
        console.error("Error displaying dark mode PDF preview:", error);
        showError("Could not display the dark mode PDF preview.");
    } finally {
        hideLoading(loadingElement);
    }
}

export async function generatePreview() {
    if (!globalPdfJsDoc) {
        showError("Please upload a PDF file first.");
        return;
    }
    if (globalPdfJsDoc.numPages === 0) { 
        showError("The uploaded PDF has no pages to preview.");
        return;
    }
    
    console.log("Generate Preview button clicked, calling displayDarkModePreview.");
    await displayDarkModePreview(); 
}


export async function convertToDarkMode() {
    const loadingElement = document.getElementById("loading");
    const themeValue = document.getElementById("themeSelect").value;
    const brightnessValue = document.getElementById("brightness").value;
    const contrastValue = document.getElementById("contrast").value;

    if (!globalPdfDoc || !globalPdfJsDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    showLoading(loadingElement);
    const newPdfDoc = await PDFLib.PDFDocument.create();

    try {
        const uploadedFile = document.getElementById("pdfUpload").files[0];
        const baseFileName = uploadedFile.name.replace(/(_dark)*\.pdf$/i, '');

        if (uploadedFile.name.includes("_dark.pdf")) {
            showMessage("Warning: Input PDF seems to be already in dark mode. Re-converting may affect quality.", 'info', 5000);
        }

        const numPages = globalPdfJsDoc.numPages;
        console.log(`Starting conversion for ${numPages} pages.`);

        for (let i = 1; i <= numPages; i++) {
            console.log(`Rendering page ${i} with scale 2.5`);
            const page = await globalPdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.5 }); 
            console.log(`Page ${i} viewport: ${viewport.width}x${viewport.height}`);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            applyFiltersAndTheme(context, canvas.width, canvas.height, themeValue, brightnessValue, contrastValue);

            const imageDataUrl = canvas.toDataURL("image/png", 1.0);
            const pngImage = await newPdfDoc.embedPng(imageDataUrl);
            
            const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: newPage.getWidth(),
                height: newPage.getHeight(),
            });
        }

        const newPdfBytes = await newPdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("downloadLink");
        
        downloadLink.href = url;
        downloadLink.style.display = "block";
        downloadLink.download = `${baseFileName}_dark.pdf`;
        showMessage("PDF converted successfully!");

    } catch (error) {
        showError("Error converting to dark mode. Please try again.");
        console.error("Error converting to dark mode:", error);
    } finally {
        hideLoading(loadingElement);
    }
}

export async function splitPdf(startPage, endPage) {
    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }
    showLoading(document.getElementById("loading"));
    try {
        const splitPdfDoc = await PDFLib.PDFDocument.create();
        const indicesToCopy = [];
        for (let i = startPage - 1; i < endPage; i++) {
            indicesToCopy.push(i);
        }
        const copiedPages = await splitPdfDoc.copyPages(globalPdfDoc, indicesToCopy);
        copiedPages.forEach(page => splitPdfDoc.addPage(page));

        const splitPdfBytes = await splitPdfDoc.save();
        const blob = new Blob([splitPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("splitDownloadLink");
        const originalFileName = document.getElementById("pdfUpload").files[0].name.replace(/\.pdf$/i, `_split_${startPage}-${endPage}.pdf`);
        downloadLink.href = url;
        downloadLink.style.display = "block";
        downloadLink.download = originalFileName;
        showMessage("PDF split successfully!");
    } catch (error) {
        showError("Error splitting PDF.");
        console.error("Error splitting PDF:", error);
    } finally {
        hideLoading(document.getElementById("loading"));
    }
}

export async function mergePdfs(pdfFileBuffers, originalFileNames) {
    if (!pdfFileBuffers || pdfFileBuffers.length === 0) {
        showError("No PDF files provided for merging.");
        return;
    }
    showLoading(document.getElementById("loading"));
    try {
        const mergedPdfDoc = await PDFLib.PDFDocument.create();
        for (const pdfBytes of pdfFileBuffers) {
            const pdfToMerge = await PDFLib.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
            copiedPages.forEach(page => mergedPdfDoc.addPage(page));
        }

        const mergedPdfBytes = await mergedPdfDoc.save();
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("mergeDownloadLink");
        const mergedName = originalFileNames.map(name => name.replace(/\.pdf$/i, '')).join('_') + '_merged.pdf';
        downloadLink.href = url;
        downloadLink.style.display = "block";
        downloadLink.download = mergedName;
        showMessage("PDFs merged successfully!");
    } catch (error) {
        showError("Error merging PDFs.");
        console.error("Error merging PDFs:", error);
    } finally {
        hideLoading(document.getElementById("loading"));
    }
}

export async function rotatePage(pageNumber, angle) {
    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }
    showLoading(document.getElementById("loading"));
    try {
        const pageToRotate = globalPdfDoc.getPage(pageNumber - 1);
        const currentRotation = pageToRotate.getRotation().angle;
        pageToRotate.setRotation(PDFLib.degrees(currentRotation + angle));

        const rotatedPdfBytes = await globalPdfDoc.save();
        const blob = new Blob([rotatedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("rotateDownloadLink");
        const originalFileName = document.getElementById("pdfUpload").files[0].name.replace(/\.pdf$/i, `_rotated_page${pageNumber}.pdf`);
        downloadLink.href = url;
        downloadLink.style.display = "block";
        downloadLink.download = originalFileName;
        showMessage(`Page ${pageNumber} rotated successfully!`);
    } catch (error) {
        showError("Error rotating page.");
        console.error("Error rotating page:", error);
    } finally {
        hideLoading(document.getElementById("loading"));
    }
}

function getFillColor(theme) {
    switch (theme) {
        case "dark":
            return "white";
        case "darker":
            return "#ccc";
        case "darkest":
            return "#999";
        default:
            return "white";
    }
}
