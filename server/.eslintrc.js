// file: code/server/.eslintrc.js
module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended', // Bật tích hợp Prettier
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      // Tắt các rule không cần thiết hoặc tùy chỉnh ở đây
      // Ví dụ: cho phép dùng any nhưng nên hạn chế
      '@typescript-eslint/no-explicit-any': 'warn', 
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Báo warning nếu có biến không dùng
      'prettier/prettier': [
        'error',
        {
          'endOfLine': 'auto'
        }
      ]
    },  
  };