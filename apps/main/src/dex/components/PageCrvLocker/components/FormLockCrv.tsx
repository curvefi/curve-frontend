import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import AlertFormError from '@/dex/components/AlertFormError'
import DetailInfoEstGas from '@/dex/components/DetailInfoEstGas'
import FieldLockedAmt from '@/dex/components/PageCrvLocker/components/FieldLockedAmt'
import FormActions from '@/dex/components/PageCrvLocker/components/FormActions'
import type { FormEstGas, FormStatus, FormValues, PageVecrv, StepKey } from '@/dex/components/PageCrvLocker/types'
import { DEFAULT_FORM_EST_GAS } from '@/dex/components/PageCrvLocker/utils'
import useStore from '@/dex/store/useStore'
import { CurveApi } from '@/dex/types/main.types'
import Stepper from '@ui/Stepper'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { notify } from '@ui-kit/features/connect-wallet'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const FormLockCrv = ({ curve, rChainId, rFormType, vecrvInfo, pageLoaded }: PageVecrv) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.lockedCrv.activeKey)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const formEstGas = useStore((state) => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.lockedCrv.formStatus)
  const formValues = useStore((state) => state.lockedCrv.formValues)
  const fetchStepApprove = useStore((state) => state.lockedCrv.fetchStepApprove)
  const fetchStepIncreaseCrv = useStore((state) => state.lockedCrv.fetchStepIncreaseCrv)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)
  const network = useStore((state) => state.networks.networks[rChainId])

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      setTxInfoBar(null)
      setFormValues(curve, !pageLoaded, rFormType, updatedFormValues, vecrvInfo, isFullReset)
    },
    [curve, pageLoaded, vecrvInfo, rFormType, setFormValues],
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

  const handleBtnClickIncrease = useCallback(
    async (activeKey: string, curve: CurveApi, formValues: FormValues) => {
      const notifyMessage = t`Please confirm increasing lock amount by ${formValues.lockedAmt} CRV.`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepIncreaseCrv(activeKey, curve, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txDescription = t`Lock amount updated`
        setTxInfoBar(<TxInfoBar description={txDescription} txHash={network.scanTxPath(resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepIncreaseCrv, network],
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
  }, [curve?.chainId, curve?.signerAddress, !pageLoaded, formEstGas, formValues, formStatus])

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
