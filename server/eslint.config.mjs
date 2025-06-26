// file: code/server/eslint.config.js (Phiên bản SỬA LỖI)

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'eslint.config.js'],
  },
  {
    files: ['src/**/*.ts'],
    // === PHẦN SỬA LỖI NẰM Ở ĐÂY ===
    languageOptions: {
      parser: tseslint.parser, // <-- **CHÌA KHÓA VÀNG** MÀ TUI QUÊN!
      parserOptions: {
        project: true, // Báo cho parser biết vị trí file tsconfig
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // ===============================
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettierConfig,
);