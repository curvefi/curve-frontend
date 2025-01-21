import type { PageVecrv, FormEstGas, FormStatus, FormValues, StepKey } from '@main/components/PageCrvLocker/types'
import type { DateValue } from '@react-types/calendar'
import type { Step } from '@ui/Stepper/types'
import { t } from '@lingui/macro'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { DEFAULT_FORM_EST_GAS } from '@main/components/PageCrvLocker/utils'
import { REFRESH_INTERVAL } from '@main/constants'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { formatDisplayDate, toCalendarDate } from '@main/utils/utilsDates'
import { formatNumber } from '@ui/utils'
import curvejsApi from '@main/lib/curvejs'
import usePageVisibleInterval from '@main/hooks/usePageVisibleInterval'
import dayjs from '@ui-kit/lib/dayjs'
import useStore from '@main/store/useStore'
import AlertFormError from '@main/components/AlertFormError'
import DetailInfoEstGas from '@main/components/DetailInfoEstGas'
import FormActions from '@main/components/PageCrvLocker/components/FormActions'
import FieldDatePicker from '@main/components/PageCrvLocker/components/FieldDatePicker'
import FieldLockedAmt from '@main/components/PageCrvLocker/components/FieldLockedAmt'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { CurveApi } from '@main/types/main.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const FormLockCreate = ({ curve, rChainId, rFormType, vecrvInfo }: PageVecrv) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.lockedCrv.activeKey)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const formEstGas = useStore((state) => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.lockedCrv.formStatus)
  const formValues = useStore((state) => state.lockedCrv.formValues)
  const fetchStepApprove = useStore((state) => state.lockedCrv.fetchStepApprove)
  const fetchStepCreate = useStore((state) => state.lockedCrv.fetchStepCreate)
  const notifyNotification = useWalletStore((s) => s.notify)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)
  const network = useStore((state) => state.networks.networks[rChainId])

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode | null>(null)

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
      const calcdUtcDate = curvejsApi.lockCrv.calcUnlockTime(curve, 'create', null, days)

      updateFormValues(
        {
          utcDate: toCalendarDate(utcDate),
          utcDateError,
          calcdUtcDate: haveSigner && !utcDate.isSame(calcdUtcDate) ? formatDisplayDate(calcdUtcDate) : '',
          days,
        },
        false,
      )
    },
    [currUtcDate, haveSigner, maxUtcDate, minUtcDate, updateFormValues],
  )

  const handleBtnClickQuickAction = useCallback(
    (curve: CurveApi, value: number, unit: dayjs.ManipulateType) => {
      const utcDate = dayjs.utc().add(value, unit)
      const days = utcDate.diff(currUtcDate, 'd')

      const calcdUtcDate = curvejsApi.lockCrv.calcUnlockTime(curve, 'create', null, days)

      updateFormValues({ utcDate: toCalendarDate(calcdUtcDate), utcDateError: '', days, calcdUtcDate: '' }, false)
      return utcDate
    },
    [currUtcDate, updateFormValues],
  )

  const handleBtnClickApproval = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your CRV.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, curve, rFormType, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove, notifyNotification, rFormType],
  )

  const handleBtnClickCreate = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      if (formValues.utcDate) {
        const localUtcDate = formValues.calcdUtcDate || formatDisplayDate(formValues.utcDate.toString())
        const notifyMessage = t`Please confirm locking ${formatNumber(formValues.lockedAmt)} CRV until ${localUtcDate}.`
        const { dismiss } = notifyNotification(notifyMessage, 'pending')
        const resp = await fetchStepCreate(activeKey, curve, formValues)

        if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
          const txDescription = t`Successfully locked ${resp.lockedAmt} CRV until ${resp.lockedDate}`
          setTxInfoBar(<TxInfoBar description={txDescription} txHash={network.scanTxPath(resp.hash)} />)
        }
        if (typeof dismiss === 'function') dismiss()
      }
    },
    [fetchStepCreate, notifyNotification, network],
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
  usePageVisibleInterval(() => updateFormValues({}, false), REFRESH_INTERVAL['5m'], isPageVisible)

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
          disabled={disabled}
          haveSigner={haveSigner}
          formType={rFormType}
          vecrvInfo={vecrvInfo}
          handleInpLockedAmt={(lockedAmt) => updateFormValues({ lockedAmt }, false)}
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

export default FormLockCreate
