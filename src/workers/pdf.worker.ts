import init, { mergePdfsDirect, rotatePdf, extractPages } from '../../src-wasm/pkg/pdf_wasm';

const ctx: Worker = self as any;

type WorkerMessage =
    | { type: 'MERGE'; id: string; files: Uint8Array[] }
    | { type: 'ROTATE'; id: string; file: Uint8Array; degrees: number }
    | { type: 'EXTRACT'; id: string; file: Uint8Array; pages: number[] };

let wasmInitialized = false;

async function initWasm() {
    if (!wasmInitialized) {
        await init();
        wasmInitialized = true;
        // console.log('Rust Engine Initialized'); // Removed for security (clean console)
    }
}

ctx.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    // Security: Do NOT log the entire event data as it contains file buffers.
    const { type, id } = e.data;

    try {
        await initWasm();

        let result: Uint8Array | null = null;
        const startTime = performance.now();

        if (type === 'MERGE') {
            const { files } = e.data;
            // No filename logging. Just count.
            // console.debug(`[SecureWorker] Merging ${files.length} pdfs.`);
            result = mergePdfsDirect(files);
        }
        else if (type === 'ROTATE') {
            const { file, degrees } = e.data;
            result = rotatePdf(file, degrees);
        }
        else if (type === 'EXTRACT') {
            const { file, pages } = e.data;
            // Convert numbers to Uint32Array implicitly or explicitly? 
            // Wasm bindgen expects Vec<u32> for casting.
            const pagesU32 = new Uint32Array(pages);
            result = extractPages(file, pagesU32);
        }

        const duration = performance.now() - startTime;

        if (result) {
            // zero-copy transfer to prevent memory residual in worker
            ctx.postMessage(
                { type: 'SUCCESS', id, data: result, duration },
                [result.buffer]
            );
        } else {
            throw new Error("Operation returned no data");
        }

    } catch (err: any) {
        // Redact error message if it might contain path info (unlikely in WASM but safe practice)
        // Just return the generic error logic or message.
        ctx.postMessage({ type: 'ERROR', id, error: err.message || "Unknown WASM Error" });
    }
};

export { };
