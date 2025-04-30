import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import AlertFormError from '@/lend/components/AlertFormError'
import DetailInfoEstimateGas from '@/lend/components/DetailInfoEstimateGas'
import InpChipVaultSharesUsdRate from '@/lend/components/InpChipVaultShareUsdRate'
import LoanFormConnect from '@/lend/components/LoanFormConnect'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/lend/components/PageLoanManage/styles'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageVault/VaultUnstake/types'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { LlamalendApi, PageContentProps } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import Stepper from '@ui/Stepper'
import { getActiveStep } from '@ui/Stepper/helpers'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const VaultUnstake = ({ rChainId, rOwmId, rFormType, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.vaultUnstake.activeKey)
  const formEstGas = useStore((state) => state.vaultUnstake.formEstGas[activeKey])
  const formStatus = useStore((state) => state.vaultUnstake.formStatus)
  const formValues = useStore((state) => state.vaultUnstake.formValues)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepUnstake = useStore((state) => state.vaultUnstake.fetchStepUnstake)
  const setFormValues = useStore((state) => state.vaultUnstake.setFormValues)
  const resetState = useStore((state) => state.vaultUnstake.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      void setFormValues(rChainId, rFormType, isLoaded ? api : null, market, updatedFormValues)
    },
    [api, isLoaded, market, rChainId, rFormType, setFormValues],
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)
    },
    [updateFormValues],
  )

  const handleInpAmountChange = (amount: string) => {
    reset({ amount })
  }

  const handleBtnClickUnstake = useCallback(
    async (
      payloadActiveKey: string,
      rFormType: string,
      api: LlamalendApi,
      market: LendMarketTemplate,
      formValues: FormValues,
    ) => {
      const { chainId } = api
      const { amount } = formValues

      const notifyMessage = t`unstake ${amount} vault shares`
      const notification = notify(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepUnstake(payloadActiveKey, rFormType, api, market, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = networks[chainId].scanTxPath(resp.hash)
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={txHash} onClose={() => reset({})} />)
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [activeKey, fetchStepUnstake, reset],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      rFormType: string,
      api: LlamalendApi,
      market: LendMarketTemplate,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { signerAddress } = api
      const { amount, amountError } = formValues
      const { error, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && +amount > 0 && !amountError && !error

      const stepsObj: { [key: string]: Step } = {
        UNSTAKE: {
          key: 'UNSTAKE',
          status: helpers.getStepStatus(isComplete, step === 'UNSTAKE', isValid),
          type: 'action',
          content: isComplete ? t`Unstaked` : t`Unstake`,
          onClick: async () => handleBtnClickUnstake(payloadActiveKey, rFormType, api, market, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = ['UNSTAKE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [handleBtnClickUnstake],
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
    if (isLoaded && api && market && rFormType) {
      const updatedSteps = getSteps(activeKey, rFormType, api, market, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

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
                description: formatNumber(userBalances?.gauge, { defaultValue: '-' }),
              }}
              value={formValues.amount}
              onChange={handleInpAmountChange}
            />
            <InputMaxBtn onClick={() => handleInpAmountChange(userBalances?.gauge ?? '')} />
          </InputProvider>
          <InpChipVaultSharesUsdRate rChainId={rChainId} rOwmId={rOwmId} amount={formValues?.amount} />
          <StyledInpChip size="xs" isDarkBg isError>
            {formValues.amountError === 'too-much-wallet' && (
              <>
                {t`Amount > wallet balance`} {formatNumber(userBalances?.gauge ?? '')}
              </>
            )}
          </StyledInpChip>
        </Box>
      </div>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {signerAddress && (
          <DetailInfoEstimateGas
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </StyledDetailInfoWrapper>

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {formStatus.error ? <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({})} /> : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default VaultUnstake
