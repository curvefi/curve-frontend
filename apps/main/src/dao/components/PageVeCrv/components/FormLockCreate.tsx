import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import type { DateValue } from 'react-stately'
import { styled } from 'styled-components'
import { AlertFormError } from '@/dao/components/AlertFormError'
import { DetailInfoEstGas } from '@/dao/components/DetailInfoEstGas'
import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { FieldLockedAmt } from '@/dao/components/PageVeCrv/components/FieldLockedAmt'
import { FormActions } from '@/dao/components/PageVeCrv/components/FormActions'
import type { FormEstGas, FormStatus, FormValues, PageVecrv, StepKey } from '@/dao/components/PageVeCrv/types'
import { DEFAULT_FORM_EST_GAS } from '@/dao/components/PageVeCrv/utils'
import { networks } from '@/dao/networks'
import { useStore } from '@/dao/store/useStore'
import type { CurveApi } from '@/dao/types/dao.types'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { isLoading, notify, useCurve } from '@evm-ui/features/connect-wallet'
import { usePageVisibleInterval } from '@evm-ui/hooks/usePageVisibleInterval'
import { dayjs } from '@evm-ui/lib/dayjs'
import { t } from '@evm-ui/lib/i18n'
import { amount, formatToken, REFRESH_INTERVAL } from '@evm-ui/utils'
import { getActiveStep, getStepStatus } from '@legacy-ui/Stepper/helpers'
import { Stepper } from '@legacy-ui/Stepper/Stepper'
import type { Step } from '@legacy-ui/Stepper/types'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { formatDate, scanTxPath } from '@legacy-ui/utils'

const FORM_TYPE = 'create' as const

