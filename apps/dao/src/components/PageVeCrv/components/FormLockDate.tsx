import type { PageVecrv, FormEstGas, FormStatus, FormValues, StepKey } from '@dao/components/PageVeCrv/types'
import type { DateValue } from '@react-types/calendar'
import type { Step } from '@ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_FORM_EST_GAS } from '@dao/components/PageVeCrv/utils'
import { REFRESH_INTERVAL } from '@dao/constants'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { formatDisplayDate, toCalendarDate } from '@dao/utils/utilsDates'
import dayjs from '@ui-kit/lib/dayjs'
import networks from '@dao/networks'
import usePageVisibleInterval from '@dao/hooks/usePageVisibleInterval'
import useStore from '@dao/store/useStore'

import AlertBox from '@ui/AlertBox'
import AlertFormError from '@dao/components/AlertFormError'
import FormActions from '@dao/components/PageVeCrv/components/FormActions'
import DetailInfoEstGas from '@dao/components/DetailInfoEstGas'
import FieldDatePicker from '@dao/components/PageVeCrv/components/FieldDatePicker'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { CurveApi } from '@dao/types/dao.types'

const FormLockDate = ({ curve, rChainId, rFormType, vecrvInfo }: PageVecrv) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.lockedCrv.activeKey)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const formEstGas = useStore((state) => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.lockedCrv.formStatus)
  const formValues = useStore((state) => state.lockedCrv.formValues)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const fetchStepIncreaseTime = useStore((state) => state.lockedCrv.fetchStepIncreaseTime)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode | null>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress

  const currUnlockTime = vecrvInfo.lockedAmountAndUnlockTime.unlockTime
  const currUnlockUtcTime = dayjs.utc(currUnlockTime)
  const currUnlockUtcDate = currUnlockUtcTime.format('YYYY-MM-DD')
  const todayUtcDate = dayjs.utc().format('YYYY-MM-DD')
  const minUtcDate = currUnlockUtcTime
  const remainingLockedDays = dayjs(currUnlockUtcDate).diff(dayjs(todayUtcDate), 'day', false)

  const maxUtcDate = useMemo(() => {
    let maxUtcDate: dayjs.Dayjs | null = null

    if (curve) {
      const fn = networks[rChainId].api.lockCrv.calcUnlockTime
      maxUtcDate = fn(curve, rFormType, currUnlockTime, 365 * 4 - remainingLockedDays)
    }
    return maxUtcDate
  }, [currUnlockTime, curve, rChainId, rFormType, remainingLockedDays])

  const isMax = maxUtcDate ? 365 * 4 - remainingLockedDays <= 7 : false

  const updateFormValues = useCallback(
    async (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
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

      const days = utcDate.diff(currUnlockUtcTime, 'd')
      const fn = networks[rChainId].api.lockCrv.calcUnlockTime
      const calcdUtcDate = fn(curve, rFormType, currUnlockTime, days)

      updateFormValues(
        {
          utcDate: toCalendarDate(utcDate),
          utcDateError,
          calcdUtcDate:
            utcDateError !== 'invalid-date' && !utcDate.isSame(calcdUtcDate) ? formatDisplayDate(calcdUtcDate) : '',
          days,
        },
        false,
      )
    },
    [currUnlockTime, currUnlockUtcTime, haveSigner, maxUtcDate, minUtcDate, rChainId, rFormType, updateFormValues],
  )

  const handleBtnClickQuickAction = useCallback(
    (curve: CurveApi, value: number, unit: dayjs.ManipulateType) => {
      const utcDate = dayjs.utc(currUnlockTime).add(value, unit)
      const days = utcDate.diff(currUnlockUtcTime, 'd')
      const fn = networks[rChainId].api.lockCrv.calcUnlockTime
      const calcdUtcDate = fn(curve, rFormType, currUnlockTime, days)

      updateFormValues({ utcDate: toCalendarDate(calcdUtcDate), calcdUtcDate: '', utcDateError: '', days }, false)
      return calcdUtcDate
    },
    [currUnlockTime, currUnlockUtcTime, rChainId, rFormType, updateFormValues],
  )

  const handleBtnClickIncrease = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      if (formValues.utcDate) {
        const localUtcDate = formValues.calcdUtcDate || formatDisplayDate(formValues.utcDate.toString())
        const notifyMessage = t`Please confirm changing unlock date to ${localUtcDate}.`
        const { dismiss } = notifyNotification(notifyMessage, 'pending')
        const resp = await fetchStepIncreaseTime(activeKey, curve, formValues)

        if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
          const txDescription = t`Lock date updated`
          setTxInfoBar(<TxInfoBar description={txDescription} txHash={networks[curve.chainId].scanTxPath(resp.hash)} />)
        }
        if (typeof dismiss === 'function') dismiss()
      }
    },
    [notifyNotification, fetchStepIncreaseTime],
  )

  const getSteps = useCallback(
    (activeKey: string, curve: CurveApi, formEstGas: FormEstGas, formValues: FormValues, formStatus: FormStatus) => {
      const stepsObj: { [key: string]: Step } = {
        INCREASE_TIME: {
          key: 'INCREASE_TIME',
          status: getStepStatus(
            formStatus.formTypeCompleted === 'INCREASE_TIME',
            formStatus.step === 'INCREASE_TIME',
            !!formValues.utcDate && !formValues.utcDateError && !formStatus.error && !formEstGas.loading,
          ),
          type: 'action',
          content: formStatus.formTypeCompleted === 'INCREASE_TIME' ? t`Lock Increased` : t`Increase Lock`,
          onClick: () => handleBtnClickIncrease(activeKey, curve, formValues),
        },
      }

      const stepsKey: StepKey[] = ['INCREASE_TIME']
      return stepsKey.map((key) => stepsObj[key])
    },
    [handleBtnClickIncrease],
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
    if (curve && activeKey) {
      const updatedSteps = getSteps(activeKey, curve, formEstGas, formValues, formStatus)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, curve?.chainId, curve?.signerAddress, isLoadingCurve, formEstGas, formValues, formStatus])

  // interval
  usePageVisibleInterval(() => updateFormValues({}, false), REFRESH_INTERVAL['5m'], isPageVisible)

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const loading = typeof vecrvInfo === 'undefined'

  return (
    <>
      <StyledForm
        autoComplete="off"
        onSubmit={(evt) => {
          evt.preventDefault()
        }}
      >
        <FieldDatePicker
          curve={curve}
          formType={rFormType}
          disabled={formStatus.formProcessing}
          isMax={isMax}
          vecrvInfo={vecrvInfo}
          currUnlockUtcTime={currUnlockUtcTime}
          minUtcDate={minUtcDate}
          maxUtcDate={maxUtcDate}
          handleInpEstUnlockedDays={handleInpEstUnlockedDays}
          handleBtnClickQuickAction={handleBtnClickQuickAction}
          {...formValues}
        />
      </StyledForm>

      <div>
        {!!signerAddress && (
          <DetailInfoEstGas
            curve={curve}
            chainId={rChainId}
            {...formEstGas}
            estimatedGas={formEstGas.estimatedGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </div>

      <FormActions haveSigner={haveSigner} loading={loading}>
        {isMax && <AlertBox alertType="info">{t`You have reached the maximum locked date.`}</AlertBox>}
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

export default FormLockDate
