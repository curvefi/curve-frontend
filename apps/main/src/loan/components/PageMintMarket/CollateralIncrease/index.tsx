import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import AlertFormError from '@/loan/components/AlertFormError'
import DetailInfoBorrowRate from '@/loan/components/DetailInfoBorrowRate'
import DetailInfoEstimateGas from '@/loan/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/loan/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/loan/components/DetailInfoLiqRange'
import DialogHealthWarning from '@/loan/components/DialogHealthWarning'
import LoanFormConnect from '@/loan/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/loan/components/PageMintMarket/CollateralIncrease/types'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/loan/components/PageMintMarket/styles'
import type { FormEstGas, ManageLoanProps } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS } from '@/loan/components/PageMintMarket/utils'
import { DEFAULT_WALLET_BALANCES } from '@/loan/constants'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import networks from '@/loan/networks'
import { DEFAULT_FORM_STATUS } from '@/loan/store/createLoanCollateralIncreaseSlice'
import useStore from '@/loan/store/useStore'
import { type ChainId, LlamaApi, Llamma } from '@/loan/types/loan.types'
import { curveProps } from '@/loan/utils/helpers'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { getActiveStep } from '@ui/Stepper/helpers'
import Stepper from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useLegacyTokenInput } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'

const CollateralIncrease = ({
  curve,
  isReady,
  market: llamma,
}: Pick<ManageLoanProps, 'curve' | 'isReady' | 'market'>) => {
  const llammaId = llamma?.id ?? ''
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralIncrease.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralIncrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanCollateralIncrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanCollateralIncrease.formStatus)
  const formValues = useStore((state) => state.loanCollateralIncrease.formValues)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useUserLoanDetails(llammaId)
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )

  const fetchStepApprove = useStore((state) => state.loanCollateralIncrease.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanCollateralIncrease.fetchStepIncrease)
  const setFormValues = useStore((state) => state.loanCollateralIncrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanCollateralIncrease.setStateByKey)
  const resetState = useStore((state) => state.loanCollateralIncrease.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { chainId, haveSigner } = curveProps(curve)
  const network = chainId && networks[chainId]

  const [, collateralAddress] = llamma?.coinAddresses ?? []
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId: network?.chainId, tokenAddress: collateralAddress })

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
    [formStatus.isApproved, setStateByKey],
  )

  const handleInpChangeCollateral = (collateral: string) => {
    reset(!!formStatus.error, formStatus.isComplete)

    const updatedFormValues = { ...formValues }
    updatedFormValues.collateral = collateral
    updatedFormValues.collateralError = ''
    updateFormValues(updatedFormValues)
  }

  const onCollateralChanged = useCallback(
    (val?: Decimal) => {
      const { formStatus, formValues } = useStore.getState().loanCollateralIncrease
      if (formValues.collateral === (val ?? '')) return
      reset(!!formStatus.error, formStatus.isComplete)
      updateFormValues({ ...formValues, collateral: val ?? '', collateralError: '' })
    },
    [reset, updateFormValues],
  )

  const handleBtnClickAdd = useCallback(
    async (payloadActiveKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues) => {
      const chainId = curve.chainId as ChainId
      const notifyMessage = t`Please confirm depositing ${formValues.collateral} ${llamma.collateralSymbol}`
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
      const { collateral, collateralError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const haveCollateral = !!collateral && +collateral > 0
      const isValid = !!curve.signerAddress && !formEstGas.loading && haveCollateral && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${llamma.collateralSymbol}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, llamma, formValues)
            notification?.dismiss()
          },
        },
        ADD: {
          key: 'ADD',
          status: getStepStatus(isComplete, step === 'ADD', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Collateral Added` : t`Add Collateral`,
          ...(healthMode?.message
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
                    onClick: () => handleBtnClickAdd(payloadActiveKey, curve, llamma, formValues),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Add anyway',
                },
              }
            : { onClick: async () => handleBtnClickAdd(payloadActiveKey, curve, llamma, formValues) }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['ADD'] : ['APPROVAL', 'ADD']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickAdd, healthMode],
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
      <div>
        {/* input collateral */}
        <Box grid gridRowGap={1}>
          {useLegacyTokenInput() ? (
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
                  onChange={handleInpChangeCollateral}
                />
                <InputMaxBtn onClick={() => handleInpChangeCollateral(userWalletBalances.collateral)} />
              </InputProvider>
              <StyledInpChip size="xs" isDarkBg isError>
                {formValues.collateralError === 'too-much' && (
                  <>Collateral is greater than {formatNumber(userWalletBalances.collateral)}</>
                )}
              </StyledInpChip>
            </>
          ) : (
            <LargeTokenInput
              name="collateral"
              label={t`Collateral to add`}
              testId="inpCollateral"
              isError={!!formValues.collateralError}
              {...(formValues.collateralError === 'too-much' && {
                message: t`Collateral is greater than ${formatNumber(userWalletBalances.collateral)}`,
              })}
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
              balance={decimal(formValues.collateral)}
              tokenSelector={
                <TokenLabel
                  blockchainId={network?.id}
                  tooltip={getTokenName(llamma).collateral}
                  address={collateralAddress}
                  label={getTokenName(llamma).collateral}
                />
              }
              onBalance={onCollateralChanged}
            />
          )}
        </Box>

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
            amount={formValues.collateral}
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
      </div>

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        ) : detailInfo.healthNotFull !== healthMode.percent && healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default CollateralIncrease
