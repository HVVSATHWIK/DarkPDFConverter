import { useState, useEffect } from 'react';

type BufferState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; buffer: ArrayBufferLike; isShared: boolean }
    | { status: 'error'; error: Error };

export const usePdfBuffer = (file: string | File | Blob | { data: Uint8Array } | null): BufferState => {
    const [state, setState] = useState<BufferState>({ status: 'idle' });

    useEffect(() => {
        if (!file) {
            setState({ status: 'idle' });
            return;
        }

        const load = async () => {
            try {
                setState({ status: 'loading' });

                // Normalize input to ArrayBuffer
                let rawBuffer: ArrayBuffer;

                if (file instanceof File || file instanceof Blob) {
                    rawBuffer = await file.arrayBuffer();
                } else if (typeof file === 'string') {
                    const res = await fetch(file);
                    if (!res.ok) throw new Error("Failed to fetch PDF URL");
                    rawBuffer = await res.arrayBuffer();
                } else if ('data' in file) {
                    // Already a Uint8Array wrapper, assume it might be detached or ready
                    rawBuffer = new ArrayBuffer(file.data.byteLength);
                    new Uint8Array(rawBuffer).set(file.data);
                } else {
                    throw new Error("Unknown file format");
                }

                // Check availability of SAB (SharedArrayBuffer)
                // Note: requires COOP/COEP headers
                const supportsSAB = typeof window.SharedArrayBuffer !== 'undefined' && window.crossOriginIsolated;

                if (supportsSAB) {
                    try {
                        // Fix 4: Try/Catch for SharedArrayBuffer
                        const sab = new SharedArrayBuffer(rawBuffer.byteLength);
                        new Uint8Array(sab).set(new Uint8Array(rawBuffer));
                        setState({ status: 'ready', buffer: sab as unknown as ArrayBufferLike, isShared: true });
                    } catch (sabError) {
                        console.warn("SAB creation failed, falling back to ArrayBuffer", sabError);
                        // Fallback logic handled below if this block fails/skips
                        const clone = rawBuffer.slice(0);
                        setState({ status: 'ready', buffer: clone, isShared: false });
                    }
                } else {
                    // Fallback: Use standard ArrayBuffer (copied here to ensure ownership for UI)
                    // Fix 5: We clone it to prevent detachment if the same buffer was used elsewhere.
                    // Optimisation: If we know we have exclusive ownership (e.g. created from strict input), we could skip copy,
                    // but safety first for now.
                    const clone = rawBuffer.slice(0);
                    setState({ status: 'ready', buffer: clone, isShared: false });
                }
            } catch (e: unknown) {
                // Fix 2: Remove usage of `any` type for error handling
                console.error("Buffer Load Error:", e);
                const error = e instanceof Error ? e : new Error(String(e));
                setState({ status: 'error', error });
            }
        };

        load();
    }, [file]);

    return state;
};
