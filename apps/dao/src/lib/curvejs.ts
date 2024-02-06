import PromisePool from '@supercharge/promise-pool/dist'

import networks from '@/networks'
import cloneDeep from 'lodash/cloneDeep'

export const helpers = {
  initCurveJs: async (chainId: ChainId, wallet: Wallet | null) => {
    let curveApi = null
    const { networkId, rpcUrl } = networks[chainId] ?? {}

    try {
      if (networkId) {
        curveApi = cloneDeep((await import('@curvefi/api')).default) as CurveApi

        if (wallet) {
          await curveApi.init('Web3', { network: networkId, externalProvider: getWalletProvider(wallet) }, { chainId })
          return curveApi
        } else if (rpcUrl) {
          await curveApi.init('JsonRpc', { url: rpcUrl }, { chainId })
          return curveApi
        }
      }
    } catch (error) {
      console.error(error)
    }
  },
  fetchL1GasPrice: async (curve: CurveApi) => {
    let resp = { l1GasPriceWei: 0, l2GasPriceWei: 0, error: '' }
    try {
      if (networks[curve.chainId].gasL2) {
        const [l2GasPriceWei, l1GasPriceWei] = await Promise.all([curve.getGasPriceFromL2(), curve.getGasPriceFromL1()])
        resp.l2GasPriceWei = l2GasPriceWei
        resp.l1GasPriceWei = l1GasPriceWei
      }
      return resp
    } catch (error) {
      console.error(error)
      // resp.error = getErrorMessage(error, 'error-get-gas')
      // TODO: fix
      return resp
    }
  },
  waitForTransaction: async (hash: string, provider: Provider) => {
    return provider.waitForTransaction(hash)
  },
  waitForTransactions: async (hashes: string[], provider: Provider) => {
    const { results, errors } = await PromisePool.for(hashes).process(
      async (hash) => await provider.waitForTransaction(hash)
    )
    if (Array.isArray(errors) && errors.length > 0) {
      throw errors
    } else {
      return results
    }
  },
}

const curvejsApi = {}

export default curvejsApi

export function getImageBaseUrl(rChainId: ChainId) {
  return rChainId ? networks[rChainId].imageBaseUrl ?? '' : ''
}

export function getWalletProvider(wallet: Wallet) {
  if ('isTrustWallet' in wallet.provider) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  } else if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}
