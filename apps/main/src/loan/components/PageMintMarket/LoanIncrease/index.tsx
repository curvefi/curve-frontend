import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { AlertFormError } from '@/loan/components/AlertFormError'
import { DetailInfoBorrowRate } from '@/loan/components/DetailInfoBorrowRate'
import { DetailInfoEstimateGas } from '@/loan/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/loan/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/loan/components/DetailInfoLiqRange'
import { DialogHealthWarning } from '@/loan/components/DialogHealthWarning'
import { LoanFormConnect } from '@/loan/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/loan/components/PageMintMarket/LoanIncrease/types'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/loan/components/PageMintMarket/styles'
import type { FormEstGas, ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_EST_GAS,
  DEFAULT_USER_WALLET_BALANCES,
} from '@/loan/components/PageMintMarket/utils'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { networks } from '@/loan/networks'
import { DEFAULT_FORM_STATUS, getMaxRecvActiveKey } from '@/loan/store/createLoanIncreaseSlice'
import { useStore } from '@/loan/store/useStore'
import { type ChainId, LlamaApi, Llamma } from '@/loan/types/loan.types'
import { curveProps } from '@/loan/utils/helpers'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { InputDebounced, InputMaxBtn, InputProvider } from '@ui/InputComp'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useLegacyTokenInput } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'

