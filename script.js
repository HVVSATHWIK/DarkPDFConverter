let globalPdfDoc;

async function loadPdf() {
    const pdfUpload = document.getElementById("pdfUpload");
    if (!pdfUpload.files.length) {
        showError("Please upload a PDF file.");
        return;
    }
    const file = pdfUpload.files[0];
    const fileArrayBuffer = await file.arrayBuffer();
    try {
        globalPdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
        showMessage("PDF loaded successfully! Now generate a preview.");
    } catch (error) {
        showError("Error loading PDF. Please make sure the file is a valid PDF.");
        console.error("Error loading PDF:", error);
    }
}

async function generatePreview() {
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

    const pdfBytes = await globalPdfDoc.save();
    let pdfDoc;
    try {
        pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    } catch (error) {
        showError("Error parsing PDF. Please try another file.");
        console.error("Error parsing PDF:", error);
        hideLoading(loading);
        return;
    }

    try {
        const page = await pdfDoc.getPage(1);
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
        context.globalCompositeOperation = "difference";
        context.fillStyle = getFillColor(theme);
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "source-over";
        context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        previewCanvas.getContext("2d").drawImage(canvas, 0, 0);

        preview.style.display = "block";
    } catch (error) {
        showError("Error generating preview. Please try another file.");
        console.error("Error generating preview:", error);
    }

    hideLoading(loading);
}

async function convertToDarkMode() {
    const loading = document.getElementById("loading");
    const theme = document.getElementById("themeSelect").value;
    const brightness = document.getElementById("brightness").value;
    const contrast = document.getElementById("contrast").value;

    if (!globalPdfDoc) {
        showError("Please upload a PDF file first.");
        return;
    }

    showLoading(loading);

    const pdfBytes = await globalPdfDoc.save();
    let pdfDoc;
    try {
        pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    } catch (error) {
        showError("Error parsing PDF. Please try another file.");
        console.error("Error parsing PDF:", error);
        hideLoading(loading);
        return;
    }

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
            context.globalCompositeOperation = "difference";
            context.fillStyle = getFillColor(theme);
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.globalCompositeOperation = "source-over";
            context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

            const imageDataUrl = canvas.toDataURL("image/png");
            const embeddedImage = await newPdfDoc.embedPng(imageDataUrl);
            const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: newPage.getWidth(),
                height: newPage.getHeight()
            });
        } catch (error) {
            showError(`Error processing page ${i}. Skipping to next page.`);
            console.error(`Error processing page ${i}:`, error);
            continue;
        }
    }

    try {
        const newPdfBytes = await newPdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = url;
        downloadLink.style.display = "block";
        downloadLink.download = "dark_mode_pdf.pdf";
    } catch (error) {
        showError("Error saving dark mode PDF. Please try again.");
        console.error("Error saving dark mode PDF:", error);
    }

    hideLoading(loading);
}

function showLoading(element) {
    element.classList.remove("hidden");
    element.classList.add("visible");
}

function hideLoading(element) {
    element.classList.remove("visible");
    element.classList.add("hidden");
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type = 'info') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`;
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 1000);
    }, 3000);
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

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";
document.getElementById("pdfUpload").addEventListener("change", loadPdf);