export const FormLockCreate = ({ curve, rChainId, vecrvInfo }: PageVecrv) => {
  const isSubscribedRef = useRef(false)

  const activeKey = useStore(state => state.lockedCrv.activeKey)
  const { connectState } = useCurve()
  const isLoadingCurve = isLoading(connectState)
  const formEstGas = useStore(state => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore(state => state.lockedCrv.formStatus)
  const formValues = useStore(state => state.lockedCrv.formValues)
  const fetchStepApprove = useStore(state => state.lockedCrv.fetchStepApprove)
  const fetchStepCreate = useStore(state => state.lockedCrv.fetchStepCreate)
  const setFormValues = useStore(state => state.lockedCrv.setFormValues)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress
  const currUtcDate = dayjs.utc()
  const minUtcDate = currUtcDate
  const maxUtcDate = dayjs.utc().add(4, 'year')

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, { isFullReset = false }: { isFullReset?: boolean } = {}) => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setTxInfoBar(null)
      setFormValues(curve, isLoadingCurve, FORM_TYPE, updatedFormValues, vecrvInfo, isFullReset)
    },
    [curve, isLoadingCurve, vecrvInfo, setFormValues],
  )

  const handleInpEstUnlockedDays = useCallback(
    (curve: CurveApi, unlockDate: DateValue) => {
      const utcDate = dayjs.utc(unlockDate.toString())

      // validate locked date
      let utcDateError = ''
      if (haveSigner && (utcDate.isAfter(maxUtcDate, 'day') || utcDate.isBefore(minUtcDate, 'day'))) {
        utcDateError = 'invalid-date'
      }

      const days = utcDate.diff(currUtcDate, 'd')
      const fn = networks[rChainId].api.lockCrv.calcUnlockTime
      const calcdUtcDate = fn(curve, 'create', null, days)

      updateFormValues({
        utcDate: toCalendarDate(utcDate),
        utcDateError,
        calcdUtcDate: haveSigner && !utcDate.isSame(calcdUtcDate) ? formatDate(calcdUtcDate.valueOf()) : '',
        days,
      })
    },
    [currUtcDate, haveSigner, maxUtcDate, minUtcDate, rChainId, updateFormValues],
  )

  const handleBtnClickQuickAction = useCallback(
    (curve: CurveApi, value?: number, unit?: dayjs.ManipulateType) => {
      const { calcUnlockTime } = networks[rChainId].api.lockCrv
      // max button
      if (!value || !unit) {
        const days = maxUtcDate.diff(currUtcDate, 'd')
        const calcdUtcDate = calcUnlockTime(curve, 'create', null, days)
        updateFormValues({ utcDate: toCalendarDate(calcdUtcDate), utcDateError: '', days, calcdUtcDate: '' })
        return maxUtcDate
      }

      const utcDate = dayjs.utc().add(value, unit)
      const days = utcDate.diff(currUtcDate, 'd')
      const calcdUtcDate = calcUnlockTime(curve, 'create', null, days)

      updateFormValues({ utcDate: toCalendarDate(calcdUtcDate), utcDateError: '', days, calcdUtcDate: '' })
      return utcDate
    },
    [currUtcDate, maxUtcDate, rChainId, updateFormValues],
  )

  const handleBtnClickApproval = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your CRV.`
      const { dismiss } = notify(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, curve, FORM_TYPE, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove],
  )

  const handleBtnClickCreate = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      if (formValues.utcDate) {
        const localUtcDate = formValues.calcdUtcDate || formatDate(formValues.utcDate.toString())
        const notifyMessage = t`Please confirm locking ${formatToken(amount(formValues.lockedAmt), 'CRV', 'amount')} until ${localUtcDate}.`
        const { dismiss } = notify(notifyMessage, 'pending')
        const resp = await fetchStepCreate(activeKey, curve, formValues)

        if (isSubscribedRef.current && resp?.hash && resp.activeKey === activeKey) {
          const txDescription = t`Successfully locked ${resp.lockedAmt} CRV until ${resp.lockedDate}`
          setTxInfoBar(
            <TxInfoBar description={txDescription} txHash={scanTxPath(networks[curve.chainId], resp.hash)} />,
          )
        }
        if (typeof dismiss === 'function') dismiss()
      }
    },
    [fetchStepCreate],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      formEstGas: FormEstGas,
      formValues: FormValues,
      formStatus: FormStatus,
      steps: Step[],
    ) => {
      const isValid =
        +formValues.lockedAmt > 0 &&
        !!formValues.utcDate &&
        !formValues.lockedAmtError &&
        !formValues.utcDateError &&
        !formStatus.error &&
        !formEstGas.loading

      const stepsObj: Record<string, Step> = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(formStatus.isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: formStatus.isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: () => void handleBtnClickApproval(activeKey, curve, formValues),
        },
        CREATE_LOCK: {
          key: 'CREATE_LOCK',
          status: getStepStatus(
            formStatus.formTypeCompleted === 'CREATE_LOCK',
            formStatus.step === 'CREATE_LOCK',
            isValid && formStatus.isApproved,
          ),
          type: 'action',
          content: formStatus.formTypeCompleted === 'CREATE_LOCK' ? t`Lock Created` : t`Create Lock`,
          onClick: () => void handleBtnClickCreate(activeKey, curve, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map(s => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['CREATE_LOCK'] : ['APPROVAL', 'CREATE_LOCK']
      }

      return stepsKey.map(key => stepsObj[key])
    },
    [handleBtnClickApproval, handleBtnClickCreate],
  )

  // Refresh when the connected account or network changes.
  useEffect(() => {
    isSubscribedRef.current = true
    updateFormValues({}, { isFullReset: true })

    return () => {
      isSubscribedRef.current = false
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress])

  // steps
  useEffect(() => {
    if (curve) {
      const updatedSteps = getSteps(activeKey, curve, formEstGas, formValues, formStatus, steps)
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress, isLoadingCurve, formEstGas, formValues, formStatus])

  // interval
  usePageVisibleInterval(() => updateFormValues({}), REFRESH_INTERVAL['5m'])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const loading = typeof vecrvInfo === 'undefined'
  const disabled = formStatus.formProcessing

  return (
    <>
      <StyledForm
        autoComplete="off"
        onSubmit={evt => {
          evt.preventDefault()
        }}
      >
        <FieldLockedAmt
          curve={curve}
          disabled={disabled}
          haveSigner={haveSigner}
          formType={FORM_TYPE}
          vecrvInfo={vecrvInfo}
          handleInpLockedAmt={useCallback(lockedAmt => updateFormValues({ lockedAmt }), [updateFormValues])}
          {...formValues}
        />

        <FieldDatePicker
          curve={curve}
          formType={FORM_TYPE}
          currUnlockUtcTime={currUtcDate}
          disabled={disabled}
          minUtcDate={minUtcDate}
          maxUtcDate={maxUtcDate}
          vecrvInfo={vecrvInfo}
          handleInpEstUnlockedDays={handleInpEstUnlockedDays}
          handleBtnClickQuickAction={handleBtnClickQuickAction}
          {...formValues}
        />
      </StyledForm>

      <div>
        {haveSigner && (
          <DetailInfoEstGas
            chainId={rChainId}
            {...formEstGas}
            estimatedGas={formEstGas.estimatedGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </div>

      <FormActions haveSigner={haveSigner} loading={loading}>
        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({})} />}
        {txInfoBar}
        <Stepper steps={steps} />
      </FormActions>
    </>
  )
}

const StyledForm = styled.form`
  display: grid;
  grid-row-gap: var(--spacing-3);
`
