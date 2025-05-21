## Manual Testing Guidelines for LitasDark PDF Tools Hub

This document outlines key areas and browsers for manual testing to ensure cross-browser compatibility and responsiveness.

### I. Responsive Design Testing

Test the application on a variety of screen sizes. Use browser developer tools for emulation and real devices where possible.

**Key Screen Sizes / Breakpoints to Check:**
- **Mobile Small:** ~320px width (e.g., iPhone SE older models)
- **Mobile Medium:** ~375px-414px width (e.g., iPhone 8/X/11/12/13, Pixel 4/5, Galaxy S series)
- **Tablet Portrait:** ~768px width (e.g., iPad portrait)
- **Tablet Landscape:** ~1024px width (e.g., iPad landscape)
- **Small Desktop:** ~1280px width
- **Standard Desktop:** 1440px, 1920px width and above

**Specific Areas for Responsive Checks:**
1.  **Main Page Header (`App.tsx`):**
    *   Ensure title and subtitle font sizes are appropriate and readable.
2.  **3D Carousel Scene (`CarouselScene.tsx`, `ToolCard.tsx`):**
    *   **Card Legibility:** Text on tool cards (name, icon, description, chevron) should be readable on smaller screens.
    *   **Interaction:** Cards should remain easily interactive (hover, click) without feeling too cramped.
    *   **Overall View:** The 3D scene should not feel distorted or have elements clipped due to extreme aspect ratios.
3.  **Workspace Panel (`WorkspacePanel.tsx`):**
    *   **Layout Stacking:** The two-column layout (file input/controls and preview) must stack vertically on smaller screens (typically below `md` breakpoint).
    *   **Header:** The "← Back to All Tools" button and the tool title/description should be well-aligned, readable, and not overlap or cause layout breaks on any screen size.
    *   **Content:** File input area, tool-specific controls (e.g., Dark Mode toggle), and preview area should be usable and not overflow.
    *   **Modal Behavior:** Ensure the panel itself and its backdrop behave correctly on all screen sizes (e.g., takes up appropriate screen height/width).
4.  **Mini Carousel (`MiniCarousel.tsx`):**
    *   **Usability:** Should be easily scrollable (if content overflows) on touch devices and with scroll buttons.
    *   **Appearance:** Tool icons and names should be clear. The bar itself should not take up excessive vertical space on mobile.
    *   **Overflow:** Ensure the `maxWidth` calculation and scroll buttons work as expected.
5.  **General Layout:**
    *   Check for any horizontal scrolling on any page or component.
    *   Ensure no text or interactive elements are clipped or hidden.

### II. Cross-Browser Testing

Test on the latest stable versions of the following browsers:

**Desktop:**
- Google Chrome
- Mozilla Firefox
- Apple Safari (macOS)
- Microsoft Edge (Chromium)

**Mobile:**
- Google Chrome (Android)
- Apple Safari (iOS)

**Key Areas for Cross-Browser Checks:**
1.  **CSS Rendering:**
    *   **Flexbox/Grid:** Tailwind CSS generally handles this well, but complex layouts (like `WorkspacePanel` header) should be checked.
    *   **Custom Scrollbars:** The `no-scrollbar` utility in `MiniCarousel.tsx` uses browser-specific CSS (`-webkit-scrollbar`, `-ms-overflow-style`, `scrollbar-width`). Verify it works as expected or gracefully degrades (i.e., shows default scrollbars if unsupported, which is acceptable).
    *   **Backdrop Filters:** The `backdrop-blur-sm` on `WorkspacePanel`'s overlay. Check for support or graceful degradation (e.g., just a semi-transparent background).
    *   **Shadows and Transitions:** Ensure they render consistently.
2.  **JavaScript Functionality:**
    *   **Modern JS:** The project uses modern JavaScript (ES6+ via Vite and React). This is generally well-supported.
    *   **Event Handling:** Click, hover, drag-and-drop (`PDFProcessor.tsx`) events.
    *   **State Management & Animations:** Ensure React state updates and animations (`@react-spring/three`, `framer-motion`) trigger and behave as expected.
3.  **Three.js / WebGL (3D Scene):**
    *   **Core Requirement:** WebGL is essential. The application will not work on browsers/devices that do not support WebGL or have it disabled.
    *   **Performance:** Performance can vary significantly. While major performance optimization is a separate task, note any extreme sluggishness or crashes on specific browsers/devices, especially mobile.
    *   **Rendering Artifacts:** Look for visual glitches, z-fighting, or incorrect text rendering in the 3D scene.
4.  **File Input (`PDFProcessor.tsx`):**
    *   Test both click-to-select and drag-and-drop file input.
    *   Ensure `accept=".pdf"` is respected.

### III. General Notes

*   **Accessibility:** While not the primary focus of this testing round, make note of any obvious accessibility issues (e.g., poor color contrast, missing ARIA attributes for interactive elements not clear from context).
*   **Console Errors:** Keep an eye on the browser developer console for any errors or warnings during testing.

This checklist provides a starting point. Testers should also explore the application organically to catch any other potential issues.The `TESTING_NOTES.md` file has been created with comprehensive guidelines for responsive and cross-browser testing.

