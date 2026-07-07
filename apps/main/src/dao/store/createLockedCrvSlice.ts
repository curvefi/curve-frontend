import { produce } from 'immer'
import { cloneDeep } from 'lodash'
import { StoreApi } from 'zustand'
import type { FormEstGas, FormStatus, FormType, FormValues, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/dao/components/PageVeCrv/utils'
import { invalidateLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { helpers } from '@/dao/lib/curvejs'
import { networks } from '@/dao/networks'
import type { State } from '@/dao/store/useStore'
import {
  ChainId,
  CurveApi,
  FnStepApproveResponse,
  FnStepEstGasApprovalResponse,
  FnStepResponse,
  TransactionState,
} from '@/dao/types/dao.types'
import { shortenAccount } from '@ui/utils'
import { notify, requireLib, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { getErrorMessage } from '@ui-kit/utils'
import { setMissingProvider } from '@ui-kit/utils/store.util'
import { invalidateLockerVecrvUser } from '../entities/locker-vecrv-user'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  activeKeyVecrvInfo: string
  formEstGas: Record<string, FormEstGas>
  formValues: FormValues
  formStatus: FormStatus

  withdrawLockedCrvStatus: {
    transactionState: TransactionState
    errorMessage: string | null
    txHash: string | null
  }
}

const SLICE_KEY = 'lockedCrv'

// prettier-ignore
export type LockedCrvSlice = {
  [SLICE_KEY]: SliceState & {
    setFormValues: (curve: CurveApi | null, isLoadingCurve: boolean, rFormType: FormType, formValues: Partial<FormValues>, vecrvInfo: VecrvInfo, isFullReset?: boolean) =>  void

    // steps
    fetchEstGasApproval: (activeKey: string, curve: CurveApi, rFormType: FormType, formValues: FormValues) => Promise<FnStepEstGasApprovalResponse>
    fetchStepApprove: (activeKey: string, curve: CurveApi, rFormType: FormType, formValues: FormValues) => Promise<FnStepApproveResponse | undefined>
    fetchStepCreate: (activeKey: string, curve: CurveApi, formValues: FormValues) => Promise<FnStepResponse & { lockedAmt: string, lockedDate: string } | undefined>
    fetchStepIncreaseCrv: (activeKey: string, curve: CurveApi, formValues: FormValues) => Promise<FnStepResponse  | undefined>
    fetchStepIncreaseTime: (activeKey: string, curve: CurveApi, formValues: FormValues) => Promise<FnStepResponse  | undefined>

    withdrawLockedCrv: () => void

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  activeKeyVecrvInfo: '',
  formEstGas: {},
  formValues: DEFAULT_FORM_VALUES,
  formStatus: DEFAULT_FORM_STATUS,
  withdrawLockedCrvStatus: {
    transactionState: '',
    errorMessage: null,
    txHash: null,
  },
}

export const createLockedCrvSlice = (
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): LockedCrvSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await -- Existing violation before enabling this rule.
    setFormValues: async (curve, isLoadingCurve, rFormType, updatedFormValues, vecrvInfo, isFullReset) => {
      // stored state
      const storedFormValues = get()[SLICE_KEY].formValues

      let cFormValues = cloneDeep({ ...storedFormValues, ...updatedFormValues })
      cFormValues.lockedAmtError = ''
      cFormValues.lockedAmtError = ''

      const cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      cFormStatus.error = ''

      if (isFullReset) {
        cFormValues = cloneDeep(DEFAULT_FORM_VALUES)
      }

      const activeKey = getActiveKey(rFormType, curve?.chainId, curve?.signerAddress)
      get()[SLICE_KEY].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cloneDeep(cFormStatus),
      })

      if (!curve || isLoadingCurve || !curve?.signerAddress || !vecrvInfo) return

      // validate form
      cFormValues.lockedAmtError = +cFormValues.lockedAmt > +vecrvInfo.crv ? 'too-much' : ''
      get()[SLICE_KEY].setStateByKey('formValues', cloneDeep(cFormValues))

      //   fetch est gas
      const isValidLockedAmt = +cFormValues.lockedAmt > 0 && !cFormValues.lockedAmtError
      const isValidDays = cFormValues.days > 0 && !cFormValues.utcDateError
      const isValidCreateForm = rFormType === 'create' ? isValidLockedAmt && isValidDays : true
      const isValidLockCrvForm = rFormType === 'adjust_crv' ? isValidLockedAmt : true
      const isValidLockDateForm = rFormType === 'adjust_date' ? isValidDays : true

      if (isValidCreateForm && isValidLockCrvForm && isValidLockDateForm) {
        void get()[SLICE_KEY].fetchEstGasApproval(activeKey, curve, rFormType, cFormValues)
      } else {
        get()[SLICE_KEY].setStateByKey('formEstGas', { [activeKey]: DEFAULT_FORM_EST_GAS })
      }
    },

    fetchEstGasApproval: async (activeKey, curve, rFormType, formValues) => {
      const cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
      const cFormEstGas = cloneDeep({ ...DEFAULT_FORM_EST_GAS, loading: true })

      get()[SLICE_KEY].setStateByActiveKey('formEstGas', activeKey, cloneDeep(cFormEstGas))

      const fn = networks[curve.chainId].api.lockCrv.estGasApproval
      const resp = await fn(activeKey, curve, rFormType, formValues.lockedAmt, formValues.days)

      cFormEstGas.loading = false

      if (resp.error) {
        cFormStatus.error = resp.error
      } else {
        cFormEstGas.estimatedGas = resp.estimatedGas
        cFormStatus.isApproved = resp.isApproved
      }
      get()[SLICE_KEY].setStateByKeys({
        formStatus: cloneDeep(cFormStatus),
        formEstGas: { [activeKey]: cFormEstGas },
      })
      return resp
    },
    fetchStepApprove: async (activeKey, curve, rFormType, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[SLICE_KEY])

      const cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      cFormStatus.formProcessing = true
      cFormStatus.step = 'APPROVAL'
      get()[SLICE_KEY].setStateByKey('formStatus', cloneDeep(cFormStatus))

      const { chainId } = curve
      const approveFn = networks[chainId].api.lockCrv.lockCrvApprove
      const resp = await approveFn(activeKey, provider, curve, formValues.lockedAmt)

      if (resp.activeKey === get()[SLICE_KEY].activeKey) {
        cFormStatus.formProcessing = false
        cFormStatus.step = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[SLICE_KEY].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.isApproved = true
          cFormStatus.formTypeCompleted = 'APPROVE'
          get()[SLICE_KEY].setStateByKey('formStatus', cFormStatus)

          // fetch est gas and approval
          await get()[SLICE_KEY].fetchEstGasApproval(activeKey, curve, rFormType, formValues)
        }

        return resp
      }
    },
    fetchStepCreate: async (activeKey, curve, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[SLICE_KEY])

      if (formValues.lockedAmt && formValues.utcDate && formValues.days) {
        let cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
        cFormStatus.formProcessing = true
        cFormStatus.step = 'CREATE_LOCK'
        get()[SLICE_KEY].setStateByKey('formStatus', cloneDeep(cFormStatus))

        const { chainId } = curve
        const fn = networks[chainId].api.lockCrv.createLock
        const resp = await fn(activeKey, curve, provider, formValues.lockedAmt, formValues.utcDate, formValues.days)

        if (resp.activeKey === get()[SLICE_KEY].activeKey) {
          cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
          cFormStatus.formProcessing = false
          cFormStatus.step = ''
          cFormStatus.error = ''

          if (resp.error) {
            cFormStatus.error = resp.error
            get()[SLICE_KEY].setStateByKey('formStatus', cFormStatus)
          } else {
            cFormStatus.formTypeCompleted = 'CREATE_LOCK'
            get()[SLICE_KEY].setStateByKeys({
              formValues: cloneDeep(DEFAULT_FORM_VALUES),
              formStatus: cloneDeep(cFormStatus),
            })
          }

          // re-fetch user vecrv info
          await invalidateLockerVecrvInfo({ chainId: curve.chainId, userAddress: curve.signerAddress })
          await invalidateLockerVecrvUser({ chainId: curve.chainId, userAddress: curve.signerAddress })
        }
      }
    },
    fetchStepIncreaseCrv: async (activeKey, curve, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[SLICE_KEY])

      let cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
      cFormStatus.formProcessing = true
      cFormStatus.step = 'INCREASE_CRV'
      get()[SLICE_KEY].setStateByKey('formStatus', cloneDeep(cFormStatus))

      const { chainId } = curve
      const fn = networks[chainId].api.lockCrv.increaseAmount
      const resp = await fn(activeKey, curve, provider, formValues.lockedAmt)

      if (resp.activeKey === get()[SLICE_KEY].activeKey) {
        cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[SLICE_KEY].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'INCREASE_CRV'
          get()[SLICE_KEY].setStateByKeys({
            formValues: cloneDeep(DEFAULT_FORM_VALUES),
            formStatus: cloneDeep(cFormStatus),
          })

          // re-fetch user vecrv info
          await invalidateLockerVecrvInfo({ chainId: curve.chainId, userAddress: curve.signerAddress })
          await invalidateLockerVecrvUser({ chainId: curve.chainId, userAddress: curve.signerAddress })
        }

        return resp
      }
    },
    fetchStepIncreaseTime: async (activeKey, curve, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[SLICE_KEY])

      let cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
      cFormStatus.formProcessing = true
      cFormStatus.step = 'INCREASE_TIME'
      get()[SLICE_KEY].setStateByKey('formStatus', cloneDeep(cFormStatus))

      const { chainId } = curve
      const fn = networks[chainId].api.lockCrv.increaseUnlockTime
      const resp = await fn(activeKey, provider, curve, formValues.days)

      if (resp.activeKey === get()[SLICE_KEY].activeKey) {
        cFormStatus = cloneDeep(get()[SLICE_KEY].formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.error = ''

        if (resp.error) {
          cFormStatus.error = resp.error
          get()[SLICE_KEY].setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'INCREASE_TIME'
          get()[SLICE_KEY].setStateByKeys({
            formValues: cloneDeep(DEFAULT_FORM_VALUES),
            formStatus: cloneDeep(cFormStatus),
          })

          // re-fetch user vecrv info
          await invalidateLockerVecrvInfo({ chainId: curve.chainId, userAddress: curve.signerAddress })
          await invalidateLockerVecrvUser({ chainId: curve.chainId, userAddress: curve.signerAddress })
        }

        return resp
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
    withdrawLockedCrv: async () => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[SLICE_KEY])
      const curve = requireLib('curveApi')

      let dismissNotificationHandler = notify(t`Please confirm to withdraw locked CRV.`, 'pending').dismiss

      try {
        set(
          produce((state: State) => {
            state[SLICE_KEY].withdrawLockedCrvStatus.transactionState = 'CONFIRMING'
            state[SLICE_KEY].withdrawLockedCrvStatus.errorMessage = null
            state[SLICE_KEY].withdrawLockedCrvStatus.txHash = null
          }),
        )

        const hash = await curve.boosting.withdrawLockedCrv()

        dismissNotificationHandler()
        dismissNotificationHandler = notify(t`Withdrawing locked CRV...`, 'pending').dismiss

        set(
          produce((state: State) => {
            state[SLICE_KEY].withdrawLockedCrvStatus.transactionState = 'LOADING'
            state[SLICE_KEY].withdrawLockedCrvStatus.txHash = hash
          }),
        )

        await helpers.waitForTransaction(hash, provider)

        set(
          produce((state: State) => {
            state[SLICE_KEY].withdrawLockedCrvStatus.transactionState = 'SUCCESS'
          }),
        )

        // re-fetch user vecrv info
        await invalidateLockerVecrvInfo({ chainId: curve.chainId, userAddress: curve.signerAddress })

        dismissNotificationHandler()
        notify(t`CRV withdrawal successful.`, 'success')
      } catch (error) {
        dismissNotificationHandler()
        console.warn(error)
        set(
          produce((state: State) => {
            state[SLICE_KEY].withdrawLockedCrvStatus.transactionState = 'ERROR'
            state[SLICE_KEY].withdrawLockedCrvStatus.errorMessage = getErrorMessage(error, 'error-withdraw-locked-crv')
            state[SLICE_KEY].withdrawLockedCrvStatus.txHash = null
          }),
        )
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      if (Object.keys(get()[SLICE_KEY][key]).length > 30) {
        get().setAppStateByKey(SLICE_KEY, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(SLICE_KEY, key, activeKey, value)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(SLICE_KEY, key, value)
    },
    setStateByKeys: sliceState => {
      get().setAppStateByKeys(SLICE_KEY, sliceState)
    },
    resetState: () => {
      get().resetAppState(SLICE_KEY, cloneDeep(DEFAULT_STATE))
    },
  },
})

function getActiveKey(formType: FormType | '', chainId: ChainId | undefined, walletAddress: string | undefined) {
  return `${formType}-${chainId ?? ''}-${walletAddress ? shortenAccount(walletAddress) : ''}`
}
