import type { PageVecrv, FormEstGas, FormStatus, FormValues, StepKey } from '@dao/components/PageVeCrv/types'
import type { Step } from '@ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_FORM_EST_GAS } from '@dao/components/PageVeCrv/utils'
import { REFRESH_INTERVAL } from '@dao/constants'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import networks from '@dao/networks'
import usePageVisibleInterval from '@dao/hooks/usePageVisibleInterval'
import useStore from '@dao/store/useStore'

import AlertFormError from '@dao/components/AlertFormError'
import FormActions from '@dao/components/PageVeCrv/components/FormActions'
import DetailInfoEstGas from '@dao/components/DetailInfoEstGas'
import FieldLockedAmt from '@dao/components/PageVeCrv/components/FieldLockedAmt'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { CurveApi } from '@dao/types/dao.types'
import { useWallet } from '@ui-kit/features/connect-wallet'

const FormLockCrv = ({ curve, rChainId, rFormType, vecrvInfo }: PageVecrv) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.lockedCrv.activeKey)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const formEstGas = useStore((state) => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.lockedCrv.formStatus)
  const formValues = useStore((state) => state.lockedCrv.formValues)
  const notifyNotification = useWallet.notify
  const fetchStepApprove = useStore((state) => state.lockedCrv.fetchStepApprove)
  const fetchStepIncreaseCrv = useStore((state) => state.lockedCrv.fetchStepIncreaseCrv)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode | null>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      setTxInfoBar(null)
      setFormValues(curve, isLoadingCurve, rFormType, updatedFormValues, vecrvInfo, isFullReset)
    },
    [curve, isLoadingCurve, vecrvInfo, rFormType, setFormValues],
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

  const handleBtnClickIncrease = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      const notifyMessage = t`Please confirm increasing lock amount by ${formValues.lockedAmt} CRV.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepIncreaseCrv(activeKey, curve, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txDescription = t`Lock amount updated`
        setTxInfoBar(<TxInfoBar description={txDescription} txHash={networks[curve.chainId].scanTxPath(resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepIncreaseCrv, notifyNotification],
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
        +formValues.lockedAmt > 0 && formValues.lockedAmtError === '' && !formStatus.error && !formEstGas.loading

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(formStatus.isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: formStatus.isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: () => handleBtnClickApproval(activeKey, curve, formValues),
        },
        INCREASE_CRV: {
          key: 'INCREASE_CRV',
          status: getStepStatus(
            formStatus.formTypeCompleted === 'INCREASE_CRV',
            formStatus.step === 'INCREASE_CRV',
            isValid && formStatus.isApproved,
          ),
          type: 'action',
          content: formStatus.formTypeCompleted === 'INCREASE_CRV' ? t`Lock Amount Increased` : t`Increase Lock Amount`,
          onClick: () => handleBtnClickIncrease(activeKey, curve, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['INCREASE_CRV'] : ['APPROVAL', 'INCREASE_CRV']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [handleBtnClickApproval, handleBtnClickIncrease],
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

  return (
    <>
      <StyledForm
        autoComplete="off"
        onSubmit={(evt) => {
          evt.preventDefault()
        }}
      >
        <FieldLockedAmt
          haveSigner={haveSigner}
          formType={rFormType}
          vecrvInfo={vecrvInfo}
          handleInpLockedAmt={(lockedAmt) => updateFormValues({ lockedAmt })}
          {...formValues}
        />
      </StyledForm>

      <div>
        {haveSigner && (
          <DetailInfoEstGas
            curve={curve}
            chainId={rChainId}
            {...formEstGas}
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

export default FormLockCrv
