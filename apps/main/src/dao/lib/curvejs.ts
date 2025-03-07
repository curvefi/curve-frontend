import cloneDeep from 'lodash/cloneDeep'
import type { FormType as LockFormType } from '@/dao/components/PageVeCrv/types'
import networks from '@/dao/networks'
import {
  CurveApi,
  ChainId,
  Provider,
  Wallet,
  EstimatedGas,
  UsdRatesMapper,
  ClaimButtonsKey,
} from '@/dao/types/dao.types'
import { getErrorMessage } from '@/dao/utils'
import type { DateValue } from '@internationalized/date'
import PromisePool from '@supercharge/promise-pool/dist'
import { log } from '@ui-kit/lib'
import dayjs from '@ui-kit/lib/dayjs'

export const helpers = {
  initCurveJs: async (chainId: ChainId, wallet: Wallet | null) => {
    const { networkId, rpcUrl } = networks[chainId] ?? {}
    if (!networkId) {
      throw new Error('Unable to initialize curvejs without networkId')
    }

    const curveApi = cloneDeep((await import('@curvefi/api')).default) as CurveApi
    if (wallet) {
      await curveApi.init('Web3', { network: networkId, externalProvider: getWalletProvider(wallet) }, { chainId })
      return curveApi
    }
    if (rpcUrl) {
      await curveApi.init('JsonRpc', { url: rpcUrl }, { chainId })
      return curveApi
    }
    throw new Error('Unable to initialize curvejs without wallet or rpcUrl')
  },
  fetchL1GasPrice: async (curve: CurveApi) => {
    const resp = { l1GasPriceWei: 0, l2GasPriceWei: 0, error: '' }
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
  waitForTransaction: async (hash: string, provider: Provider) => provider.waitForTransaction(hash),
  waitForTransactions: async (hashes: string[], provider: Provider) => {
    const { results, errors } = await PromisePool.for(hashes).process(
      async (hash) => await provider.waitForTransaction(hash),
    )
    if (Array.isArray(errors) && errors.length > 0) {
      throw errors
    } else {
      return results
    }
  },
  fetchUsdRates: async (curve: CurveApi, tokenAddresses: string[]) => {
    log('fetchUsdRates', tokenAddresses.length)
    const results: UsdRatesMapper = {}

    await PromisePool.for(tokenAddresses)
      .withConcurrency(5)
      .handleError((error, tokenAddress) => {
        console.error(`Unable to get usd rate for ${tokenAddress}`)
        results[tokenAddress] = NaN
      })
      .process(async (tokenAddress) => {
        results[tokenAddress] = await curve.getUsdRate(tokenAddress)
      })
    return results
  },
}

const lockCrv = {
  vecrvInfo: async (activeKey: string, curve: CurveApi, walletAddress: string) => {
    log('vecrvInfo', curve.chainId, walletAddress)
    const resp = {
      activeKey,
      resp: {
        crv: '',
        lockedAmountAndUnlockTime: { lockedAmount: '', unlockTime: 0 },
        veCrv: '',
        veCrvPct: '',
      },
      error: '',
    }

    try {
      const [crv, lockedAmountAndUnlockTime, veCrv, veCrvPct] = await Promise.all([
        curve.boosting.getCrv([walletAddress]),
        curve.boosting.getLockedAmountAndUnlockTime([walletAddress]),
        curve.boosting.getVeCrv([walletAddress]),
        curve.boosting.getVeCrvPct([walletAddress]),
      ])
      resp.resp.crv = crv as string
      resp.resp.lockedAmountAndUnlockTime = lockedAmountAndUnlockTime as { lockedAmount: string; unlockTime: number }
      resp.resp.veCrv = veCrv as string
      resp.resp.veCrvPct = veCrvPct as string

      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-locked-crv-info')
      return resp
    }
  },
  calcUnlockTime: (curve: CurveApi, formType: LockFormType, currTime: number | null, days: number | null) => {
    log('calcUnlockTime', formType, currTime, days)
    let unlockTime = 0
    if (formType === 'adjust_date' && currTime && days) {
      unlockTime = curve.boosting.calcUnlockTime(days, currTime)
    } else if (formType === 'create' && days) {
      unlockTime = curve.boosting.calcUnlockTime(days)
    }
    return dayjs.utc(unlockTime)
  },
  createLock: async (
    activeKey: string,
    curve: CurveApi,
    provider: Provider,
    lockedAmount: string,
    utcDate: DateValue,
    days: number,
  ) => {
    log('createLock', lockedAmount, utcDate.toString(), days)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.createLock(lockedAmount, days)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-create-locked-crv')
      return resp
    }
  },
  estGasApproval: async (
    activeKey: string,
    curve: CurveApi,
    formType: LockFormType,
    lockedAmount: string,
    days: number | null,
  ) => {
    log('lockCrvEstGasApproval', formType, lockedAmount, days)
    const resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved =
        formType === 'adjust_crv' || formType === 'create' ? await curve.boosting.isApproved(lockedAmount) : true

      if (resp.isApproved) {
        if (formType === 'create' && days) {
          resp.estimatedGas = await curve.boosting.estimateGas.createLock(lockedAmount, days)
        } else if (formType === 'adjust_crv') {
          resp.estimatedGas = await curve.boosting.estimateGas.increaseAmount(lockedAmount)
        } else if (formType === 'adjust_date' && days) {
          resp.estimatedGas = await curve.boosting.estimateGas.increaseUnlockTime(days)
        }
      } else {
        resp.estimatedGas =
          formType === 'create' || formType === 'adjust_crv'
            ? await curve.boosting.estimateGas.approve(lockedAmount)
            : 0
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  lockCrvApprove: async (activeKey: string, provider: Provider, curve: CurveApi, lockedAmount: string) => {
    log('userLockCrvApprove', lockedAmount)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await curve.boosting.approve(lockedAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  increaseAmount: async (activeKey: string, curve: CurveApi, provider: Provider, lockedAmount: string) => {
    log('increaseAmount', lockedAmount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.increaseAmount(lockedAmount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-locked-crv')
      return resp
    }
  },
  increaseUnlockTime: async (activeKey: string, provider: Provider, curve: CurveApi, days: number) => {
    log('increaseUnlockTime', days)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.increaseUnlockTime(days)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-locked-time')
      return resp
    }
  },
  withdrawLockedCrv: async (curve: CurveApi, provider: Provider, walletAddress: string) => {
    log('withdrawLockedCrv', curve.chainId)
    const resp = { walletAddress, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.withdrawLockedCrv()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-withdraw-locked-crv')
      return resp
    }
  },
  claimFees: async (activeKey: string, curve: CurveApi, provider: Provider, key: ClaimButtonsKey) => {
    log('claimFees', curve.chainId, key)
    const resp = { activeKey, hash: '', error: '' }

    try {
      const isClaim3Crv = key === ClaimButtonsKey['3CRV']
      resp.hash = isClaim3Crv ? await curve.boosting.claimFees() : await curve.boosting.claimFeesCrvUSD()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim-fees')
      return resp
    }
  },
}

const curvejsApi = {
  helpers,
  lockCrv,
}

export default curvejsApi

export function getWalletProvider(wallet: Wallet) {
  if ('isTrustWallet' in wallet.provider) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  } else if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}
