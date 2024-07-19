pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

let globalPdfDoc;

document.getElementById('pdfUpload').addEventListener('change', loadPdf);

async function loadPdf() {
    const input = document.getElementById('pdfUpload');

    if (!input.files.length) {
        alert('Please upload a PDF file.');
        return;
    }

    const file = input.files[0];
    const arrayBuffer = await file.arrayBuffer();

    try {
        globalPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        alert('PDF loaded successfully! Now generate a preview.');
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. Please make sure the file is a valid PDF.');
    }
}

async function generatePreview() {
    const loading = document.getElementById('loading');
    const preview = document.getElementById('preview');
    const previewCanvas = document.getElementById('previewCanvas');
    const theme = document.getElementById('themeSelect').value;
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;

    if (!globalPdfDoc) {
        alert('Please upload a PDF file first.');
        return;
    }

    loading.classList.remove('hidden');
    loading.classList.add('visible');

    const pdfBytes = await globalPdfDoc.save();
    let pdf;
    try {
        pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        alert('Error parsing PDF. Please try another file.');
        loading.classList.remove('visible');
        loading.classList.add('hidden');
        return;
    }

    try {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = theme === 'dark' ? 'white' : theme === 'darker' ? '#ccc' : '#999';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        previewCanvas.getContext('2d').drawImage(canvas, 0, 0);
        preview.style.display = 'block';
    } catch (error) {
        console.error('Error generating preview:', error);
        alert('Error generating preview. Please try another file.');
    }

    loading.classList.remove('visible');
    loading.classList.add('hidden');
}

async function convertToDarkMode() {
    const loading = document.getElementById('loading');
    const theme = document.getElementById('themeSelect').value;
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;

    if (!globalPdfDoc) {
        alert('Please upload a PDF file first.');
        return;
    }

    loading.classList.remove('hidden');
    loading.classList.add('visible');

    const pdfBytes = await globalPdfDoc.save();
    let pdf;
    try {
        pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        alert('Error parsing PDF. Please try another file.');
        loading.classList.remove('visible');
        loading.classList.add('hidden');
        return;
    }

    const numPages = pdf.numPages;
    const darkPdfDoc = await PDFLib.PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
            };

            await page.render(renderContext).promise;

            ctx.globalCompositeOperation = 'difference';
            ctx.fillStyle = theme === 'dark' ? 'white' : theme === 'darker' ? '#ccc' : '#999';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

            const imgData = canvas.toDataURL('image/png');
            const [image] = await Promise.all([
                darkPdfDoc.embedPng(imgData),
            ]);

            const pageDims = darkPdfDoc.addPage([viewport.width, viewport.height]);
            pageDims.drawImage(image, {
                x: 0,
                y: 0,
                width: pageDims.getWidth(),
                height: pageDims.getHeight(),
            });
        } catch (error) {
            console.error(`Error processing page ${i}:`, error);
            alert(`Error processing page ${i}. Skipping to next page.`);
            continue;
        }
    }

    try {
        const darkPdfBytes = await darkPdfDoc.save();
        const blob = new Blob([darkPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.style.display = 'block';
        downloadLink.download = 'dark_mode_pdf.pdf';
    } catch (error) {
        console.error('Error saving dark mode PDF:', error);
        alert('Error saving dark mode PDF. Please try again.');
    }

    loading.classList.remove('visible');
    loading.classList.add('hidden');
}
