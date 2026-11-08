import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'diagnostics-report/**',
      'diagnostics-results/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
