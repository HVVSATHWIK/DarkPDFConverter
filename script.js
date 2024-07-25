// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

let globalPdfDoc = null;
let originalFileName = '';

// Element references
const pdfUpload = document.getElementById('pdfUpload');
const themeSelect = document.getElementById('themeSelect');
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const previewCanvas = document.getElementById('previewCanvas');
const downloadLink = document.getElementById('downloadLink');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('errorContainer'); // Error container for displaying messages
const backToTopButton = document.getElementById('backToTop');

// Event listeners
pdfUpload.addEventListener('change', loadPdf);
themeSelect.addEventListener('change', debounce(generatePreview, 300));
brightnessInput.addEventListener('input', debounce(generatePreview, 300));
contrastInput.addEventListener('input', debounce(generatePreview, 300));

// Scroll to top functionality
window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function loadPdf(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedArray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedArray).promise.then(pdfDoc => {
                globalPdfDoc = pdfDoc;
                originalFileName = file.name.replace('.pdf', '');
                generatePreview(); // Automatically generate preview on load
            }).catch(err => {
                displayError(`Failed to load PDF: ${err.message}`);
            });
        };
        fileReader.readAsArrayBuffer(file);
    } else {
        displayError('Please upload a valid PDF file.');
    }
}

async function generatePreview() {
    if (!globalPdfDoc) return;

    showLoading(true);

    try {
        const ctx = previewCanvas.getContext('2d');
        const page = await globalPdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1 }); // Better quality with higher scale
        previewCanvas.width = viewport.width;
        previewCanvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise;

        applyDarkModeToCanvas(ctx, previewCanvas);
    } catch (err) {
        displayError(`Failed to generate preview: ${err.message}`);
    } finally {
        showLoading(false);
    }
}

function applyDarkModeToCanvas(ctx, canvas) {
    const imgData = ctx.getImageData(0, 0, canvas.width);
    const data = imgData.data;
    const theme = themeSelect.value;
    const brightness = parseFloat(brightnessInput.value);
    const contrast = parseFloat(contrastInput.value);

    // Function to check if a pixel is part of an image
    function isImagePixel(r, g, b) {
        const threshold = 20;
        return Math.abs(r - g) < threshold && Math.abs(g - b) < threshold && Math.abs(b - r) < threshold;
    }

    // Enhanced dark mode effect
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Apply dark mode effect based on luminance
        if (!isImagePixel(r, g, b)) {
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            if (theme === 'dark' || theme === 'darker' || theme === 'darkest') {
                if (luminance > 127) {
                    data[i] = r * (brightness / 100);
                    data[i + 1] = g * (brightness / 100);
                    data[i + 2] = b * (brightness / 100);
                } else {
                    data[i] = r * (contrast / 100);
                    data[i + 1] = g * (contrast / 100);
                    data[i + 2] = b * (contrast / 100);
                }
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

async function convertToDarkMode() {
    if (!globalPdfDoc) return;

    showLoading(true);

    try {
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 1; i <= globalPdfDoc.numPages; i++) {
            const page = await globalPdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            applyDarkModeToCanvas(ctx, canvas);

            const pdfPage = pdfDoc.addPage([canvas.width, canvas.height]);
            const imgData = canvas.toDataURL('image/png');
            const img = await pdfDoc.embedPng(imgData);

            pdfPage.drawImage(img, {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height
            });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.style.display = 'inline-block';
    } catch (err) {
        displayError(`Failed to convert PDF: ${err.message}`);
    } finally {
        showLoading(false);
    }
}

function showLoading(isLoading) {
    loadingIndicator.classList.toggle('visible', isLoading);
    loadingIndicator.classList.toggle('hidden', !isLoading);
}

function displayError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}

// Debounce function for generatePreview
const debounce = (func, delay) => {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
};
