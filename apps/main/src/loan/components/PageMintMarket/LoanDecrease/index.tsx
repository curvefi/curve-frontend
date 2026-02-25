import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { AlertFormError } from '@/loan/components/AlertFormError'
import { AlertFormWarning } from '@/loan/components/AlertFormWarning'
import { DetailInfoBorrowRate } from '@/loan/components/DetailInfoBorrowRate'
import { DetailInfoEstimateGas } from '@/loan/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/loan/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/loan/components/DetailInfoLiqRange'
import { LoanFormConnect } from '@/loan/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/loan/components/PageMintMarket/LoanDecrease/types'
import { StyledDetailInfoWrapper } from '@/loan/components/PageMintMarket/styles'
import type { FormEstGas, ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS } from '@/loan/components/PageMintMarket/utils'
import { DEFAULT_WALLET_BALANCES } from '@/loan/constants'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { networks } from '@/loan/networks'
import { DEFAULT_FORM_STATUS } from '@/loan/store/createLoanDecreaseSlice'
import { useStore } from '@/loan/store/useStore'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { curveProps } from '@/loan/utils/helpers'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import { getCollateralListPathname } from '@/loan/utils/utilsRouter'
import type { Decimal } from '@primitives/decimal.utils'
import { Checkbox } from '@ui/Checkbox'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal } from '@ui-kit/utils'