**Summary of Responsive Adjustments Made:**

*   **`App.tsx`:** Main header font sizes (`h1`, `p`) were made responsive using `sm:` prefixes.
*   **`WorkspacePanel.tsx`:** The header layout was adjusted to be `flex-col` on small screens and `flex-row` on `md:` screens and up. A spacer div was added for `md:` screens to help balance the "Back to All Tools" button and keep the title centered. Font sizes for the tool title and description within the panel were also made responsive.

**Review of Other Components for Responsiveness (as per thought process):**

*   **`MiniCarousel.tsx`:** Relies on `maxWidth: 'calc(100vw - 120px)'` and internal flexbox/overflow, which is generally good for responsiveness. The fixed height and padding of tool buttons (`min-w-[70px] h-[70px]`) should provide adequate touch targets.
*   **`ToolCard.tsx` (3D):** Text legibility is the main concern here, which is highly dependent on the device's screen resolution and the final scale of the cards. No direct changes were made as it's best evaluated visually on target devices. The `fov` and camera setup in `App.tsx` are standard.
*   **`PDFProcessor.tsx`:** Uses flexbox and standard Tailwind spacing/typography, which should adapt reasonably well. The drag-and-drop area and file list are structured to flow within their container.

**Cross-Browser Considerations Added (Implicitly by creating `TESTING_NOTES.md`):**

*   The `TESTING_NOTES.md` file covers:
    *   Specific CSS features to watch (custom scrollbars, backdrop filters).
    *   Modern JavaScript usage.
    *   WebGL dependency and performance variability.
    *   File input mechanisms.
    *   A list of target browsers and screen sizes.

**Final Check:**
The `index.html` viewport tag was confirmed to be correct.
The most critical responsive layout (stacking columns in `WorkspacePanel.tsx`) was already correctly handled by `grid-cols-1 md:grid-cols-2`. The header adjustments further improve this.

The subtask requirements to review and enhance responsiveness and add testing notes have been met.
The application should now be more usable on mobile devices, and there's a clear guide for further testing.

### IV. Unit and Integration Testing Setup (Recommended)

Since no automated testing framework is currently set up, the following is a recommendation for establishing a testing environment using Vitest and React Testing Library, which integrate well with Vite-based React projects.

**1. Installation:**

Open your terminal in the project root and run:
```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
or if using yarn:
```bash
yarn add --dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**2. Configuration (`vitest.config.ts`):**

Create a `vitest.config.ts` file in the project root (or merge with existing `vite.config.ts` if preferred):

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts', // Optional: for global test setup
    css: true, // If you want to process CSS during tests (e.g., for CSS modules)
    coverage: { // Optional: configure code coverage
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
  },
});
```
**Note on `vite.config.ts` vs `vitest.config.ts`:**
You can also add the `test` configuration directly into your existing `vite.config.ts`. If you do, ensure you add `/// <reference types="vitest" />` at the top of `vite.config.ts`.

**3. Setup File (Optional: `src/test/setup.ts`):**

If you created a `setupFiles` entry in the config, create the file (e.g., `src/test/setup.ts`):
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'; // Extends jest-dom matchers for Vitest

// You can add other global setup here, e.g.:
// - Mock global objects (fetch, localStorage)
// - Configure testing-library defaults
```
If you don't need a setup file initially, you can omit the `setupFiles` line from `vitest.config.ts`.

**4. Example Test File Structure:**

Create test files alongside your components or in a dedicated `__tests__` directory.
Example: `src/components/LoadingSpinner.test.tsx`

```tsx
// src/components/LoadingSpinner.test.tsx
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner'; // Adjust path as necessary
import { describe, it, expect } from 'vitest';

describe('LoadingSpinner', () => {
  it('renders correctly when visible', () => {
    // Assuming LoadingSpinner's visibility is controlled by a prop or context in a real scenario.
    // For this example, let's assume it's always visible when rendered directly.
    render(<LoadingSpinner />);
    
    const spinnerElement = screen.getByRole('status'); // Or other appropriate role/test-id
    expect(spinnerElement).toBeInTheDocument();
    
    // Example: Check for specific class if it's key to its appearance/function
    // expect(spinnerElement.firstChild).toHaveClass('animate-spin'); 
  });

  // Add more tests for different states/props if applicable.
});
```

**5. Running Tests:**

Add scripts to your `package.json`:
```json
{
  "scripts": {
    // ... existing scripts
    "test": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```
Then run tests using:
```bash
npm run test
npm run test:ui # For the Vitest UI
npm run coverage # To generate a coverage report
```

**First Test Candidates:**
- **Utility functions:** If any were created (e.g., in `src/utils.ts`), these are ideal for unit tests.
- **Simple Presentational Components:** Components that primarily render UI based on props without complex internal logic or state (e.g., `LoadingSpinner`, parts of `WorkspacePanel`'s UI if broken down further, or individual buttons).
- **`PDFProcessor.tsx`:** Test aspects like file list rendering based on `selectedFiles` state (mocking `File` objects).

This setup provides a solid foundation for writing unit and integration tests for your React components.
