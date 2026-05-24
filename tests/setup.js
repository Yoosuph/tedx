// Vitest setup file. Loaded once per worker before any test runs.
//
// Responsibilities:
//   1. Register @testing-library/jest-dom matchers (toBeInTheDocument, etc.).
//   2. Reset all module mocks between tests so state from one spec cannot leak
//      into another.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { vi } from 'vitest';

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
