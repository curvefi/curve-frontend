import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { MarketParameters } from '@/llamalend/features/market-parameters/MarketParameters'
import { AlertFormError } from '@/loan/components/AlertFormError'
import { DialogHealthWarning } from '@/loan/components/DialogHealthWarning'
import { LoanFormConnect } from '@/loan/components/LoanFormConnect'
import { DetailInfoComp as DetailInfo } from '@/loan/components/PageMintMarket/LoanFormCreate/components/DetailInfo'
import { DialogHealthLeverageWarning } from '@/loan/components/PageMintMarket/LoanFormCreate/components/DialogHealthLeverageWarning'
import type {
  CreateFormStatus,
  FormEstGas,
  FormValues,
  PageLoanCreateProps,
  StepKey,
} from '@/loan/components/PageMintMarket/types'
import { DEFAULT_FORM_EST_GAS } from '@/loan/components/PageMintMarket/utils'
import { DEFAULT_WALLET_BALANCES } from '@/loan/constants'
import { useCollateralAlert } from '@/loan/hooks/useCollateralAlert'
import { networks } from '@/loan/networks'
import { DEFAULT_FORM_STATUS } from '@/loan/store/createLoanCollateralIncreaseSlice'
import { useStore } from '@/loan/store/useStore'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { curveProps } from '@/loan/utils/helpers'
import { hasDeleverage } from '@/loan/utils/leverage'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import { getMintMarketPathname } from '@/loan/utils/utilsRouter'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Accordion } from '@ui/Accordion'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { LinkButton } from '@ui/LinkButton'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify, useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t, Trans } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'

