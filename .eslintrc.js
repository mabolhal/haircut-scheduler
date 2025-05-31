const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Disable specific rules
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off'
  },
  ...compat.config({
    extends: ['plugin:@typescript-eslint/recommended']
  })
}; 