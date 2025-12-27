import { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'

const CDN_ROOT_URL = 'https://cdn.jsdelivr.net'
export const CURVE_CDN_URL = `${CDN_ROOT_URL}/gh/curvefi`
export const CURVE_ASSETS_URL = `${CURVE_CDN_URL}/curve-assets`
export const CURVE_LOGO_URL = `${CURVE_ASSETS_URL}/branding/logo.png`
export const ERROR_IMAGE_URL = `${CURVE_ASSETS_URL}/branding/four-oh-llama.jpg`

export const getImageBaseUrl = (blockchainId: string) =>
  `${CURVE_ASSETS_URL}/images/assets${!blockchainId || blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`

/** Key: old name, value: new name */
export const BLOCKCHAIN_LEGACY_NAMES: Record<string, string> = {
  gnosis: 'xdai',
}

export const getBlockchainIconUrl = (blockchainId: string, theme?: 'dark') =>
  `${CURVE_ASSETS_URL}/chains/${BLOCKCHAIN_LEGACY_NAMES[blockchainId] ?? blockchainId}${theme ? `-${theme}` : ''}.png`

export const getBackgroundUrl = (theme: ThemeKey) => `${CURVE_ASSETS_URL}/branding/curve_illustration-${theme}.svg`
