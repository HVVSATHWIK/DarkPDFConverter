import { loadPdf, generatePreview, convertToDarkMode, splitPdf, mergePdfs, rotatePage } from './pdfProcessing.js';

document.getElementById("pdfUpload").addEventListener("change", loadPdf);
document.getElementById("generatePreviewButton").addEventListener("click", generatePreview);
document.getElementById("convertButton").addEventListener("click", convertToDarkMode);

document.getElementById("splitButton").addEventListener("click", () => {
    const startPage = document.getElementById("startPage").value;
    const endPage = document.getElementById("endPage").value;
    splitPdf(startPage, endPage);
});

document.getElementById("mergeButton").addEventListener("click", async () => {
    const pdfFiles = document.getElementById("pdfFiles").files;
    const pdfArray = [];
    for (const file of pdfFiles) {
        const fileArrayBuffer = await file.arrayBuffer();
        pdfArray.push(fileArrayBuffer);
    }
    mergePdfs(pdfArray, Array.from(pdfFiles).map(file => file.name));
});

document.getElementById("rotateButton").addEventListener("click", () => {
    const pageNumber = document.getElementById("rotatePageNumber").value;
    const angle = document.getElementById("rotateAngle").value;
    rotatePage(pageNumber, angle);
});

document.getElementById("brightness").addEventListener("input", updatePreview);
document.getElementById("contrast").addEventListener("input", updatePreview);

function updatePreview() {
    const pdfUpload = document.getElementById("pdfUpload");
    if (pdfUpload.files.length) {
        generatePreview();
    }
}