// Borrow more
export const LoanIncrease = ({ curve, isReady, market: llamma }: Pick<ManageLoanProps, 'curve' | 'isReady' | 'market'>) => {
  const llammaId = llamma?.id ?? ''
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanIncrease.activeKey)
  const detailInfo = useStore((state) => state.loanIncrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanIncrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanIncrease.formStatus)
  const formValues = useStore((state) => state.loanIncrease.formValues)
  const maxRecvActiveKey = llamma ? getMaxRecvActiveKey(llamma, formValues.collateral) : ''
  const maxRecv = useStore((state) => state.loanIncrease.maxRecv[maxRecvActiveKey])
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useUserLoanDetails(llammaId)
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_USER_WALLET_BALANCES,
  )

  const init = useStore((state) => state.loanIncrease.init)
  const fetchStepApprove = useStore((state) => state.loanIncrease.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanIncrease.fetchStepIncrease)
  const setFormValues = useStore((state) => state.loanIncrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanIncrease.setStateByKey)
  const resetState = useStore((state) => state.loanIncrease.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { chainId, haveSigner } = curveProps(curve)
  const resolvedChainId = (chainId ?? 1) as ChainId
  const network = networks[resolvedChainId]
  const shouldUseLegacyTokenInput = useLegacyTokenInput()
  const [stablecoinAddress, collateralAddress] = llamma?.coinAddresses ?? []
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress: collateralAddress })
  const { data: stablecoinUsdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress: stablecoinAddress })

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
      setConfirmHealthWarning(false)
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

  const handleInpChange = useCallback(
    (name: 'collateral' | 'debt', value: string) => {
      reset(!!formStatus.error, formStatus.isComplete)
      updateFormValues({
        ...useStore.getState().loanIncrease.formValues,
        [name]: value,
        collateralError: '',
        debtError: '',
      })
    },
    [formStatus.error, formStatus.isComplete, reset, updateFormValues],
  )

  const onDebtChanged = useCallback((val?: Decimal) => handleInpChange('debt', val ?? ''), [handleInpChange])
  const onCollateralChanged = useCallback(
    (val?: Decimal) => handleInpChange('collateral', val ?? ''),
    [handleInpChange],
  )

  const handleBtnClickBorrow = useCallback(
    async (payloadActiveKey: string, curve: LlamaApi, formValues: FormValues, llamma: Llamma) => {
      const chainId = curve.chainId as ChainId
      const { collateral, debt } = formValues
      const haveCollateral = +collateral > 0
      const haveDebt = +debt > 0

      const notifyMessage =
        haveCollateral && haveDebt
          ? t`Please confirm borrowing of ${formValues.debt} ${getTokenName(llamma).stablecoin} and adding ${
              formValues.collateral
            } ${llamma.collateralSymbol}.`
          : t`Please confirm borrowing of ${formValues.debt} ${getTokenName(llamma).stablecoin}.`

      const notification = notify(notifyMessage, 'pending')

      const resp = await fetchStepIncrease(payloadActiveKey, curve, llamma, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        setTxInfoBar(
          <TxInfoBar
            description={t`Transaction complete`}
            txHash={scanTxPath(networks[chainId], resp.hash)}
            onClose={() => reset(false, true)}
          />,
        )
      }
      notification?.dismiss()
    },
    [activeKey, fetchStepIncrease, reset],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { debt, debtError, collateralError } = formValues
      const { error, isApproved, isComplete, step } = formStatus
      const haveDebt = +debt > 0
      const isValid =
        !!curve.signerAddress && !formEstGas.loading && haveDebt && !debtError && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${formValues.collateral}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, llamma, formValues)
            notification?.dismiss()
          },
        },
        BORROW: {
          key: 'BORROW',
          status: getStepStatus(isComplete, step === 'BORROW', isValid && isApproved),
          type: 'action',
          content: formStatus.isComplete ? t`Borrowed` : t`Borrow`,
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
                    onClick: () => handleBtnClickBorrow(payloadActiveKey, curve, formValues, llamma),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: t`Borrow more anyway`,
                },
              }
            : { onClick: async () => handleBtnClickBorrow(payloadActiveKey, curve, formValues, llamma) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.isInProgress || formStatus.isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['BORROW'] : ['APPROVAL', 'BORROW']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [healthMode, fetchStepApprove, handleBtnClickBorrow],
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
    if (isReady && chainId && llamma) {
      void init(chainId, llamma)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, chainId, llamma])

  // steps
  useEffect(() => {
    if (curve && llamma) {
      const updatedSteps = getSteps(
        activeKey,
        curve,
        llamma,
        confirmedHealthWarning,
        formEstGas,
        formStatus,
        formValues,
        steps,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedHealthWarning, healthMode?.message, llamma?.id, haveSigner, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disabled = !isReady || formStatus.isInProgress

  return (
    <>
      {/* field debt */}
      {shouldUseLegacyTokenInput ? (
        <Box grid gridRowGap={1}>
          <InputProvider
            grid
            gridTemplateColumns="1fr auto"
            padding="4px 8px"
            inputVariant={formValues.debtError ? 'error' : undefined}
            disabled={disabled}
            id="debt"
          >
            <InputDebounced
              id="inpDebt"
              type="number"
              labelProps={{
                label: t`${getTokenName(llamma).stablecoin} borrow amount`,
              }}
              value={formValues.debt}
              onChange={(val) => handleInpChange('debt', val)}
            />
            <InputMaxBtn disabled={disabled} onClick={() => handleInpChange('debt', maxRecv)} />
          </InputProvider>
          {formValues.debtError === 'too-much' ? (
            <StyledInpChip size="xs" isDarkBg isError>
              Borrow amount is greater than ${formatNumber(maxRecv)}, increase collateral to borrow more
            </StyledInpChip>
          ) : (
            <StyledInpChip size="xs">
              Max borrow amount {isReady && maxRecv ? formatNumber(maxRecv) : '-'}
            </StyledInpChip>
          )}
        </Box>
      ) : (
        <LargeTokenInput
          label={t`Borrow amount:`}
          name="debt"
          isError={!!formValues.debtError}
          message={
            formValues.debtError === 'too-much'
              ? t`Borrow amount is greater than ${formatNumber(maxRecv)}, increase collateral to borrow more`
              : isReady && t`Max borrow amount ${formatNumber(maxRecv, { defaultValue: '-' })}`
          }
          disabled={disabled}
          inputBalanceUsd={decimal(formValues.debt && stablecoinUsdRate && stablecoinUsdRate * +formValues.debt)}
          walletBalance={{
            loading: userWalletBalancesLoading,
            balance: decimal(userWalletBalances.stablecoin),
            symbol: getTokenName(llamma).stablecoin,
            usdRate: stablecoinUsdRate,
          }}
          maxBalance={{
            balance: decimal(maxRecv),
            chips: 'max',
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
      )}

      {/* input collateral */}
      <Box grid gridRowGap={1}>
        {shouldUseLegacyTokenInput ? (
          <>
            <InputProvider
              grid
              gridTemplateColumns="1fr auto"
              padding="4px 8px"
              inputVariant={formValues.collateralError ? 'error' : undefined}
              disabled={disabled}
              id="collateral"
            >
              <InputDebounced
                id="inpCollateral"
                type="number"
                labelProps={{
                  label: t`${getTokenName(llamma).collateral} Avail.`,
                  descriptionLoading: userWalletBalancesLoading,
                  description: formatNumber(userWalletBalances.collateral),
                }}
                value={formValues.collateral}
                onChange={(val) => handleInpChange('collateral', val)}
              />
              <InputMaxBtn
                disabled={disabled}
                onClick={() => handleInpChange('collateral', userWalletBalances.collateral)}
              />
            </InputProvider>
            <StyledInpChip size="xs" isDarkBg isError>
              {formValues.collateralError === 'too-much' && userWalletBalances?.collateral && (
                <>Collateral is greater than {+userWalletBalances.collateral}</>
              )}
            </StyledInpChip>
          </>
        ) : (
          <LargeTokenInput
            name="collateral"
            isError={!!formValues.collateralError}
            disabled={disabled}
            inputBalanceUsd={decimal(
              formValues.collateral && collateralUsdRate && collateralUsdRate * +formValues.collateral,
            )}
            walletBalance={{
              loading: userWalletBalancesLoading,
              balance: decimal(userWalletBalances.collateral),
              symbol: getTokenName(llamma).collateral,
              usdRate: collateralUsdRate,
            }}
            label={t`Collateral amount:`}
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
            {...(formValues.collateralError === 'too-much' &&
              userWalletBalances?.collateral && {
                message: t`Collateral is greater than ${formatNumber(userWalletBalances.collateral)}`,
              })}
          />
        )}

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
          {chainId && (
            <DetailInfoEstimateGas
              isDivider
              chainId={chainId}
              {...formEstGas}
              stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
            />
          )}
        </StyledDetailInfoWrapper>
      </Box>

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
/**
 * The new implementation of LoanBorrowMore with mui isn't ready yet. For now, we wrap the old one for styling.
 */
export const LoanIncreaseWrapped = (props: ManageLoanProps) => (
  <FormContent>
    <LoanIncrease {...props} />
  </FormContent>
)
