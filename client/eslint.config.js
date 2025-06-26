// file: code/client/eslint.config.js

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier'; // <-- BƯỚC 1: IMPORT THÊM

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'eslint.config.js'] }, // Thêm eslint.config.js vào ignore
  {
    // Đây là cấu hình chung cho cả dự án
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node, // Thêm globals của Node để ESLint không báo lỗi với các file config
      },
      parser: tseslint.parser, // Chỉ định parser ở đây
      parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Mình có thể custom thêm rule ở đây, ví dụ:
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // BƯỚC 2: ĐẶT CONFIG CỦA PRETTIER VÀO CUỐI CÙNG
  // Nó sẽ tắt các rule của ESLint mà xung đột với Prettier.
  prettierConfig, 
);