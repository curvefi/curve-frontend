import fetch from 'cross-fetch'
import networks from '@/networks'

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

export function copyToClipboard(text: string) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text)
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    var textarea = document.createElement('textarea')
    textarea.textContent = text
    textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea)
    textarea.select()
    try {
      return document.execCommand('copy') // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex)
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

export function haveWalletLpToken(balances: Balances) {
  return Number(balances?.lpToken || '0') > 0 || Number(balances?.gauge || '0') > 0
}

export function curveProps(curve: CurveApi | null) {
  if (curve) {
    const { chainId, signerAddress } = curve
    return {
      chainId,
      haveSigner: !!signerAddress,
      signerAddress: signerAddress,
      network: networks[chainId],
    }
  } else {
    return {
      chainId: null,
      haveSigner: false,
      signerAddress: '',
      network: null,
    }
  }
}
