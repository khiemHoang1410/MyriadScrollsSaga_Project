// file: code/server/eslint.config.js (File mới)

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Bỏ qua các thư mục không cần lint
    ignores: ['dist', 'node_modules', 'eslint.config.js'],
  },
  {
    // Cấu hình chính cho các file TypeScript
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        node: true, // Cho phép các biến global của môi trường Node.js
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // Các rule tùy chỉnh của ông
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Đặt config của Prettier ở cuối cùng để nó ghi đè các rule style
  prettierConfig,
);