export const LoanDecrease = ({
  curve,
  market: llamma,
  params,
  rChainId,
}: Pick<ManageLoanProps, 'curve' | 'market' | 'params' | 'rChainId'>) => {
  const llammaId = llamma?.id ?? ''
  const isSubscribed = useRef(false)
  const push = useNavigate()

  const activeKey = useStore((state) => state.loanDecrease.activeKey)
  const detailInfo = useStore((state) => state.loanDecrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanDecrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanDecrease.formStatus)
  const formValues = useStore((state) => state.loanDecrease.formValues)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useUserLoanDetails(llammaId)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)

  const fetchStepApprove = useStore((state) => state.loanDecrease.fetchStepApprove)
  const fetchStepDecrease = useStore((state) => state.loanDecrease.fetchStepDecrease)
  const setFormValues = useStore((state) => state.loanDecrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanDecrease.setStateByKey)
  const resetState = useStore((state) => state.loanDecrease.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { chainId, haveSigner } = curveProps(curve)
  const network = networks[rChainId]

  const [stablecoinAddress] = llamma?.coinAddresses ?? []
  const { data: stablecoinUsdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress: stablecoinAddress })
  const { userState } = userLoanDetails ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: FormValues) => {
      if (chainId && llamma) {
        void setFormValues(chainId, llamma, updatedFormValues)
      }
    },
    [chainId, llamma, setFormValues],
  )

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setTxInfoBar(null)

      if (isErrorReset || isFullReset) {
        if (isFullReset) {
          setHealthMode(DEFAULT_HEALTH_MODE)
        }
        setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved })
      }
    },
    [formStatus, setStateByKey],
  )

  const onDebtChanged = useCallback(
    (value?: Decimal) => {
      reset(!!formStatus.error, formStatus.isComplete)
      const debt = `${value ?? ''}`
      updateFormValues({
        ...useStore.getState().loanDecrease.formValues,
        debt,
        debtError: '',
        isFullRepay: decimal(userState?.debt) == value,
      })
    },
    [formStatus.error, formStatus.isComplete, reset, updateFormValues, userState?.debt],
  )

  const handleInpChangeFullRepay = (isFullRepay: boolean) => {
    reset(true, false)
    const updatedFormValues = { ...formValues }
    updatedFormValues.debt = ''
    updatedFormValues.debtError = ''
    updatedFormValues.isFullRepay = isFullRepay
    updateFormValues(updatedFormValues)
  }

  const handleBtnClickPay = useCallback(
    async (payloadActiveKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues) => {
      const { debt, isFullRepay } = formValues
      const notifyMessage = isFullRepay
        ? t`Please approve full repay.`
        : t`Please approve a repayment of ${debt} ${getTokenName(llamma).stablecoin}.`
      const notification = notify(notifyMessage, 'pending')
      const resp = await fetchStepDecrease(payloadActiveKey, curve, llamma, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txInfoBarMessage = resp.loanExists
          ? t`Transaction complete`
          : t`Transaction complete. This loan is payoff and will no longer be manageable.`

        setTxInfoBar(
          <TxInfoBar
            description={txInfoBarMessage}
            txHash={scanTxPath(networks[rChainId], resp.hash)}
            onClose={() => {
              if (resp.loanExists) {
                reset(false, true)
              } else {
                push(getCollateralListPathname(params))
              }
            }}
          />,
        )
      }
      notification?.dismiss()
    },
    [activeKey, fetchStepDecrease, push, params, rChainId, reset],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { debt, debtError, isFullRepay } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const isValidFormValue = isFullRepay || (+debt > 0 && !debtError)
      const isValid = !!curve.signerAddress && !formEstGas.loading && isValidFormValue && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${getTokenName(llamma).stablecoin}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, llamma, formValues)
            notification?.dismiss()
          },
        },
        PAY: {
          key: 'PAY',
          status: getStepStatus(isComplete, step === 'PAY', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Repaid` : t`Repay`,
          onClick: () => handleBtnClickPay(payloadActiveKey, curve, llamma, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['PAY'] : ['APPROVAL', 'PAY']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickPay],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  // steps
  useEffect(() => {
    if (curve && llamma) {
      const updatedSteps = getSteps(activeKey, curve, llamma, formEstGas, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthMode?.percent, llamma?.id, curve?.chainId, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disable = !chainId || !llamma || formStatus.isInProgress

  return (
    <>
      {/* input debt */}
      <LargeTokenInput
        name="debt"
        label={t`Debt to repay`}
        isError={!!formValues.debtError}
        message={
          formValues.debtError === 'too-much'
            ? t`The specified amount exceeds your total debt. Your debt balance is ${formatNumber(userState?.debt ?? 0)}.`
            : formValues.debtError === 'not-enough'
              ? t`The specified amount exceeds the current balance in the wallet.`
              : t`Debt ${formatNumber(userState?.debt, { defaultValue: '-' })}`
        }
        disabled={disable || formValues.isFullRepay}
        inputBalanceUsd={decimal(formValues.debt && stablecoinUsdRate && stablecoinUsdRate * +formValues.debt)}
        walletBalance={{
          loading: userWalletBalancesLoading,
          balance: decimal(userWalletBalances.stablecoin),
          symbol: getTokenName(llamma).stablecoin,
          usdRate: stablecoinUsdRate,
        }}
        maxBalance={{
          balance: decimal(userState?.debt),
          chips:
            userState?.debt == null
              ? []
              : [
                  {
                    label: 'Max',
                    newBalance: () =>
                      (+userWalletBalances?.stablecoin < +userState.debt
                        ? userWalletBalances.stablecoin
                        : userState.debt) as Decimal,
                  },
                ],
        }}
        balance={decimal(formValues.debt)}
        tokenSelector={
          <TokenLabel
            blockchainId={network.id}
            tooltip={getTokenName(llamma).stablecoin}
            address={stablecoinAddress}
            label={getTokenName(llamma).stablecoin}
          />
        }
        onBalance={onDebtChanged}
      />

      <Checkbox
        isDisabled={
          disable ||
          typeof userWalletBalances === 'undefined' ||
          typeof userState === 'undefined' ||
          +userWalletBalances?.stablecoin < +userState?.debt
        }
        isSelected={formValues.isFullRepay}
        onChange={(isFullRepay) => handleInpChangeFullRepay(isFullRepay)}
      >
        {t`Repay in full and close loan`}
      </Checkbox>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isAdvancedMode && (
          <DetailInfoLiqRange
            isManage
            {...detailInfo}
            healthMode={healthMode}
            loanDetails={loanDetails}
            userLoanDetails={userLoanDetails}
          />
        )}
        <DetailInfoHealth
          isManage
          {...detailInfo}
          amount={formValues.debt}
          formType=""
          healthMode={healthMode}
          loanDetails={loanDetails}
          userLoanDetails={userLoanDetails}
          setHealthMode={setHealthMode}
        />
        <DetailInfoBorrowRate parameters={loanDetails?.parameters} />
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      </StyledDetailInfoWrapper>

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {!txInfoBar && (
          <>
            {formStatus.error ? (
              <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
            ) : formStatus.warning ? (
              <AlertFormWarning errorKey={formStatus.warning} />
            ) : null}
          </>
        )}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}
