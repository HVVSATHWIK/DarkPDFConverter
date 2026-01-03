# Litas: Next-Gen PDF Dark Mode Engine

<div align="center">
  <img src="public/favicon.ico" alt="Litas Logo" width="120" />
  <br />
  <br />
  
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
  [![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)](https://webassembly.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    <b>Privacy-First. High-Performance. Liquid Glass UI.</b>
    <br />
    A modern PDF tool that processes everything locally using Rust & WebAssembly.
  </p>
</div>

---

## 🚀 Overview

**Litas** (formerly DarkPDFConverter) is a cutting-edge web application designed for processing PDF documents entirely within the browser. By leveraging **Rust** compiled to **WebAssembly (WASM)**, it delivers near-native performance for complex operations like merging, splitting, and rendering, without ever sending a single byte of your data to a server.

The user interface is built with a modern **Liquid Glass** aesthetic, featuring 3D interactions and a responsive design that feels alive.

## ✨ Key Features

### 🛡️ Privacy & Performance
-   **Zero-Server Processing**: All PDF manipulations happen on your device via WASM.
-   **Rust Core**: Critical operations (merge, split, rotate) are powered by a custom Rust engine for speed and safety.
-   **SharedArrayBuffer**: Optimized zero-copy data transfer between the UI and worker threads.

### 🎨 Next-Gen UI/UX
-   **Liquid Glass Methodology**: A premium design system using multilayered blur, saturation, and noise.
-   **3D Tool Carousel**: Interactive 3D menu using `react-three-fiber` and physics-based springs.
-   **Aurora Background**: Dynamic, 4D animated background that responds to user presence.
-   **Virtualized Previews**: Handle large PDFs effortlessly with `react-window`.

### 🛠️ PDF Tools
-   **Dark Mode Conversion**: Intelligent color inversion for comfortable reading.
-   **Merge & Split**: Combine multiple files or extract specific pages.
-   **Rotate & Organize**: Fix orientation issues instantly.
-   **Dark/Light Theming**: Fully responsive system themes.

## 🏗️ Architecture

Litas uses a hybrid architecture where React handles the UI and a dedicated Web Worker (powered by Rust/WASM) handles the heavy lifting.

```mermaid
graph TD
    UI[React UI\n(Main Thread)] -->|Command| Worker[Web Worker]
    Worker -->|WASM Call| Rust[Rust / WASM Core]
    Rust -->|Processed Data| Worker
    Worker -->|Zero-Copy| UI
    
    subgraph "Visual Layer"
    UI --> ThreeJS[3D Carousel\n(Canvas)]
    UI --> HTML[Liquid Glass Components]
    end
    
    subgraph "Engine Layer"
    Worker -.-> PDFLib[PDF.js / PDF-Lib]
    Rust -.-> P[pdf (crate)]
    end
```

## 🛠️ Installation

### Prerequisites
-   Node.js (v18+)
-   npm or pnpm

### Setup
1.  **Clone the repository**
    ```bash
    git clone https://github.com/HVVSATHWIK/DarkPDFConverter.git
    cd DarkPDFConverter
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to view the app.

## 📦 Building for Production

### Standard Build
The project is configured to automatically handle the WASM artifacts for Vercel/Netlify.
```bash
npm run build
```
This produces a `dist` folder ready for deployment.

### Developing the Rust Core (Optional)
If you want to modify the functionality in `src-wasm`:
1.  Install [Rust and Cargo](https://rustup.rs/).
2.  Install wasm-pack: `cargo install wasm-pack`.
3.  Run the build command:
    ```bash
    npm run build:wasm
    ```

## 🤝 Contributing

Contributions are welcome! Please check the `Implementation Plan` artifacts in the `.gemini` folder for current roadmap status.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by Veerendranath
</p>
