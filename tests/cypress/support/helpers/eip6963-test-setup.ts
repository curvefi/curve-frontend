/**
 * Ensure eip6963Connectors exists in Cypress tests.
 *
 * The app's HTML normally loads src/eip-6963.ts first, which initializes
 * window.eip6963Connectors before the wallet connectors module is evaluated.
 * Cypress pages skip that script, so we seed the value here to avoid
 * import-time access errors like `window.eip6963Connectors.map(...)`.
 */
window.eip6963Connectors ??= []

Cypress.on('window:before:load', (win) => {
  win.eip6963Connectors ??= []
})
