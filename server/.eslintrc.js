// file: code/server/.eslintrc.js (file mới, kiểu cũ)
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended', // Luôn đặt Prettier ở cuối
    ],
    env: {
      node: true, // Cho phép các biến global của Node
    },
    rules: {
      // Các rule tùy chỉnh của ông
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'warn', // Báo warning thay vì error cho Prettier
    },
  };