module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ['custom'],
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/ui/*/', 'packages/onboard-helpers/*/'],
    },
  },
  overrides: [{
    files: [
      'apps/{loan,lend}/src/{entities,features}/**/*.{ts,tsx}',
      "packages/curve-lib/src/shared/**/*.ts",
    ],
    rules: {
      'import/order': 'error', // feature-sliced/import-order
      'import/no-internal-modules': 'error', // feature-sliced/public-api
      'boundaries/element-types': 'error' // feature-sliced/layers-slices
    },
  }, {
    files: [
      'apps/main/src/{entities,features}/**/*.{ts,tsx}'
    ],
    rules: {
      'import/order': 'warn', // feature-sliced/import-order
      'import/no-internal-modules': 'warn', // feature-sliced/public-api
      'boundaries/element-types': 'warn' // feature-sliced/layers-slices
    },
  }],
}
