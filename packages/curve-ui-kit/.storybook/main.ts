import { join, dirname } from 'path'
import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|mts|ts|tsx)'],
  staticDirs: ['../public'],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-a11y'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },

  core: {
    disableTelemetry: true,
  },

  docs: {},
  typescript: {},

  // TODO: wait for fix https://github.com/storybookjs/storybook/issues/12129
  // typescript: {
  //   reactDocgen: react-docgen-typescript,
  //   reactDocgenTypescriptOptions: {
  //     include: ['**/**.tsx', 'src/entities/theme/types/button.d.ts', '../src/**/*.ts', '../src/**/*.d.ts'],
  //     tsconfigPath: '../tsconfig.json',
  //     // Speeds up Storybook build time
  //     compilerOptions: {
  //       allowSyntheticDefaultImports: false,
  //       esModuleInterop: false,
  //       // include: ['../src/**/*.tsx', '../src/**/*.ts', '../src/**/*.d.ts'],
  //     },
  //     // Makes union prop types like variant and size appear as select controls
  //     shouldExtractLiteralValuesFromEnum: true,
  //     // Makes string and boolean types that can be undefined appear as inputs and switches
  //     shouldRemoveUndefinedFromOptional: true,
  //     // Filter out third-party props from node_modules except @mui packages
  //     propFilter: (prop) =>
  //       prop.parent ? /@mui/.test(prop.parent.fileName) || !/node_modules/.test(prop.parent.fileName) : true,
  //   },
  // },

  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
      }
    }
    return config
  },

  previewHead: (head) => `
    ${head}
    <style>
      #storybook-root {
        padding: 1rem;
      }
    </style>
  `,
}
export default config
