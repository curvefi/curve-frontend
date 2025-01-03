export const CURVE_ASSETS_URL = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'

export const getImageBaseUrl = (blockchainId: string) =>
  `${CURVE_ASSETS_URL}/images/assets${blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`
