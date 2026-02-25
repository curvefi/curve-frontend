import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { DetailInfoEstimateGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoRate } from '@/lend/components/DetailInfoRate'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageVault/VaultDepositMint/types'
import { StyledDetailInfoWrapper } from '@/lend/components/styles'
import { useMarketAlert } from '@/lend/hooks/useMarketAlert'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { _getMaxActiveKey } from '@/lend/store/createVaultDepositMintSlice'
import { useStore } from '@/lend/store/useStore'
import { Api, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import type { Decimal } from '@primitives/decimal.utils'
import { AlertBox } from '@ui/AlertBox'
import { DetailInfo } from '@ui/DetailInfo'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal } from '@ui-kit/utils'
export const VaultDepositMint = ({ rChainId, rOwmId, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const rFormType = 'deposit'
  const isSubscribed = useRef(false)
  const marketAlert = useMarketAlert(rChainId, rOwmId)

  const activeKey = useStore((state) => state.vaultDepositMint.activeKey)
  const formEstGas = useStore((state) => state.vaultDepositMint.formEstGas[activeKey])
  const formStatus = useStore((state) => state.vaultDepositMint.formStatus)
  const formValues = useStore((state) => state.vaultDepositMint.formValues)
  const detailInfo = useStore((state) => state.vaultDepositMint.detailInfo[activeKey])
  const maxActiveKey = _getMaxActiveKey(rChainId, rFormType, market)
  const maxResp = useStore((state) => state.vaultDepositMint.max[maxActiveKey])
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.vaultDepositMint.fetchStepApprove)
  const fetchStepDepositMint = useStore((state) => state.vaultDepositMint.fetchStepDepositMint)
  const setFormValues = useStore((state) => state.vaultDepositMint.setFormValues)
  const resetState = useStore((state) => state.vaultDepositMint.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)
  const { borrowed_token } = market ?? {}

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

  const { data: usdRate } = useTokenUsdRate({ chainId: rChainId, tokenAddress: borrowed_token?.address })
  const onBalance = useCallback((amount?: Decimal) => reset({ amount: amount ?? '' }), [reset])

  const handleBtnClickDeposit = useCallback(
    async (
      payloadActiveKey: string,
      rFormType: string,
      api: Api,
      market: OneWayMarketTemplate,
      formValues: FormValues,
    ) => {
      const { chainId } = api
      const { amount } = formValues

      const notifyMessage = t`deposit ${amount} ${borrowed_token?.symbol}`
      const notification = notify(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepDepositMint(payloadActiveKey, rFormType, api, market, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(networks[chainId], resp.hash)}
            onClose={() => reset({})}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [activeKey, borrowed_token?.symbol, fetchStepDepositMint, reset],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      rFormType: string,
      api: Api,
      market: OneWayMarketTemplate,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { signerAddress } = api
      const { amount, amountError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const { symbol } = market.borrowed_token
      const isValid = !!signerAddress && +amount > 0 && !amountError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${symbol}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, rFormType, api, market, formValues)
            notification?.dismiss()
          },
        },
        DEPOSIT_MINT: {
          key: 'DEPOSIT_MINT',
          status: helpers.getStepStatus(isComplete, step === 'DEPOSIT_MINT', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Deposited` : t`Deposit`,
          onClick: async () => handleBtnClickDeposit(payloadActiveKey, rFormType, api, market, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['DEPOSIT_MINT'] : ['APPROVAL', 'DEPOSIT_MINT']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickDeposit],
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
    if (isLoaded && api && market) {
      const updatedSteps = getSteps(activeKey, rFormType, api, market, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  return (
    <>
      {
        <LargeTokenInput
          name="inpCollateral"
          isError={!!formValues.amountError}
          message={
            formValues.amountError === 'too-much-wallet'
              ? t`Amount > wallet balance ${formatNumber(userBalances?.borrowed ?? '')}`
              : formValues.amountError === 'too-much-max'
                ? t`Amount > max deposit amount ${formatNumber(maxResp?.max ?? '')}`
                : undefined
          }
          disabled={disabled}
          inputBalanceUsd={decimal(formValues.amount && usdRate && usdRate * +formValues.amount)}
          walletBalance={{
            loading: !!signerAddress && typeof userBalances === 'undefined',
            balance: decimal(userBalances?.borrowed),
            symbol: borrowed_token?.symbol,
            usdRate,
          }}
          maxBalance={{
            balance: decimal(maxResp?.max),
            chips: 'max',
          }}
          balance={decimal(formValues.amount)}
          tokenSelector={
            <TokenLabel
              blockchainId={networks[rChainId].id}
              address={borrowed_token?.address}
              tooltip={borrowed_token?.symbol}
              label={borrowed_token?.symbol ?? ''}
            />
          }
          onBalance={onBalance}
        />
      }

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {/* preview */}
        <DetailInfo
          loading={
            !!signerAddress && typeof detailInfo === 'undefined' && +formValues.amount > 0 && !formValues.amountError
          }
          loadingSkeleton={[100, 20]}
          label={t`Expected vault shares:`}
        >
          <strong>{formatNumber(detailInfo?.preview, { defaultValue: '-' })}</strong>
        </DetailInfo>
        <DetailInfoRate isBorrow={false} rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />

        {signerAddress && (
          <DetailInfoEstimateGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </StyledDetailInfoWrapper>

      {marketAlert && <AlertBox alertType={marketAlert.alertType}>{marketAlert.message}</AlertBox>}

      {/* actions */}
      {!marketAlert?.isDisableDeposit && (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
          {formStatus.error ? <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({})} /> : null}
          {txInfoBar}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </>
  )
}
