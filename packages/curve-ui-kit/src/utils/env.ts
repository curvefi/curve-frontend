const { NODE_ENV } = typeof process === 'undefined' ? {} : process.env

export enum ReleaseChannel {
  Beta = 'Beta',
  Stable = 'Stable',
  Legacy = 'Legacy',
}

export const IS_CYPRESS = Boolean((window as { Cypress?: unknown }).Cypress)
export const NO_CYPRESS_TEST_CONNECTOR = Boolean(
  (window as { CypressNoTestConnector?: unknown }).CypressNoTestConnector,
)

export const IS_DEVELOPMENT = NODE_ENV === 'development' || !!window.localStorage?.getItem('developer')
export const IS_PREVIEW_HOST = window.location.hostname.includes('vercel.app')

const IS_DEFAULT_BETA = IS_DEVELOPMENT || IS_PREVIEW_HOST || IS_CYPRESS

export const defaultReleaseChannel = IS_DEFAULT_BETA ? ReleaseChannel.Beta : ReleaseChannel.Stable
export const ENABLE_LOGGING = IS_DEFAULT_BETA
