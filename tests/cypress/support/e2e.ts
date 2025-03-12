import './commands'

// Cypress injects a script into the page that makes the hydration fail
// This is a known issue and can be safely ignored. See https://github.com/cypress-io/cypress/issues/27204
const IGNORE_ERROR_PATTERNS = [
  /Hydration failed/i,
  /Minified React error #418/,
  /Minified React error #423/,

  // todo: chunk load issues happen in firefox when trying to load onboard from the dev server
  /Loading chunk/,
]

Cypress.on('uncaught:exception', (err) => {
  const ignore = IGNORE_ERROR_PATTERNS.find((p) => p.test(err.message))
  console.log('Uncaught exception', ignore ? `ignored: ${ignore.source}` : err.message)
  if (ignore) {
    return false // this will prevent the test from failing
  }
})
