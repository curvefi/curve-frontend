import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { DetailInfoEstimateGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoRate } from '@/lend/components/DetailInfoRate'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageVault/VaultWithdrawRedeem/types'
import { StyledDetailInfoWrapper } from '@/lend/components/styles'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { _getMaxActiveKey } from '@/lend/store/createVaultDepositMintSlice'
import { _isWithdraw } from '@/lend/store/createVaultWithdrawRedeemSlice'
import { useStore } from '@/lend/store/useStore'
import { Api, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import type { Decimal } from '@primitives/decimal.utils'
import { AlertBox } from '@ui/AlertBox'
import { Checkbox } from '@ui/Checkbox'
import { DetailInfo } from '@ui/DetailInfo'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { decimal } from '@ui-kit/utils'
export const VaultWithdrawRedeem = ({ rChainId, rOwmId, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const rFormType = 'withdraw'
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.vaultWithdrawRedeem.activeKey)
  const formEstGas = useStore((state) => state.vaultWithdrawRedeem.formEstGas[activeKey])
  const formStatus = useStore((state) => state.vaultWithdrawRedeem.formStatus)
  const formValues = useStore((state) => state.vaultWithdrawRedeem.formValues)
  const detailInfo = useStore((state) => state.vaultWithdrawRedeem.detailInfo[activeKey])
  const maxActiveKey = _getMaxActiveKey(rChainId, rFormType, market)
  const maxResp = useStore((state) => state.vaultWithdrawRedeem.max[maxActiveKey])
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepWithdrawRedeem = useStore((state) => state.vaultWithdrawRedeem.fetchStepWithdrawRedeem)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const setFormValues = useStore((state) => state.vaultWithdrawRedeem.setFormValues)
  const resetState = useStore((state) => state.vaultWithdrawRedeem.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}
  const { max } = maxResp ?? {}

  const isNotReady = typeof max === 'undefined' || typeof userBalances?.vaultSharesConverted === 'undefined'
  const disableWithdrawInFull = isNotReady || max !== userBalances?.vaultSharesConverted

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

  const handleFormChange = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      reset({ ...updatedFormValues, amountError: '' })
    },
    [reset],
  )

  const handleBtnClickWithdrawRedeem = useCallback(
    async (
      payloadActiveKey: string,
      rFormType: string,
      api: Api,
      market: OneWayMarketTemplate,
      formValues: FormValues,
    ) => {
      const { chainId } = api

      let notifyMessage = t`withdraw ${formValues.amount} ${market.borrowed_token.symbol}`
      let vaultShares = ''

      if (formValues.isFullWithdraw) {
        const userBalances = await fetchUserMarketBalances(api, market, true)
        vaultShares = userBalances.vaultShares
        notifyMessage = t`a full withdraw of ${vaultShares} vault shares`
      }

      const notification = notify(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">{`Pending ${notifyMessage}`}</AlertBox>)
      const resp = await fetchStepWithdrawRedeem(payloadActiveKey, rFormType, api, market, formValues, vaultShares)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txMessage = t`Transaction complete.`
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
    [activeKey, fetchStepWithdrawRedeem, fetchUserMarketBalances, reset],
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
      const { amount, amountError, isFullWithdraw } = formValues
      const { error, isComplete, isInProgress, step } = formStatus

      const isValidAmount = +amount > 0 && !amountError && !error
      const isValid = !!signerAddress && (isValidAmount || isFullWithdraw)
      const isWithdraw = _isWithdraw(rFormType)

      const stepsObj: { [key: string]: Step } = {
        WITHDRAW_REDEEM: {
          key: 'WITHDRAW_REDEEM',
          status: helpers.getStepStatus(isComplete, step === 'WITHDRAW_REDEEM', isValid),
          type: 'action',
          content: isComplete ? (isWithdraw ? t`Withdrawn` : t`Redeemed`) : isWithdraw ? t`Withdraw` : t`Redeem`,
          onClick: async () => handleBtnClickWithdrawRedeem(payloadActiveKey, rFormType, api, market, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = ['WITHDRAW_REDEEM']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [handleBtnClickWithdrawRedeem],
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
  const onBalance = useCallback((amount?: Decimal) => reset({ amount: amount ?? '' }), [reset])

  return (
    <>
      <LargeTokenInput
        name="amount"
        disabled={disabled}
        balance={decimal(formValues.amount)}
        isError={!!formValues.amountError}
        message={
          formValues.amountError === 'too-much-wallet'
            ? t`Amount > wallet balance ${formatNumber(userBalances?.vaultSharesConverted ?? '')}`
            : formValues.amountError === 'too-much-max'
              ? t`Amount exceeds max ${_isWithdraw(rFormType) ? t`withdraw` : t`redeem`} amount ${formatNumber(max ?? '')}`
              : undefined
        }
        walletBalance={{
          balance: decimal(userBalances?.vaultSharesConverted),
          loading: !!signerAddress && userBalances == null,
          symbol: t`Vault shares`,
        }}
        maxBalance={{
          balance: decimal(max),
          chips: 'max',
        }}
        onBalance={onBalance}
        testId="inpCollateral"
      />

      <Checkbox
        isDisabled={disableWithdrawInFull}
        isSelected={formValues.isFullWithdraw}
        onChange={(isFullWithdraw) => handleFormChange({ isFullWithdraw, amount: '' })}
      >
        {t`Withdraw in full`}
      </Checkbox>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {/* preview */}
        <DetailInfo
          loading={
            !!signerAddress && typeof detailInfo === 'undefined' && +formValues.amount > 0 && !formValues.amountError
          }
          loadingSkeleton={[100, 20]}
          label={t`Vault shares required:`}
        >
          <strong>{formatNumber(detailInfo?.preview, { defaultValue: '-' })}</strong>
        </DetailInfo>
        <DetailInfoRate rChainId={rChainId} rOwmId={rOwmId} isBorrow={false} futureRates={detailInfo?.futureRates} />

        {signerAddress && (
          <DetailInfoEstimateGas
            isDivider
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
