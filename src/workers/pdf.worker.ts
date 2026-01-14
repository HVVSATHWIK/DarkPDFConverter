import init, { mergePdfsDirect, rotatePdf, extractPages } from '../../src-wasm/pkg/pdf_wasm';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

type WorkerMessage =
    | { type: 'MERGE'; id: string; files: Uint8Array[] }
    | { type: 'ROTATE'; id: string; file: Uint8Array; degrees: number }
    | { type: 'EXTRACT'; id: string; file: Uint8Array; pages: number[] };

let wasmInitialized = false;

let initPromise: Promise<void> | null = null;

async function initWasm() {
    if (wasmInitialized) return;

    // Fix: Prevent race conditions if multiple messages trigger init simultaneously
    if (!initPromise) {
        initPromise = init().then(() => {
            wasmInitialized = true;
            // console.log('Rust Engine Initialized');
        });
    }
    await initPromise;
}

self.addEventListener('message', async (e: MessageEvent<WorkerMessage>) => {
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

            // Fix 6: Input Validation (Security/Stability)
            if (!pages || !Array.isArray(pages) || pages.some(p => p < 1 || !Number.isInteger(p))) {
                throw new Error("Invalid pages array. Pages must be positive integers.");
            }

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

    } catch (err: unknown) {
        // Redact error message if it might contain path info (unlikely in WASM but safe practice)
        // Just return the generic error logic or message.
        const errorMessage = err instanceof Error ? err.message : "Unknown WASM Error";
        ctx.postMessage({ type: 'ERROR', id, error: errorMessage });
    }
});

export { };
