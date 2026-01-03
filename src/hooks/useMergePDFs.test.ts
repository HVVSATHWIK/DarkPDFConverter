/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useMergePDFs } from './useMergePDFs';
import { usePDFEngine } from './usePDFEngine';

vi.mock('./usePDFEngine', () => ({
  usePDFEngine: vi.fn(),
}));

const createMockFile = (name: string, content: string = 'dummy content') => {
  const blob = new Blob([content], { type: 'application/pdf' });
  const file = new File([blob], name, { type: 'application/pdf' });
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(content.length));
  return file;
};

describe('useMergePDFs', () => {
  const mockOnProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePDFEngine as Mock).mockReturnValue({
      isReady: true,
      mergePDFs: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    });
  });

  it('returns null if no files are provided', async () => {
    const { result } = renderHook(() => useMergePDFs());

    let merged: Uint8Array | null = null;
    await act(async () => {
      merged = await result.current.mergePdfs([], mockOnProgress);
    });

    expect(merged).toBeNull();
    expect(mockOnProgress).not.toHaveBeenCalled();
  });

  it('merges files via the engine and reports progress', async () => {
    const { result } = renderHook(() => useMergePDFs());
    const file1 = createMockFile('file1.pdf', 'pdf1');
    const file2 = createMockFile('file2.pdf', 'pdf2');

    const engine = (usePDFEngine as Mock).mock.results[0]!.value;

    let merged: Uint8Array | null = null;
    await act(async () => {
      merged = await result.current.mergePdfs([file1, file2], mockOnProgress);
    });

    expect(file1.arrayBuffer).toHaveBeenCalled();
    expect(file2.arrayBuffer).toHaveBeenCalled();
    expect(engine.mergePDFs).toHaveBeenCalledTimes(1);
    expect(engine.mergePDFs).toHaveBeenCalledWith([
      expect.any(Uint8Array),
      expect.any(Uint8Array),
    ]);

    expect(merged).toBeInstanceOf(Uint8Array);
    expect(mockOnProgress).toHaveBeenCalled();
    expect(mockOnProgress).toHaveBeenLastCalledWith(1, 2, 2);
  });

  it('throws a friendly error if the engine fails', async () => {
    (usePDFEngine as Mock).mockReturnValueOnce({
      isReady: true,
      mergePDFs: vi.fn().mockRejectedValue(new Error('engine failed')),
    });

    const { result } = renderHook(() => useMergePDFs());
    const file1 = createMockFile('file1.pdf');

    await expect(result.current.mergePdfs([file1], mockOnProgress))
      .rejects
      .toThrow('Failed to merge files. High-Performance engine reported error.');
  });
});
