// src/test/setup.ts
import '@testing-library/jest-dom';

import { vi } from 'vitest';

// Basic Worker stub for hooks/components that initialize web workers in tests.
// Tests that depend on worker responses should mock the hook/module directly.
class MockWorker {
	onmessage: ((event: MessageEvent) => void) | null = null;
	onerror: ((event: unknown) => void) | null = null;

	constructor(..._args: any[]) {}

	postMessage = vi.fn();
	terminate = vi.fn();
	addEventListener = vi.fn();
	removeEventListener = vi.fn();
	dispatchEvent = vi.fn();
}

(globalThis as any).Worker ??= MockWorker;

// Some environments lack crypto.randomUUID; use a deterministic stub for tests.
if (!globalThis.crypto) {
	(globalThis as any).crypto = {};
}
(globalThis as any).crypto.randomUUID ??= () => '00000000-0000-0000-0000-000000000000';

// react-pdf/pdfjs rely on DOMMatrix/canvas APIs that JSDOM doesn't fully provide.
// Mocking react-pdf keeps component tests lightweight and stable.
vi.mock('react-pdf', () => {
	const React = require('react');
	return {
		Document: ({ children }: any) => React.createElement('div', { 'data-testid': 'mock-react-pdf-document' }, children),
		Page: (_props: any) => React.createElement('div', { 'data-testid': 'mock-react-pdf-page' }),
		pdfjs: {
			GlobalWorkerOptions: { workerSrc: '' },
			version: 'mock',
		},
	};
});

// You can add other global setup here if needed in the future.
// For example, mocking global browser APIs:
// global.matchMedia = global.matchMedia || function() {
//   return {
//     matches: false,
//     addListener: function() {},
//     removeListener: function() {}
//   };
// };
