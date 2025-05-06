import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import AlertFormError from '@/dao/components/AlertFormError'
import FormActions from '@/dao/components/PageVeCrv/components/FormActions'
import type { FormEstGas, FormStatus, FormValues, PageVecrv, StepKey } from '@/dao/components/PageVeCrv/types'
import { DEFAULT_FORM_EST_GAS } from '@/dao/components/PageVeCrv/utils'
import VoteCountdown from '@/dao/components/VoteCountdown'
import { useLockEstimateWithdrawGas } from '@/dao/entities/locker-estimate-withdraw-gas'
import useEstimateGasConversion from '@/dao/hooks/useEstimateGasConversion'
import networks from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { CurveApi } from '@/dao/types/dao.types'
import { Address } from '@curvefi/prices-api'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import Box from '@ui/Box'
import Button from '@ui/Button'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils/utilsFormat'
import { isLoading, notify, useConnection } from '@ui-kit/features/connect-wallet'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const FormWithdraw = ({ curve, rChainId, rFormType, vecrvInfo }: PageVecrv) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.lockedCrv.activeKey)
  const { connectState } = useConnection<CurveApi>()
  const isLoadingCurve = isLoading(connectState)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const formEstGas = useStore((state) => state.lockedCrv.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.lockedCrv.formStatus)
  const formValues = useStore((state) => state.lockedCrv.formValues)
  const fetchStepApprove = useStore((state) => state.lockedCrv.fetchStepApprove)
  const fetchStepIncreaseCrv = useStore((state) => state.lockedCrv.fetchStepIncreaseCrv)
  const setFormValues = useStore((state) => state.lockedCrv.setFormValues)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress
  const canUnlock =
    +vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0 && vecrvInfo.lockedAmountAndUnlockTime.unlockTime < Date.now()
  const {
    data: lockEstimateWithdrawGas,
    isSuccess: isSuccessLockEstimateWithdrawGas,
    isLoading: isLoadingLockEstimateWithdrawGas,
    isError: isErrorLockEstimateWithdrawGas,
  } = useLockEstimateWithdrawGas({ chainId: rChainId, walletAddress: signerAddress as Address }, canUnlock)
  const { estGasCostUsd, tooltip } = useEstimateGasConversion(lockEstimateWithdrawGas ?? 0)
  const valueGas = formatNumber(estGasCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

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
        setTxInfoBar(<TxInfoBar description={txDescription} txHash={networks[curve.chainId].scanTxPath(resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepIncreaseCrv],
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
      <WithdrawInfo display="flex" flexDirection="column" flexGap="var(--spacing-1)">
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <RowTitle>CRV Locked:</RowTitle>
          <p>{formatNumber(vecrvInfo.lockedAmountAndUnlockTime.lockedAmount)}</p>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <RowTitle>Unlock Time:</RowTitle>
          <p>{new Date(vecrvInfo.lockedAmountAndUnlockTime.unlockTime).toLocaleString()}</p>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <RowTitle>Unlocks In:</RowTitle>
          <VoteCountdown startDate={vecrvInfo.lockedAmountAndUnlockTime.unlockTime / 1000} />
        </Box>
      </WithdrawInfo>

      <div>
        {haveSigner && (
          <ActionInfo
            label={t`Estimated TX cost`}
            labelColor="tertiary"
            value={valueGas !== '' && valueGas !== '0' ? valueGas : '-'}
            valueColor="tertiary"
            valueLeft={<LocalFireDepartmentIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}
            valueTooltip={tooltip}
            loading={isLoadingLockEstimateWithdrawGas}
          />
        )}
      </div>

      <FormActions haveSigner={haveSigner} loading={loading}>
        {formStatus.error && (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, false)} />
        )}
        {txInfoBar}
        <Button
          fillWidth
          size="large"
          variant="filled"
          disabled={!canUnlock}
          onClick={() => updateFormValues({}, false)}
        >
          Withdraw
        </Button>
      </FormActions>
    </>
  )
}

const WithdrawInfo = styled(Box)`
  p {
    font-size: var(--font-size-2);
  }
`

const RowTitle = styled.p`
  font-weight: var(--bold);
`

export default FormWithdraw
