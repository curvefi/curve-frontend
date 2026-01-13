import type { FormType as LockFormType } from '@/dao/components/PageVeCrv/types'
import { CurveApi, Provider, EstimatedGas, ClaimButtonsKey } from '@/dao/types/dao.types'
import { getErrorMessage } from '@/dao/utils'
import type { DateValue } from '@internationalized/date'
import { log } from '@ui-kit/lib'
import { dayjs } from '@ui-kit/lib/dayjs'
import { waitForTransaction, waitForTransactions } from '@ui-kit/lib/ethers'

export const helpers = {
  waitForTransaction,
  waitForTransactions,
}

const lockCrv = {
  vecrvInfo: async (curve: CurveApi, walletAddress: string) => {
    log('vecrvInfo', curve.chainId, walletAddress)
    const resp = {
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
  estGasWithdrawLockedCrv: async (curve: CurveApi, walletAddress: string) => {
    log('estGasWithdrawLockedCrv', curve.chainId, walletAddress)
    const resp = { estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await curve.boosting.estimateGas.withdrawLockedCrv()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-withdraw-locked-crv')
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

export const curvejsApi = {
  helpers,
  lockCrv,
}
