export const CDN_ROOT_URL = 'https://cdn.jsdelivr.net'
export const CURVE_CDN_URL = `${CDN_ROOT_URL}/gh/curvefi`
export const CURVE_ASSETS_URL = `${CURVE_CDN_URL}/curve-assets`
export const CURVE_LOGO_URL = `${CURVE_ASSETS_URL}/branding/logo.png`
export const NOT_FOUND_IMAGE_URL = `${CURVE_ASSETS_URL}/branding/four-oh-llama.jpg`

export const MAX_USD_VALUE = 100_000_000_000_000 // $ 100T 🤑

export const getImageBaseUrl = (blockchainId: string) =>
  `${CURVE_ASSETS_URL}/images/assets${blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`

export const getBlockchainIconUrl = (blockchainId: string) => `${CURVE_ASSETS_URL}/chains/${blockchainId}.png`

export const getBackgroundUrl = (theme: 'light' | 'dark') =>
  `${CURVE_ASSETS_URL}/branding/curve_illustration-${theme === 'light' ? 'light' : 'dark'}.svg`