const useFetchInitial = ({
  market: llamma,
  isLeverage,
}: {
  market: MintMarketTemplate | null
  isLeverage: boolean
}) => {
  const { isHydrated, llamaApi: curve = null } = useCurve()
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKeys = useStore((state) => state.loanCreate.setStateByKeys)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const [loaded, setLoaded] = useState(false)

  const fetchInitial = useCallback(
    (curve: LlamaApi, isLeverage: boolean, llamma: Llamma) => {
      // reset createLoan estGas, detailInfo state
      setStateByKeys({
        formEstGas: {},
        detailInfo: {},
        detailInfoLeverage: {},
        liqRanges: {},
        liqRangesMapper: {},
        maxRecv: {},
        maxRecvLeverage: {},
      })

      const updatedFormValues = { ...formValues, n: formValues.n || llamma.defaultBands }
      void setFormValues(curve, isLeverage, llamma, updatedFormValues, maxSlippage)
    },
    [formValues, maxSlippage, setFormValues, setStateByKeys],
  )

  useEffect(() => {
    if (!isHydrated || !curve || !llamma) return
    resetUserDetailsState(llamma)
    fetchInitial(curve, isLeverage, llamma)
    void fetchLoanDetails(curve, llamma)
    setLoaded(true)
  }, [isHydrated, curve, llamma, resetUserDetailsState, fetchInitial, isLeverage, fetchLoanDetails])

  // max slippage updated
  useEffect(() => {
    if (loaded && curve && llamma) {
      void setFormValues(curve, isLeverage, llamma, formValues, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  return fetchInitial
}

export const LoanFormCreate = ({
  isLeverage = false,
  curve,
  isReady,
  market,
  params,
  rChainId,
}: PageLoanCreateProps & { isLeverage?: boolean }) => {
  const collateralAlert = useCollateralAlert(market?.address)
  const isSubscribed = useRef(false)
  useFetchInitial({ market, isLeverage })

  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const formEstGas = useStore((state) => state.loanCreate.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanCreate.formStatus)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const maxRecv = useStore((state) =>
    isLeverage
      ? (state.loanCreate.maxRecvLeverage[activeKey]?.maxBorrowable ?? '')
      : (state.loanCreate.maxRecv[activeKey] ?? ''),
  )
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[market?.id ?? ''] ?? DEFAULT_WALLET_BALANCES,
  )
  const fetchStepApprove = useStore((state) => state.loanCreate.fetchStepApprove)
  const fetchStepCreate = useStore((state) => state.loanCreate.fetchStepCreate)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKey = useStore((state) => state.loanCreate.setStateByKey)
  const resetState = useStore((state) => state.loanCreate.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { haveSigner } = curveProps(curve)
  const network = networks[rChainId]

  const [stablecoinAddress, collateralAddress] = market?.coinAddresses ?? []
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress: collateralAddress })
  const { data: stablecoinUsdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress: stablecoinAddress })

  const updateFormValues = useCallback(
    (updatedFormValues: FormValues) => {
      if (curve && market) {
        void setFormValues(curve, isLeverage, market, updatedFormValues, maxSlippage)
      }
    },
    [curve, isLeverage, market, maxSlippage, setFormValues],
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
        ...useStore.getState().loanCreate.formValues,
        [name]: value,
        collateralError: '',
        debtError: '',
      })
    },
    [formStatus, reset, updateFormValues],
  )

  const onCollateralChanged = useCallback(
    (val?: Decimal) => handleInpChange('collateral', val ?? ''),
    [handleInpChange],
  )
  const onDebtChanged = useCallback((val?: Decimal) => handleInpChange('debt', val ?? ''), [handleInpChange])

  const handleClickCreate = useCallback(
    async (
      payloadActiveKey: string,
      curve: LlamaApi,
      formValues: FormValues,
      isLeverage: boolean,
      llamma: Llamma,
      maxSlippage: string,
    ) => {
      const notifyMessage = t`Please confirm deposit of ${formValues.collateral} ${llamma.collateralSymbol}`
      const notification = notify(notifyMessage, 'pending')
      const resp = await fetchStepCreate(payloadActiveKey, curve, isLeverage, llamma, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const TxDescription = <Trans>Transaction complete.</Trans>
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(network, resp.hash)} />)
      }
      notification?.dismiss()
    },
    [activeKey, fetchStepCreate, network],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: LlamaApi,
      isLeverage: boolean,
      llamma: Llamma,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: CreateFormStatus,
      formValues: FormValues,
      maxSlippage: string,
      steps: Step[],
    ) => {
      const { collateral, collateralError, debt, debtError, n } = formValues
      const { isApproved, isComplete, isInProgress, error, warning, step } = formStatus
      const haveCollateral = +collateral > 0
      const haveDebt = +debt > 0
      const isValidCollateral = haveCollateral && !collateralError
      const isValidDebt = haveDebt && !debtError
      const isValid =
        !!curve.signerAddress && !formEstGas.loading && isValidCollateral && isValidDebt && !warning && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${llamma.collateralSymbol}.`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, isLeverage, llamma, formValues, maxSlippage)
            notification?.dismiss()
          },
        },
        CREATE: {
          key: 'CREATE',
          status: getStepStatus(isComplete, step === 'CREATE', isValid && !!n && isApproved),
          type: 'action',
          content: isComplete ? t`Loan Created` : t`Create Loan`,
          ...(healthMode.message || isLeverage
            ? {
                modal: {
                  title: t`Warning!`,
                  content: isLeverage ? (
                    <DialogHealthLeverageWarning
                      {...healthMode}
                      confirmed={confirmedHealthWarning}
                      setConfirmed={(val) => setConfirmHealthWarning(val)}
                    />
                  ) : (
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
                    onClick: () =>
                      handleClickCreate(payloadActiveKey, curve, formValues, isLeverage, llamma, maxSlippage),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Create anyway',
                },
              }
            : {
                onClick: async () =>
                  handleClickCreate(payloadActiveKey, curve, formValues, isLeverage, llamma, maxSlippage),
              }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['CREATE'] : ['APPROVAL', 'CREATE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleClickCreate, healthMode],
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
    if (curve && market) {
      const updatedSteps = getSteps(
        activeKey,
        curve,
        isLeverage,
        market,
        confirmedHealthWarning,
        formEstGas,
        formStatus,
        formValues,
        maxSlippage,
        steps,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    confirmedHealthWarning,
    healthMode?.message,
    market?.id,
    haveSigner,
    formEstGas.loading,
    formStatus,
    formValues,
    maxSlippage,
  ])

  const disabled = !isReady || (formStatus.isInProgress && !formStatus.error)

  useEffect(() => {
    updateFormValues(formValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haveSigner])

  return (
    <>
      {/* field collateral */}
      <Box grid gridRowGap={1}>
        <LargeTokenInput
          name="collateral"
          isError={!!formValues.collateralError}
          {...(formValues.collateralError && {
            message: t`Amount is greater than ${formatNumber(userWalletBalances.collateral)}`,
          })}
          disabled={disabled}
          walletBalance={{
            loading: haveSigner && userWalletBalancesLoading,
            balance: decimal(userWalletBalances.collateral),
            symbol: market?.collateralSymbol,
            usdRate: collateralUsdRate,
          }}
          balance={decimal(formValues.collateral)}
          tokenSelector={
            <TokenLabel
              blockchainId={network.id}
              tooltip={market?.collateralSymbol}
              address={collateralAddress}
              label={market?.collateralSymbol ?? '?'}
            />
          }
          onBalance={onCollateralChanged}
        />
      </Box>

      {/* field debt */}
      <Box grid gridRowGap={1}>
        <LargeTokenInput
          name="debt"
          isError={!!formValues.debtError}
          message={formValues.debtError === 'too-much' ? t`Amount is greater than ${formatNumber(maxRecv)}` : undefined}
          disabled={disabled}
          walletBalance={{
            loading: !maxRecv,
            balance: decimal(maxRecv),
            symbol: market ? getTokenName(market).stablecoin : undefined,
            usdRate: stablecoinUsdRate,
            buttonTestId: 'debtMax',
          }}
          label={t`Borrow amount:`}
          balance={decimal(formValues.debt)}
          tokenSelector={
            <TokenLabel
              blockchainId={network.id}
              tooltip={market ? getTokenName(market).stablecoin : undefined}
              address={stablecoinAddress}
              label={market ? getTokenName(market).stablecoin : '?'}
            />
          }
          onBalance={onDebtChanged}
        />
      </Box>

      {/* detail info */}
      <DetailInfo
        activeKey={activeKey}
        activeKeyLiqRange={activeKeyLiqRange}
        curve={curve}
        chainId={rChainId}
        formEstGas={formEstGas}
        formValues={formValues}
        haveSigner={haveSigner}
        healthMode={healthMode}
        isAdvanceMode={isAdvancedMode}
        isLeverage={isLeverage}
        isReady={isReady}
        llamma={market}
        steps={steps}
        setHealthMode={setHealthMode}
        updateFormValues={updateFormValues}
      />

      {isLeverage && (
        <AlertBox alertType="info">
          <Box grid gridRowGap={2}>
            <p>{t`You can leverage your collateral up to 9x. This has the effect of repeat trading crvUSD to collateral and depositing to maximize your collateral position. Essentially, all borrowed crvUSD is utilized to purchase more collateral.`}</p>
            <p>{t`Be careful, if the collateral price dips, you would need to repay the entire amount to reclaim your initial position.`}</p>
            {!hasDeleverage(market) && (
              <p>{t`WARNING: The corresponding deleverage button is also not yet available.`}</p>
            )}
          </Box>
        </AlertBox>
      )}

      {collateralAlert?.isDeprecated && <AlertBox {...collateralAlert}>{collateralAlert.message}</AlertBox>}

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {formStatus.warning === 'warning-loan-exists' && market ? (
          <AlertBox alertType="info">{t`Transaction complete`}</AlertBox>
        ) : healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        ) : null}

        {txInfoBar}
        {steps && <Stepper steps={steps} />}
        {formStatus.isComplete && market && (
          <LinkButton variant="filled" size="large" href={getMintMarketPathname(params, market.id)}>
            Manage loan
          </LinkButton>
        )}
      </LoanFormConnect>

      {!isAdvancedMode && (
        <Accordion btnLabel={t`Loan Parameters`}>
          <MarketParameters chainId={rChainId} marketId={market?.id ?? ''} marketType="mint" action="borrow" />
        </Accordion>
      )}
    </>
  )
}
