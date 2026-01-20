import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
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
import type { DateValue } from '@react-types/calendar'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatDate, formatNumber, scanTxPath } from '@ui/utils'
import { isLoading, notify, useCurve } from '@ui-kit/features/connect-wallet'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export const FormLockCreate = ({ curve, rChainId, rFormType, vecrvInfo }: PageVecrv) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.lockedCrv.activeKey)
  const { connectState } = useCurve()
  const isLoadingCurve = isLoading(connectState)
  const formEstGas = useStore((state) => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.lockedCrv.formStatus)
  const formValues = useStore((state) => state.lockedCrv.formValues)
  const fetchStepApprove = useStore((state) => state.lockedCrv.fetchStepApprove)
  const fetchStepCreate = useStore((state) => state.lockedCrv.fetchStepCreate)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress
  const currUtcDate = dayjs.utc()
  const minUtcDate = currUtcDate
  const maxUtcDate = dayjs.utc().add(4, 'year')

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      setTxInfoBar(null)
      setFormValues(curve, isLoadingCurve, rFormType, updatedFormValues, vecrvInfo, isFullReset)
    },
    [curve, isLoadingCurve, vecrvInfo, rFormType, setFormValues],
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

      updateFormValues(
        {
          utcDate: toCalendarDate(utcDate),
          utcDateError,
          calcdUtcDate: haveSigner && !utcDate.isSame(calcdUtcDate) ? formatDate(calcdUtcDate.valueOf()) : '',
          days,
        },
        false,
      )
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
        updateFormValues({ utcDate: toCalendarDate(calcdUtcDate), utcDateError: '', days, calcdUtcDate: '' }, false)
        return maxUtcDate
      }

      const utcDate = dayjs.utc().add(value, unit)
      const days = utcDate.diff(currUtcDate, 'd')
      const calcdUtcDate = calcUnlockTime(curve, 'create', null, days)

      updateFormValues({ utcDate: toCalendarDate(calcdUtcDate), utcDateError: '', days, calcdUtcDate: '' }, false)
      return utcDate
    },
    [currUtcDate, maxUtcDate, rChainId, updateFormValues],
  )

  const handleBtnClickApproval = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your CRV.`
      const { dismiss } = notify(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, curve, rFormType, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove, rFormType],
  )

  const handleBtnClickCreate = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      if (formValues.utcDate) {
        const localUtcDate = formValues.calcdUtcDate || formatDate(formValues.utcDate.toString())
        const notifyMessage = t`Please confirm locking ${formatNumber(formValues.lockedAmt)} CRV until ${localUtcDate}.`
        const { dismiss } = notify(notifyMessage, 'pending')
        const resp = await fetchStepCreate(activeKey, curve, formValues)

        if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
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

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(formStatus.isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: formStatus.isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: () => handleBtnClickApproval(activeKey, curve, formValues),
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
          onClick: () => handleBtnClickCreate(activeKey, curve, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['CREATE_LOCK'] : ['APPROVAL', 'CREATE_LOCK']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [handleBtnClickApproval, handleBtnClickCreate],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true
    updateFormValues({}, true)

    return () => {
      isSubscribed.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // steps
  useEffect(() => {
    if (curve) {
      const updatedSteps = getSteps(activeKey, curve, formEstGas, formValues, formStatus, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress, isLoadingCurve, formEstGas, formValues, formStatus])

  // interval
  usePageVisibleInterval(() => updateFormValues({}, false), REFRESH_INTERVAL['5m'])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const loading = typeof vecrvInfo === 'undefined'
  const disabled = formStatus.formProcessing

  return (
    <>
      <StyledForm
        autoComplete="off"
        onSubmit={(evt) => {
          evt.preventDefault()
        }}
      >
        <FieldLockedAmt
          curve={curve}
          disabled={disabled}
          haveSigner={haveSigner}
          formType={rFormType}
          vecrvInfo={vecrvInfo}
          handleInpLockedAmt={useCallback((lockedAmt) => updateFormValues({ lockedAmt }, false), [updateFormValues])}
          {...formValues}
        />

        <FieldDatePicker
          curve={curve}
          formType={rFormType}
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
        {formStatus.error && (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, false)} />
        )}
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
