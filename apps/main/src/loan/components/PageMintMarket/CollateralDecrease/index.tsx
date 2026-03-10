import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { AlertFormError } from '@/loan/components/AlertFormError'
import { DetailInfoBorrowRate } from '@/loan/components/DetailInfoBorrowRate'
import { DetailInfoEstimateGas } from '@/loan/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/loan/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/loan/components/DetailInfoLiqRange'
import { DialogHealthWarning } from '@/loan/components/DialogHealthWarning'
import { LoanFormConnect } from '@/loan/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/loan/components/PageMintMarket/CollateralDecrease/types'
import { StyledDetailInfoWrapper } from '@/loan/components/PageMintMarket/styles'
import type { FormEstGas, ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS } from '@/loan/components/PageMintMarket/utils'
import { DEFAULT_WALLET_BALANCES } from '@/loan/constants'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { networks } from '@/loan/networks'
import { DEFAULT_FORM_STATUS } from '@/loan/store/createLoanCollateralDecreaseSlice'
import { useStore } from '@/loan/store/useStore'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { curveProps } from '@/loan/utils/helpers'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import type { Decimal } from '@primitives/decimal.utils'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
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

export const CollateralDecrease = ({
  curve,
  market: llamma,
  rChainId,
}: Pick<ManageLoanProps, 'curve' | 'market' | 'rChainId'>) => {
  const llammaId = llamma?.id ?? ''
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralDecrease.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralDecrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanCollateralDecrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanCollateralDecrease.formStatus)
  const formValues = useStore((state) => state.loanCollateralDecrease.formValues)
  const maxRemovable = useStore((state) => state.loanCollateralDecrease.maxRemovable)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useUserLoanDetails(llammaId)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )

  const init = useStore((state) => state.loanCollateralDecrease.init)
  const fetchStepDecrease = useStore((state) => state.loanCollateralDecrease.fetchStepDecrease)
  const setFormValues = useStore((state) => state.loanCollateralDecrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanCollateralDecrease.setStateByKey)
  const resetState = useStore((state) => state.loanCollateralDecrease.resetState)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const network = networks[rChainId]
  const { chainId, haveSigner } = curveProps(curve)

  const [, collateralAddress] = llamma?.coinAddresses ?? []
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress: collateralAddress })

  const updateFormValues = useCallback(
    (updatedFormValues: FormValues) => {
      if (chainId && llamma) {
        void setFormValues(chainId, llamma, updatedFormValues, maxRemovable)
      }
    },
    [chainId, llamma, maxRemovable, setFormValues],
  )

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setConfirmHealthWarning(false)
      setTxInfoBar(null)

      if (isErrorReset || isFullReset) {
        if (isFullReset) {
          setHealthMode(DEFAULT_HEALTH_MODE)
        }
        setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved })
      }
    },
    [formStatus.isApproved, setStateByKey],
  )

  const onCollateralChanged = useCallback(
    (val?: Decimal) => {
      const { formValues, formStatus } = useStore.getState().loanCollateralDecrease
      if ((val ?? '') === formValues.collateral) return
      reset(!!formStatus.error, formStatus.isComplete)
      updateFormValues({ ...formValues, collateral: val ?? '', collateralError: '' })
    },
    [reset, updateFormValues],
  )

  const handleBtnClickRemove = useCallback(
    async (payloadActiveKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues) => {
      const notifyMessage = t`Please confirm removal of ${formValues.collateral} ${llamma.collateralSymbol}`
      const notification = notify(notifyMessage, 'pending')
      const resp = await fetchStepDecrease(payloadActiveKey, curve, llamma, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txMessage = `Remove ${formValues.collateral} ${llamma.collateralSymbol} collateral.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(network, resp.hash)}
            onClose={() => reset(false, true)}
          />,
        )
      }
      notification?.dismiss()
    },
    [activeKey, fetchStepDecrease, network, reset],
  )

  const stepsObj = useCallback(
    (
      payloadActiveKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
    ) => {
      const { collateral, collateralError } = formValues
      const { error, isComplete, step } = formStatus
      const haveCollateral = !!collateral && +collateral > 0
      const isValid = !!curve.signerAddress && !formEstGas.loading && haveCollateral && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        REMOVE: {
          key: 'REMOVE',
          status: getStepStatus(isComplete, step === 'REMOVE', isValid),
          type: 'action',
          content: isComplete ? t`Collateral Removed` : t`Remove Collateral`,
          ...(healthMode.message
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    <DialogHealthWarning
                      {...healthMode}
                      confirmed={confirmedHealthWarning}
                      setConfirmed={(val) => setConfirmHealthWarning(val)}
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmHealthWarning(false),
                  },
                  primaryBtnProps: {
                    onClick: () => handleBtnClickRemove(payloadActiveKey, curve, llamma, formValues),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Remove anyway',
                },
              }
            : { onClick: async () => handleBtnClickRemove(payloadActiveKey, curve, llamma, formValues) }),
        },
      }

      const stepsKey: StepKey[] = ['REMOVE']

      return stepsKey.map((k) => stepsObj[k])
    },
    [healthMode, handleBtnClickRemove],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  // init
  useEffect(() => {
    if (haveSigner && chainId && llamma) {
      init(chainId, llamma)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, haveSigner, init, llamma?.id])

  // steps
  useEffect(() => {
    if (llamma && curve) {
      const updatedSteps = stepsObj(
        activeKey,
        curve,
        llamma,
        confirmedHealthWarning,
        formEstGas,
        formStatus,
        formValues,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedHealthWarning, healthMode?.message, llamma?.id, haveSigner, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disabled = !chainId || !llamma || formStatus.isInProgress || maxRemovable === ''

  return (
    <>
      {/* input collateral */}
      <Box grid gridRowGap={1}>
        <LargeTokenInput
          name="collateral"
          label={t`Collateral to remove`}
          isError={!!formValues.collateralError}
          {...(formValues.collateralError === 'too-much' && {
            message: t`Cannot be greater than ${maxRemovable ? formatNumber(maxRemovable) : '0'}`,
          })}
          disabled={disabled}
          inputBalanceUsd={decimal(
            formValues.collateral && collateralUsdRate && collateralUsdRate * +formValues.collateral,
          )}
          walletBalance={{
            balance: decimal(userWalletBalances.collateral),
            symbol: getTokenName(llamma).collateral,
            usdRate: collateralUsdRate,
          }}
          balance={decimal(formValues.collateral)}
          tokenSelector={
            <TokenLabel
              blockchainId={network.id}
              tooltip={getTokenName(llamma).collateral}
              address={collateralAddress}
              label={getTokenName(llamma).collateral}
            />
          }
          onBalance={onCollateralChanged}
        />
      </Box>
      {/* detail info */}
      <StyledDetailInfoWrapper>
        <DetailInfoLiqRange
          isManage
          {...detailInfo}
          healthMode={healthMode}
          loanDetails={loanDetails}
          userLoanDetails={userLoanDetails}
        />
        <DetailInfoHealth
          isManage
          {...detailInfo}
          amount={formValues.collateral}
          healthMode={healthMode}
          loanDetails={loanDetails}
          formType="collateral-decrease"
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
        {formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        ) : healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}
