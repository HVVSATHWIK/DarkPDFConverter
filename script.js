pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

async function convertToDarkMode() {
    const input = document.getElementById('pdfUpload');
    const downloadLink = document.getElementById('downloadLink');

    if (!input.files.length) {
        alert('Please upload a PDF file.');
        return;
    }

    const file = input.files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    let pdfDoc;
    try {
        pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. Please make sure the file is a valid PDF.');
        return;
    }

    const pdfBytes = await pdfDoc.save();
    let pdf;
    try {
        pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        alert('Error parsing PDF. Please try another file.');
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
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

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

        downloadLink.href = url;
        downloadLink.style.display = 'block';
        downloadLink.download = 'dark_mode_pdf.pdf';
    } catch (error) {
        console.error('Error saving dark mode PDF:', error);
        alert('Error saving dark mode PDF. Please try again.');
    }
}

document.getElementById('pdfUpload').addEventListener('change', convertToDarkMode);
