module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ['custom'],
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/ui/*/', 'packages/onboard-helpers/*/']
    }
  },
  overrides: [
    // enforce Feature Sliced rules for loan app
    {
      files: [
        'apps/loan/src/{app,processes,pages,widgets,features,entities,shared}/**/*.{ts,tsx}',
        'packages/curve-lib/src/shared/**/*.ts'
      ],
      rules: {
        'import/order': 'error', // feature-sliced/import-order
        'import/no-internal-modules': 'error', // feature-sliced/public-api
        'boundaries/element-types': 'error' // feature-sliced/layers-slices
      }
    },
    // warn about Feature Sliced rules for main and lend apps
    {
      files: [
        'apps/{main,lend}/src/{app,processes,pages,widgets,features,entities,shared}/**/*.{ts,tsx}'
      ],
      rules: {
        'import/order': 'warn', // feature-sliced/import-order
        'import/no-internal-modules': 'warn', // feature-sliced/public-api
        'boundaries/element-types': 'warn' // feature-sliced/layers-slices
      }
    }
  ]
}
