/**
 * NextJS local font isn't available in Cypress component tests.
 * And we can't conditionally call it either in the font.ts file,
 * so we have to mock it here, even though we don't really use the result.
 *
 * This mock is imported in vite.config.ts for cypress:
 * `{ find: 'next/font/local', replacement: resolve(__dirname, 'cypress/support/mocks/next-font-local.ts') },`
 */
export default function localFont(_config: any) {
  return {
    style: { fontFamily: 'Arial, sans-serif' },
  }
}
