import type { GetState, SetState } from 'zustand'
import type { State } from '@main/store/useStore'
import type { FormEstGas, FormStatus, FormType, FormValues, VecrvInfo } from '@main/components/PageCrvLocker/types'

import cloneDeep from 'lodash/cloneDeep'

import {
  DEFAULT_FORM_EST_GAS,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
  DEFAULT_USER_LOCKED_CRV_INFO,
} from '@main/components/PageCrvLocker/utils'

import { formatNumber, shortenAccount } from '@ui/utils'
import curvejsApi from '@main/lib/curvejs'
import dayjs from '@ui-kit/lib/dayjs'
import {
  ChainId,
  CurveApi,
  FnStepApproveResponse,
  FnStepEstGasApprovalResponse,
  FnStepResponse,
} from '@main/types/main.types'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  activeKeyVecrvInfo: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formValues: FormValues
  formStatus: FormStatus
  vecrvInfo: { [vecrvInfoActiveKey: string]: VecrvInfo }
}

const sliceKey = 'lockedCrv'

// prettier-ignore
export type LockedCrvSlice = {
  [sliceKey]: SliceState & {
    fetchVecrvInfo: (curve: CurveApi) => Promise<VecrvInfo>
    setFormValues: (curve: CurveApi | null, isLoadingCurve: boolean, rFormType: FormType, formValues: Partial<FormValues>, vecrvInfo: VecrvInfo, isFullReset?: boolean) =>  void

    // steps
    fetchEstGasApproval(activeKey: string, curve: CurveApi, rFormType: FormType, formValues: FormValues): Promise<FnStepEstGasApprovalResponse>
    fetchStepApprove(activeKey: string, curve: CurveApi, rFormType: FormType, formValues: FormValues): Promise<FnStepApproveResponse | undefined>
    fetchStepCreate(activeKey: string, curve: CurveApi, formValues: FormValues): Promise<FnStepResponse & { lockedAmt: string, lockedDate: string } | undefined>
    fetchStepIncreaseCrv(activeKey: string, curve: CurveApi, formValues: FormValues): Promise<FnStepResponse  | undefined>
    fetchStepIncreaseTime(activeKey: string, curve: CurveApi, formValues: FormValues): Promise<FnStepResponse  | undefined>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_STATE: SliceState = {
  activeKey: '',
  activeKeyVecrvInfo: '',
  formEstGas: {},
  formValues: DEFAULT_FORM_VALUES,
  formStatus: DEFAULT_FORM_STATUS,
  vecrvInfo: {},
}

const createLockedCrvSlice = (set: SetState<State>, get: GetState<State>): LockedCrvSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchVecrvInfo: async (curve) => {
      let resp = cloneDeep(DEFAULT_USER_LOCKED_CRV_INFO)
      const activeKey = getActiveKeyVecrvInfo(curve, curve.signerAddress)

      if (curve.signerAddress) {
        get()[sliceKey].setStateByKey('activeKeyVecrvInfo', activeKey)
        const fetchedResp = await curvejsApi.lockCrv.vecrvInfo(activeKey, curve, curve.signerAddress)

        if (fetchedResp.error) {
          let storedFormStatus = cloneDeep(get()[sliceKey].formStatus)
          storedFormStatus.error = fetchedResp.error
          get()[sliceKey].setStateByKey('formStatus', cloneDeep(storedFormStatus))
        }

        get()[sliceKey].setStateByKeys({
          activeKeyVecrvInfo: fetchedResp.activeKey,
          vecrvInfo: { [fetchedResp.activeKey]: fetchedResp.resp },
        })
        resp = fetchedResp.resp
      } else {
        get()[sliceKey].setStateByKeys({
          activeKeyVecrvInfo: activeKey,
          vecrvInfo: { [activeKey]: resp },
        })
      }
      return resp
    },
    setFormValues: async (curve, isLoadingCurve, rFormType, updatedFormValues, vecrvInfo, isFullReset) => {
      // stored state
      const storedFormValues = get()[sliceKey].formValues

      let cFormValues = cloneDeep({ ...storedFormValues, ...updatedFormValues })
      cFormValues.lockedAmtError = ''
      cFormValues.lockedAmtError = ''

      let cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      cFormStatus.error = ''

      if (isFullReset) {
        cFormValues = cloneDeep(DEFAULT_FORM_VALUES)
      }

      const activeKey = getActiveKey(rFormType, curve?.chainId, curve?.signerAddress)
      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cloneDeep(cFormStatus),
      })

      if (!curve || isLoadingCurve || !curve?.signerAddress || !vecrvInfo) return

      // validate form
      cFormValues.lockedAmtError = +cFormValues.lockedAmt > +vecrvInfo.crv ? 'too-much' : ''
      get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))

      //   fetch est gas
      const isValidLockedAmt = +cFormValues.lockedAmt > 0 && !cFormValues.lockedAmtError
      const isValidDays = cFormValues.days > 0 && !cFormValues.utcDateError
      const isValidCreateForm = rFormType === 'create' ? isValidLockedAmt && isValidDays : true
      const isValidLockCrvForm = rFormType === 'adjust_crv' ? isValidLockedAmt : true
      const isValidLockDateForm = rFormType === 'adjust_date' ? isValidDays : true

      if (isValidCreateForm && isValidLockCrvForm && isValidLockDateForm) {
        get()[sliceKey].fetchEstGasApproval(activeKey, curve, rFormType, cFormValues)
      } else {
        get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: DEFAULT_FORM_EST_GAS })
      }
    },

    fetchEstGasApproval: async (activeKey, curve, rFormType, formValues) => {
      let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      let cFormEstGas = cloneDeep({ ...DEFAULT_FORM_EST_GAS, loading: true })

      get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, cloneDeep(cFormEstGas))

      const resp = await curvejsApi.lockCrv.estGasApproval(
        activeKey,
        curve,
        rFormType,
        formValues.lockedAmt,
        formValues.days,
      )

      cFormEstGas.loading = false

      if (resp.error) {
        cFormStatus.error = resp.error
      } else {
        cFormEstGas.estimatedGas = resp.estimatedGas
        cFormStatus.isApproved = resp.isApproved
      }
      get()[sliceKey].setStateByKeys({
        formStatus: cloneDeep(cFormStatus),
        formEstGas: { [activeKey]: cFormEstGas },
      })
      return resp
    },
    fetchStepApprove: async (activeKey, curve, rFormType, formValues) => {
      const { provider } = useWallet.state
      if (!provider) return setMissingProvider(get()[sliceKey])

      let cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      cFormStatus.formProcessing = true
      cFormStatus.step = 'APPROVAL'
      get()[sliceKey].setStateByKey('formStatus', cloneDeep(cFormStatus))

      await get().gas.fetchGasInfo(curve)
      const resp = await curvejsApi.lockCrv.lockCrvApprove(activeKey, provider, curve, formValues.lockedAmt)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        cFormStatus.formProcessing = false
        cFormStatus.step = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.isApproved = true
          cFormStatus.formTypeCompleted = 'APPROVE'
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)

          // fetch est gas and approval
          await get()[sliceKey].fetchEstGasApproval(activeKey, curve, rFormType, formValues)
        }

        return resp
      }
    },
    fetchStepCreate: async (activeKey, curve, formValues) => {
      const { provider } = useWallet.state
      if (!provider) return setMissingProvider(get()[sliceKey])

      if (formValues.lockedAmt && formValues.utcDate && formValues.days) {
        let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = true
        cFormStatus.step = 'CREATE_LOCK'
        get()[sliceKey].setStateByKey('formStatus', cloneDeep(cFormStatus))

        await get().gas.fetchGasInfo(curve)
        const resp = await curvejsApi.lockCrv.createLock(
          activeKey,
          curve,
          provider,
          formValues.lockedAmt,
          formValues.utcDate,
          formValues.days,
        )

        if (resp.activeKey === get()[sliceKey].activeKey) {
          cFormStatus = cloneDeep(get()[sliceKey].formStatus)
          cFormStatus.formProcessing = false
          cFormStatus.step = ''
          cFormStatus.error = ''

          if (resp.error) {
            cFormStatus.error = resp.error
            get()[sliceKey].setStateByKey('formStatus', cFormStatus)
          } else {
            cFormStatus.formTypeCompleted = 'CREATE_LOCK'
            get()[sliceKey].setStateByKeys({
              formValues: cloneDeep(DEFAULT_FORM_VALUES),
              formStatus: cloneDeep(cFormStatus),
            })
          }

          // re-fetch data
          const fetchedVecrvInfo = await get()[sliceKey].fetchVecrvInfo(curve)
          if (fetchedVecrvInfo) {
            const lockedAmt = formatNumber(fetchedVecrvInfo.lockedAmountAndUnlockTime.lockedAmount)
            const lockedDate = dayjs.utc(fetchedVecrvInfo.lockedAmountAndUnlockTime.unlockTime).format('l')
            return { ...resp, lockedAmt, lockedDate }
          }
        }
      }
    },
    fetchStepIncreaseCrv: async (activeKey, curve, formValues) => {
      const { provider } = useWallet.state
      if (!provider) return setMissingProvider(get()[sliceKey])

      let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.formProcessing = true
      cFormStatus.step = 'INCREASE_CRV'
      get()[sliceKey].setStateByKey('formStatus', cloneDeep(cFormStatus))
      await get().gas.fetchGasInfo(curve)
      const resp = await curvejsApi.lockCrv.increaseAmount(activeKey, curve, provider, formValues.lockedAmt)
      if (resp.activeKey === get()[sliceKey].activeKey) {
        cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'INCREASE_CRV'
          get()[sliceKey].setStateByKeys({
            formValues: cloneDeep(DEFAULT_FORM_VALUES),
            formStatus: cloneDeep(cFormStatus),
          })

          // re-fetch data
          get()[sliceKey].fetchVecrvInfo(curve)
        }

        return resp
      }
    },
    fetchStepIncreaseTime: async (activeKey, curve, formValues) => {
      const { provider } = useWallet.state
      if (!provider) return setMissingProvider(get()[sliceKey])

      let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.formProcessing = true
      cFormStatus.step = 'INCREASE_TIME'
      get()[sliceKey].setStateByKey('formStatus', cloneDeep(cFormStatus))

      await get().gas.fetchGasInfo(curve)
      const resp = await curvejsApi.lockCrv.increaseUnlockTime(activeKey, provider, curve, formValues.days)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        cFormStatus = cloneDeep(get()[sliceKey].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'INCREASE_TIME'
          get()[sliceKey].setStateByKeys({
            formValues: cloneDeep(DEFAULT_FORM_VALUES),
            formStatus: cloneDeep(cFormStatus),
          })

          // re-fetch data
          get()[sliceKey].fetchVecrvInfo(curve)
        }

        return resp
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      if (Object.keys(get()[sliceKey][key]).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function getActiveKey(formType: FormType | '', chainId: ChainId | undefined, walletAddress: string | undefined) {
  return `${formType}-${chainId ?? ''}-${walletAddress ? shortenAccount(walletAddress) : ''}`
}

export function getActiveKeyVecrvInfo(curve: CurveApi, walletAddress: string) {
  return `${curve.chainId}-${shortenAccount(walletAddress)}`
}

export default createLockedCrvSlice
