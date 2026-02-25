import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|mts|ts|tsx)',
    '../../../apps/**/*.stories.@(js|jsx|mjs|mts|ts|tsx)',
  ],
  staticDirs: ['../public'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-themes', '@storybook/addon-a11y', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  core: {
    disableTelemetry: true,
  },

  docs: {},
  typescript: {},

  /**
   * TODO: Temporary workaround for Storybook issue #12129
   *
   * There's currently a bug in Storybook that affects the TypeScript configuration
   * and causes issues with react-docgen-typescript. The configuration below is commented out
   * due to these issues.
   *
   * Instead, we're currently using a solution proposed in a comment on the GitHub issue:
   * https://github.com/storybookjs/storybook/issues/12129#issuecomment-1486722918
   *
   * This solution involves manually defining `argTypes` in each story file. While this
   * requires more work, it allows us to have proper typing and avoid build errors.
   *
   * Example usage in a story file:
   * ```
   * export default {
   *   component: MyComponent,
   *   argTypes: {
   *     prop1: { control: 'text' },
   *     prop2: { control: 'boolean' },
   *   },
   * } as Meta<typeof MyComponent>;
   * ```
   *
   * Once the Storybook issue is resolved, we can revisit this configuration and potentially
   * switch back to using react-docgen-typescript for automatic prop type inference.
   */
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
