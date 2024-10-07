


import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import Stepper from '@/ui/Stepper'
import { getActiveStep } from '@/ui/Stepper/helpers'
import type { Step } from '@/ui/Stepper/types'
import TxInfoBar from '@/ui/TxInfoBar'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AlertFormError from '@/components/AlertFormError'
import DetailInfoCrvIncentives from '@/components/DetailInfoCrvIncentives'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import InpChipVaultSharesUsdRate from '@/components/InpChipVaultShareUsdRate'
import LoanFormConnect from '@/components/LoanFormConnect'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/components/PageLoanManage/styles'
import type { FormValues, FormStatus, StepKey } from '@/components/PageVault/VaultStake/types'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import useStore from '@/store/useStore'

const VaultStake = ({ rChainId, rOwmId, rFormType, isLoaded, api, owmData, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.vaultStake.activeKey)
  const formEstGas = useStore((state) => state.vaultStake.formEstGas[activeKey])
  const formStatus = useStore((state) => state.vaultStake.formStatus)
  const formValues = useStore((state) => state.vaultStake.formValues)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.vaultStake.fetchStepApprove)
  const fetchStepStake = useStore((state) => state.vaultStake.fetchStepStake)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.vaultStake.setFormValues)
  const resetState = useStore((state) => state.vaultStake.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(rChainId, rFormType, isLoaded ? api : null, owmData, updatedFormValues)
    },
    [api, isLoaded, owmData, rChainId, rFormType, setFormValues]
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)
    },
    [updateFormValues]
  )

  const handleInpAmountChange = (amount: string) => {
    reset({ amount })
  }

  const handleBtnClickStake = useCallback(
    async (payloadActiveKey: string, rFormType: string, api: Api, owmData: OWMData, formValues: FormValues) => {
      const { chainId } = api
      const { amount } = formValues

      const notifyMessage = t`stake ${amount} vault shares`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepStake(payloadActiveKey, rFormType, api, owmData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = networks[chainId].scanTxPath(resp.hash)
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={txHash} onClose={() => reset({})} />)
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepStake, notifyNotification, reset]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      rFormType: string,
      api: Api,
      owmData: OWMData,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[]
    ) => {
      const { signerAddress } = api
      const { amount, amountError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && +amount > 0 && !amountError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of vault shares`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, rFormType, api, owmData, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        STAKE: {
          key: 'STAKE',
          status: helpers.getStepStatus(isComplete, step === 'STAKE', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Staked` : t`Stake`,
          onClick: async () => handleBtnClickStake(payloadActiveKey, rFormType, api, owmData, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['STAKE'] : ['APPROVAL', 'STAKE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickStake, notifyNotification]
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  useEffect(() => {
    if (isLoaded) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && owmData && rFormType) {
      const updatedSteps = getSteps(activeKey, rFormType, api, owmData, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step
  const detailInfoCrvIncentivesComp = DetailInfoCrvIncentives({ rChainId, rOwmId, lpTokenAmount: formValues.amount })

  return (
    <>
      <div>
        {/* input amount */}
        <Box grid gridRowGap={1}>
          <InputProvider
            grid
            gridTemplateColumns="1fr auto"
            padding="4px 8px"
            inputVariant={formValues.amountError ? 'error' : undefined}
            disabled={disabled}
            id="amount"
          >
            <InputDebounced
              id="inpVaultShares"
              type="number"
              labelProps={{
                label: t`Vault shares Avail.`,
                descriptionLoading: !!signerAddress && typeof userBalances === 'undefined',
                description: formatNumber(userBalances?.vaultShares, { defaultValue: '-' }),
              }}
              value={formValues.amount}
              onChange={handleInpAmountChange}
            />
            <InputMaxBtn onClick={() => handleInpAmountChange(userBalances?.vaultShares ?? '')} />
          </InputProvider>
          <InpChipVaultSharesUsdRate rChainId={rChainId} rOwmId={rOwmId} amount={formValues?.amount} />
          <StyledInpChip size="xs" isDarkBg isError>
            {formValues.amountError === 'too-much-wallet' && (
              <>
                {t`Amount > wallet balance`} {formatNumber(userBalances?.vaultShares ?? '')}
              </>
            )}
          </StyledInpChip>
        </Box>
      </div>

      {/* detail info */}
      {(detailInfoCrvIncentivesComp || signerAddress) && (
        <StyledDetailInfoWrapper>
          {detailInfoCrvIncentivesComp}

          {signerAddress && (
            <DetailInfoEstimateGas
              isDivider={detailInfoCrvIncentivesComp !== null}
              chainId={rChainId}
              {...formEstGas}
              stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
            />
          )}
        </StyledDetailInfoWrapper>
      )}

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {formStatus.error ? <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({})} /> : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default VaultStake
