import { useState, useEffect, useRef, useCallback } from 'react';

type WorkerJob = {
    resolve: (data: Uint8Array) => void;
    reject: (error: Error) => void;
};

export function usePDFEngine() {
    const workerRef = useRef<Worker | null>(null);
    const jobsRef = useRef<Map<string, WorkerJob>>(new Map());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize Worker
        const worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), {
            type: 'module',
        });

        worker.onmessage = (e) => {
            const { type, id, data, error } = e.data;
            const job = jobsRef.current.get(id);

            if (job) {
                if (type === 'SUCCESS') {
                    job.resolve(data);
                } else {
                    job.reject(new Error(error));
                }
                jobsRef.current.delete(id);
            }
        };

        workerRef.current = worker;
        setIsReady(true);

        return () => {
            worker.terminate();
        };
    }, []);

    const mergePDFs = useCallback(async (files: Uint8Array[]): Promise<Uint8Array> => {
        if (!workerRef.current) throw new Error('Worker not initialized');

        const id = crypto.randomUUID();

        return new Promise((resolve, reject) => {
            jobsRef.current.set(id, { resolve, reject });

            // Transfer buffers to deny main thread access (Zero Copy)
            const buffers = files.map(f => f.buffer);

            workerRef.current!.postMessage(
                { type: 'MERGE', id, files },
                buffers // Transfer list
            );
        });
    }, []);

    const rotatePDF = useCallback(async (file: Uint8Array, degrees: number): Promise<Uint8Array> => {
        if (!workerRef.current) throw new Error('Worker not initialized');
        const id = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            jobsRef.current.set(id, { resolve, reject });
            // Zero copy transfer
            workerRef.current!.postMessage(
                { type: 'ROTATE', id, file, degrees },
                [file.buffer]
            );
        });
    }, []);

    const extractPages = useCallback(async (file: Uint8Array, pages: number[]): Promise<Uint8Array> => {
        if (!workerRef.current) throw new Error('Worker not initialized');
        const id = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            jobsRef.current.set(id, { resolve, reject });
            workerRef.current!.postMessage(
                { type: 'EXTRACT', id, file, pages },
                [file.buffer]
            );
        });
    }, []);


    return {
        mergePDFs,
        rotatePDF,
        extractPages,
        isReady
    };
}
