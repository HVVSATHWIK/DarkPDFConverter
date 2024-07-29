import { showLoading, hideLoading, showError, showMessage } from './messages.js';

export let globalPdfDoc;

export async function loadPdf() {
    const pdfUpload = document.getElementById("pdfUpload");
    if (!pdfUpload.files.length) {
        showError("Please upload a PDF file.");
        return;
    }
    const file = pdfUpload.files[0];
    try {
        const fileArrayBuffer = await file.arrayBuffer();
        globalPdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
        showMessage("PDF loaded successfully! Now generate a preview.");
        generateThumbnails(globalPdfDoc);
    } catch (error) {
        showError("Error loading PDF. Please make sure the file is a valid PDF.");
        console.error("Error loading PDF:", error);
    }
}

async function generateThumbnails(pdfDoc) {
    const thumbnailsContainer = document.getElementById("thumbnails");
    thumbnailsContainer.innerHTML = '';
    const numPages = pdfDoc.getPageCount();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < numPages; i++) {
        try {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            const thumbnail = document.createElement("div");
            thumbnail.classList.add("thumbnail");
            thumbnail.appendChild(canvas);
            fragment.appendChild(thumbnail);

            // Add ARIA role for better accessibility
            thumbnail.setAttribute("role", "button");
            thumbnail.setAttribute("aria-label", `Page ${i + 1} preview`);
            thumbnail.tabIndex = 0;

            thumbnail.addEventListener("click", () => {
                renderPage(i + 1);
            });
        } catch (error) {
            console.error(`Error generating thumbnail for page ${i + 1}:`, error);
        }
    }

    thumbnailsContainer.appendChild(fragment);
}

export async function renderPage(pageNumber) {
    const loadingElement = document.getElementById("loading");
    const previewCanvasElement = document.getElementById("previewCanvas");
    const themeValue = document.getElementById("themeSelect").value;
    const brightnessValue = document.getElementById("brightness").value;
    const contrastValue = document.getElementById("contrast").value;

    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    showLoading(loadingElement);

    try {
        const pdfBytes = await globalPdfDoc.save();
        const pdfDocument = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2.0 });

        const temporaryCanvas = document.createElement("canvas");
        const temporaryContext = temporaryCanvas.getContext("2d");
        temporaryCanvas.width = viewport.width;
        temporaryCanvas.height = viewport.height;

        await page.render({ canvasContext: temporaryContext, viewport: viewport }).promise;

        applyFiltersAndTheme(temporaryContext, temporaryCanvas.width, temporaryCanvas.height, themeValue, brightnessValue, contrastValue);

        drawToPreviewCanvas(previewCanvasElement, temporaryCanvas);
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading(loadingElement);
    }
}

function applyFiltersAndTheme(context, width, height, theme, brightness, contrast) {
    context.globalCompositeOperation = "difference";
    context.fillStyle = getFillColor(theme);
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
}

function drawToPreviewCanvas(previewCanvas, sourceCanvas) {
    const previewContext = previewCanvas.getContext("2d");
    previewCanvas.width = sourceCanvas.width;
    previewCanvas.height = sourceCanvas.height;

    previewContext.imageSmoothingEnabled = true;
    previewContext.imageSmoothingQuality = 'high';
    previewContext.drawImage(sourceCanvas, 0, 0);
}

function handleError(error) {
    showError("Error generating preview. Please try another file.");
    console.error("Error generating preview:", error);
}

export async function generatePreview() {
    const loading = document.getElementById("loading");
    const preview = document.getElementById("preview");
    const previewCanvas = document.getElementById("previewCanvas");
    const theme = document.getElementById("themeSelect").value;
    const brightness = document.getElementById("brightness").value;
    const contrast = document.getElementById("contrast").value;

    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    showLoading(loading);

    try {
        const pdfBytes = await globalPdfDoc.save();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

        const numPages = pdfDoc.numPages;
        for (let i = 1; i <= numPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;

                applyFiltersAndTheme(context, canvas.width, canvas.height, theme, brightness, contrast);

                drawToPreviewCanvas(previewCanvas, canvas);

                preview.style.display = "block";
            } catch (error) {
                console.error(`Error generating preview for page ${i}:`, error);
            }
        }
    } catch (error) {
        showError("Error generating preview. Please try another file.");
        console.error("Error generating preview:", error);
    } finally {
        hideLoading(loading);
    }
}

