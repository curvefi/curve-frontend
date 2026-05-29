const { NODE_ENV } = typeof process === 'undefined' ? {} : process.env

export enum ReleaseChannel {
  Beta = 'Beta',
  Stable = 'Stable',
  Legacy = 'Legacy',
}

export const isCypress = Boolean((window as { Cypress?: unknown }).Cypress)
export const noCypressTestConnector = Boolean((window as { CypressNoTestConnector?: unknown }).CypressNoTestConnector)

export const isDevelopment = NODE_ENV === 'development' || !!window.localStorage.getItem('developer')
export const isPreviewHost = window.location.hostname.includes('vercel.app')

const isDefaultBeta = isDevelopment || isPreviewHost || isCypress

export const defaultReleaseChannel = isDefaultBeta ? ReleaseChannel.Beta : ReleaseChannel.Stable
export const enableLogging = isDefaultBeta
