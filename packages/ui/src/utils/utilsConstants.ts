export const CURVE_ASSETS_URL = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'

export function getImageBaseUrl(blockchainId: string) {
  return `${CURVE_ASSETS_URL}/images/assets${blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`
}
