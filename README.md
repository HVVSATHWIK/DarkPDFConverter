# LitasDark — Privacy-First In-Browser PDF Suite

<div align="center">
  <br />
  
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Heroicons](https://img.shields.io/badge/Heroicons-06B6D4?style=for-the-badge&logo=react&logoColor=white)](https://heroicons.com/)

  <p align="center">
    <b>100% Client-Side. Zero Server Uploads. High-Performance Web Processing.</b>
    <br />
    A fast, privacy-focused PDF suite that processes documents entirely inside your browser memory.
  </p>
</div>

---

## 🚀 Overview

**LitasDark** is a high-performance, client-side PDF utility suite designed with absolute privacy in mind. Every PDF operation — whether compressing, converting, merging, or cleansing metadata — executes **100% inside your browser** using Web Workers, `pdf-lib`, and `pdfjs-dist`. Zero document bytes are ever uploaded to an external server.

---

## ✨ Suite of Tools

### ⚡ Optimize PDF
- **Smart Optimization Engine**: Automatically selects the optimal compression path based on document structure.
- **Vector Stream Deflation**: Lossless object stream compression preserving crisp vector text, fonts, and hyperlinks.
- **Scanned Document Rasterization**: Image downsampling with customizable DPI and JPEG quality controls.
- **12M Pixel Safety Cap**: Prevents browser out-of-memory errors on massive image-heavy pages.
- **Smart Size Guard**: Detects already-optimized files (**`ALREADY OPTIMIZED`**) and protects against size bloat.

### 🌙 Dark Mode PDF
- Inverts document backgrounds and text colors for comfortable, eye-safe reading in low-light environments.

### 🥞 Merge PDFs
- Combines multiple PDF files into a single structured document with customizable page ordering.

### ✂️ Split PDF
- Splits large PDFs into separate, individual page files or standalone chunks.

### 🔄 Rotate PDF
- Adjusts page orientation (90°, 180°, 270°) for individual pages or entire documents.

### 📤 Extract Pages
- Pulls selected page numbers or ranges out into a new standalone PDF document.

### 🖼️ Images to PDF
- Converts PNG, JPG, JPEG, and WebP images into a single cohesive PDF document.

### 🛡️ Cleanse Metadata
- Sanitizes document properties — stripping EXIF tags, author details, title metadata, creation dates, and producer signatures.

---

## 🔒 Privacy & Architecture

- **Client-Side RAM Processing**: Files stay in local browser memory and are discarded as soon as processing completes or the workspace is reset.
- **Web Worker Offloading**: Heavy PDF manipulation runs asynchronously in `optimizer.worker.ts`, keeping the main UI responsive at 60 FPS.
- **Unified Heroicons System**: Cohesive, semantic iconography using `@heroicons/react/24/outline` for visual clarity and accessibility.

---

## 🛠️ Development & Usage

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Lint Codebase**:
   ```bash
   npm run lint
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Distributed under the MIT License.