export async function convertToDarkMode() {
    const loadingElement = document.getElementById("loading");
    const themeValue = document.getElementById("themeSelect").value;
    const brightnessValue = document.getElementById("brightness").value;
    const contrastValue = document.getElementById("contrast").value;

    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    showLoading(loadingElement);

    try {
        const pdfBytes = await globalPdfDoc.save();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

        const numPages = pdfDoc.numPages;
        const newPdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 1; i <= numPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;

                applyFiltersAndTheme(context, canvas.width, canvas.height, themeValue, brightnessValue, contrastValue);

                const imageDataUrl = canvas.toDataURL("image/png");
                const embeddedImage = await newPdfDoc.embedPng(imageDataUrl);
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width: newPage.getWidth(),
                    height: newPage.getHeight()
                });

                updateProgress(i, numPages);
            } catch (error) {
                console.error(`Error processing page ${i}:`, error);
                continue;
            }
        }

        const newPdfBytes = await newPdfDoc.save();
        const compressedBytes = await compressPdf(newPdfBytes);
        const blob = new Blob([compressedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("downloadLink");
        const originalFileName = document.getElementById("pdfUpload").files[0].name.replace('.pdf', '_dark.pdf');
        downloadLink.href = url;
        downloadLink.style.display = "block";
        downloadLink.download = originalFileName;
    } catch (error) {
        showError("Error converting to dark mode. Please try again.");
        console.error("Error converting to dark mode:", error);
    } finally {
        hideLoading(loadingElement);
    }
}

function updateProgress(currentPage, totalPages) {
    const progressElement = document.getElementById("progress");
    if (progressElement) {
        progressElement.style.width = `${(currentPage / totalPages) * 100}%`;
        progressElement.innerText = `Processing page ${currentPage} of ${totalPages}`;
    } else {
        console.warn(`Progress element not found. Could not update progress for page ${currentPage}.`);
    }
}

async function compressPdf(pdfBytes) {
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const images = page.node.ImagesArray;
            if (images) {
                for (const image of images) {
                    if (image instanceof PDFLib.PDFImage) {
                        const embeddedImage = await pdfDoc.embedJpg(image.asJPEG());
                        image.embed(embeddedImage);
                    }
                }
            }
        }

        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            compress: true,
            optimizeForSize: true,
        });

        return compressedPdfBytes;
    } catch (error) {
        console.error("Error compressing PDF:", error);
        throw new Error("Failed to compress PDF. Please try again.");
    }
}

export async function splitPdf(startPage, endPage) {
    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    const splitPdfDoc = await PDFLib.PDFDocument.create();
    const pages = await globalPdfDoc.copyPages(globalPdfDoc, [...Array(endPage - startPage + 1).keys()].map(i => i + startPage - 1));
    pages.forEach((page) => {
        splitPdfDoc.addPage(page);
    });

    const splitPdfBytes = await splitPdfDoc.save();
    const blob = new Blob([splitPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById("splitDownloadLink");
    downloadLink.href = url;
    downloadLink.style.display = "block";
    downloadLink.download = "split_" + document.getElementById("pdfUpload").files[0].name;
}

export async function mergePdfs(pdfArray, originalFileNames) {
    const mergedPdfDoc = await PDFLib.PDFDocument.create();
    for (const pdfBytes of pdfArray) {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
        const pages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => {
            mergedPdfDoc.addPage(page);
        });
    }

    const mergedPdfBytes = await mergedPdfDoc.save();
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById("mergeDownloadLink");
    downloadLink.href = url;
    downloadLink.style.display = "block";
    downloadLink.download = originalFileNames.join('_') + "_merged.pdf";
}

export async function rotatePage(pageNumber, angle) {
    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    const page = globalPdfDoc.getPage(pageNumber - 1);
    page.setRotation(angle);

    const rotatedPdfBytes = await globalPdfDoc.save();
    const blob = new Blob([rotatedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById("rotateDownloadLink");
    downloadLink.href = url;
    downloadLink.style.display = "block";
    downloadLink.download = "rotated_" + document.getElementById("pdfUpload").files[0].name;
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
