import { isEqual, noop } from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConfig } from 'wagmi'
import { FormConnectWallet } from '@/dex/components/FormConnectWallet'
import { type HighSlippagePriceImpactProps, WarningModal } from '@/dex/components/PagePool/components/WarningModal'
import { RouterSwapAlerts } from '@/dex/components/PageRouterSwap/components/RouterSwapAlerts'
import { RoutesActionInfo } from '@/dex/components/PageRouterSwap/components/RoutesActionInfo'
import type {
  ExchangeRate,
  FormStatus,
  FormValues,
  RoutesAndOutput,
  SearchedParams,
  StepKey,
} from '@/dex/components/PageRouterSwap/types'
import { useNetworks } from '@/dex/entities/networks'
import { useRouterApi } from '@/dex/hooks/useRouterApi'
import { useTokensNameMapper } from '@/dex/hooks/useTokensNameMapper'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import { useStore } from '@/dex/store/useStore'
import { ChainId, CurveApi, type NetworkUrlParams, PoolDataMapper, TokensMapper } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { getSlippageImpact } from '@/dex/utils/utilsSwap'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, maybes } from '@primitives/objects.utils'
import type { RouterRouteResponse } from '@primitives/router.utils'
import { AlertBox } from '@ui/AlertBox'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { TokenList, TokenSelector, useTokenSelectorData } from '@ui-kit/features/select-token'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { ActionInfo, ActionInfoGasEstimate } from '@ui-kit/shared/ui/ActionInfo'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import { getPriceImpactDisplay } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { SlippageToleranceActionInfo, type SlippageType } from '@ui-kit/widgets/SlippageSettings'

const { Spacing } = SizesAndSpaces

const formatExchangeRate = ({ from, to, value }: ExchangeRate) =>
  ['1', from, '=', +value ? formatNumber(value, { abbreviate: true, highPrecision: true }) : '-', to].join(' ')

const getSlippageType = ({ isStableswapRoute }: RouterRouteResponse | RoutesAndOutput): SlippageType =>
  isStableswapRoute ? 'stable' : 'crypto'

export const QuickSwap = ({
  pageLoaded,
  params,
  rChainId: chainId,
  searchedParams,
  tokensMapper,
  tokensMapperStr,
  redirect,
  curve,
}: {
  pageLoaded: boolean
  params: NetworkUrlParams
  rChainId: ChainId
  searchedParams: SearchedParams
  tokensMapper: TokensMapper
  tokensMapperStr: string
  redirect: (toAddress: string, fromAddress: string) => void
  curve: CurveApi | null
}) => {
  const isSubscribedRef = useRef(false)
  const { signerAddress: userAddress } = curve ?? {}
  const { tokensNameMapper } = useTokensNameMapper(chainId)
  const poolDataMapper = useStore((state): PoolDataMapper | undefined => state.pools.poolsMapper[chainId])
  const activeKey = useStore(state => state.quickSwap.activeKey)
  const formEstGas = useStore(state => state.quickSwap.formEstGas[activeKey])
  const formStatus = useStore(state => state.quickSwap.formStatus)
  const formValues = useStore(state => state.quickSwap.formValues)
  const isPageVisible = useLayoutStore(state => state.isPageVisible)
  const rpcRoutesAndOutput = useStore(state => state.quickSwap.routesAndOutput[activeKey])
  const isMaxLoading = useStore(state => state.quickSwap.isMaxLoading)
  const fetchStepApprove = useStore(state => state.quickSwap.fetchStepApprove)
  const fetchStepSwap = useStore(state => state.quickSwap.fetchStepSwap)
  const resetFormErrors = useStore(state => state.quickSwap.resetFormErrors)
  const setFormValues = useStore(state => state.quickSwap.setFormValues)
  const { data: networks } = useNetworks()
  const network = (chainId && networks[chainId]) || null
  const {
    data: routerBlacklist,
    isLoading: routerBlacklistLoading,
    error: routerBlacklistError,
  } = usePoolsBlacklist({
    blockchainId: network?.id as Chain,
  })

  const { data: apiRoutes, isLoading: apiRoutesLoading } = useRouterApi(
    { chainId, userAddress, searchedParams },
    !userAddress,
  )
  const gas = useEstimateGas(networks, chainId, formEstGas?.estimatedGas, !!userAddress)

  const routesAndOutput = userAddress ? rpcRoutesAndOutput : apiRoutes
  const slippageType = routesAndOutput && getSlippageType(routesAndOutput)
  const storeSlippage = useUserProfileStore(state => state.maxSlippage)
  const maxSlippage = slippageType && storeSlippage[slippageType]
  const slippageImpact = maybes([routesAndOutput, maxSlippage], ([r, maxSlippage]) =>
    getSlippageImpact({ maxSlippage, ...r }),
  )

  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { fromAddress, toAddress } = searchedParams

  const [isOpenFromToken, openModalFromToken, closeModalFromToken] = useSwitch()
  const [isOpenToToken, openModalToToken, closeModalToToken] = useSwitch()

  const isReady = pageLoaded && isPageVisible

  useEffect(() => {
    if (curve && userAddress && routerBlacklist) curve.router.setBlacklist(routerBlacklist)
  }, [curve, routerBlacklist, userAddress])

  const tokens = useMemo(
    () =>
      Object.values(tokensMapper ?? {})
        .filter(token => !!token)
        .map(toTokenOption(network?.networkId)),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [tokensMapperStr, network?.networkId],
  )

  const fromToken = tokens.find(x => x.address.toLocaleLowerCase() == fromAddress)
  const toToken = tokens.find(x => x.address.toLocaleLowerCase() == toAddress)

  const {
    data: userFromBalance,
    isLoading: userFromBalanceLoading,
    isFetched: userFromBalanceFetched,
    refetch: refetchUserFromBalance,
  } = useTokenBalance(
    {
      chainId,
      userAddress,
      tokenAddress: fromAddress ? (fromAddress as Address) : undefined,
    },
    !!userAddress && !!fromAddress,
  )

  const {
    data: userToBalance,
    isLoading: userToBalanceLoading,
    isFetched: userToBalanceFetched,
    refetch: refetchUserToBalance,
  } = useTokenBalance(
    {
      chainId,
      userAddress,
      tokenAddress: toAddress ? (toAddress as Address) : undefined,
    },
    !!userAddress && !!toAddress,
  )

  const { data: fromUsdRate } = useTokenUsdRate({ chainId, tokenAddress: fromAddress }, !!fromAddress)
  const { data: toUsdRate } = useTokenUsdRate({ chainId, tokenAddress: toAddress }, !!toAddress)

  const {
    balances,
    tokenPrices,
    isLoading: tokenSelectorLoading,
  } = useTokenSelectorData(
    { chainId, userAddress, tokens },
    { enabled: !!isOpenFromToken || !!isOpenToToken, prefetch: userFromBalanceFetched && userToBalanceFetched },
  )

  const config = useConfig()
  const updateFormValues = useCallback(
    (updatedFormValues?: Partial<FormValues>, isGetMaxFrom?: boolean, isFullReset?: boolean, isRefetch?: boolean) => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setTxInfoBar(null)
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setConfirmedLoss(false)

      void setFormValues(
        config,
        pageLoaded && !routerBlacklistLoading ? curve : null,
        updatedFormValues ?? {},
        searchedParams,
        maxSlippage,
        isGetMaxFrom,
        isFullReset,
        isRefetch,
      )
    },
    [config, curve, routerBlacklistLoading, maxSlippage, pageLoaded, searchedParams, setFormValues],
  )

  const handleBtnClickSwap = useCallback(
    async (
      actionActiveKey: string,
      curve: CurveApi,
      formValues: FormValues,
      maxSlippage: Decimal,
      isExpectedToAmount: boolean,
      toAmountOutput: string,
      searchedParams: SearchedParams,
      toSymbol: string,
      fromSymbol: string,
    ) => {
      const { fromAmount, toAmount } = formValues

      const notifyMessage = t`swap ${fromAmount} ${fromSymbol} for ${
        isExpectedToAmount ? toAmountOutput : toAmount
      } ${toSymbol} at max slippage ${maxSlippage}%.`
      const { dismiss } = notify(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepSwap(actionActiveKey, config, curve, formValues, searchedParams, maxSlippage)

      if (isSubscribedRef.current && resp?.hash && resp.activeKey === activeKey && !resp.error && network) {
        void refetchUserFromBalance()
        void refetchUserToBalance()
        const txMessage = t`Transaction complete. Received ${resp.swappedAmount} ${toSymbol}.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(network, resp.hash)}
            onClose={() => updateFormValues({}, false, true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepSwap, config, activeKey, network, refetchUserFromBalance, refetchUserToBalance, updateFormValues],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      routesAndOutput: RoutesAndOutput | undefined,
      formStatus: FormStatus,
      formValues: FormValues,
      searchedParams: SearchedParams,
      toSymbol: string,
      fromSymbol: string,
    ) => {
      const { formProcessing, formTypeCompleted, step } = formStatus
      const { fromAmount } = formValues

      const isValidFromAmount = +fromAmount > 0 && !formValues.fromError
      const isValid = !!routesAndOutput && !routesAndOutput.loading && !formStatus.error && isValidFromAmount
      const isApproved = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formStatus.formTypeCompleted === 'SWAP'

      const stepsObj: Record<string, Step> = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid && !formProcessing),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${fromSymbol}.`
            const { dismiss } = notify(notifyMessage, 'pending')
            const slippage = assert(maxSlippage, `Max slippage must be set once we a route is found`)
            await fetchStepApprove(activeKey, config, curve, formValues, searchedParams, slippage)
            if (typeof dismiss === 'function') dismiss()
          },
        },
        SWAP: {
          key: 'SWAP',
          status: getStepStatus(isComplete, step === 'SWAP', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Swap Complete` : t`Swap`,
          ...(routesAndOutput?.modal
            ? {
                modal: {
                  isDismissable: false,
                  title: t`Warning!`,
                  content: (
                    <WarningModal
                      {...({
                        ...routesAndOutput.modal,
                        confirmed: confirmedLoss,
                        setConfirmed: setConfirmedLoss,
                      } as HighSlippagePriceImpactProps)}
                    />
                  ),
                  cancelBtnProps: {
                    label: t`Cancel`,
                    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
                    onClick: () => setConfirmedLoss(false),
                  },
                  primaryBtnProps: {
                    onClick: () => {
                      if (routesAndOutput && maxSlippage) {
                        void handleBtnClickSwap(
                          activeKey,
                          curve,
                          formValues,
                          maxSlippage,
                          !!slippageImpact?.isExpectedToAmount,
                          routesAndOutput.toAmountOutput,
                          searchedParams,
                          toSymbol,
                          fromSymbol,
                        )
                      }
                    },
                    disabled: !confirmedLoss,
                  },
                  primaryBtnLabel: 'Swap anyway',
                },
              }
            : {
                onClick: () => {
                  if (routesAndOutput && maxSlippage) {
                    void handleBtnClickSwap(
                      activeKey,
                      curve,
                      formValues,
                      maxSlippage,
                      !!slippageImpact?.isExpectedToAmount,
                      routesAndOutput.toAmountOutput,
                      searchedParams,
                      toSymbol,
                      fromSymbol,
                    )
                  }
                },
              }),
        },
      }

      let stepsKey: StepKey[]

      if (formProcessing || formTypeCompleted) {
        stepsKey = steps.map(s => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['SWAP'] : ['APPROVAL', 'SWAP']
      }

      return stepsKey.map(key => stepsObj[key])
    },
    [
      config,
      confirmedLoss,
      fetchStepApprove,
      maxSlippage,
      handleBtnClickSwap,
      slippageImpact?.isExpectedToAmount,
      steps,
    ],
  )

  const lastFetchTimeRef = useRef<number>(0)
  const fetchDataRef = useRef<() => void>(noop)

  // Keep fetchDataRef always pointing to the latest fetchData logic
  fetchDataRef.current = () => {
    if (isReady && !formStatus.formProcessing && formStatus.formTypeCompleted !== 'SWAP') {
      updateFormValues({}, false, false, true)
    }
  }

  // Direct fetch for user-initiated actions (token changes, input changes)
  // Also resets timer to prevent redundant background fetch right after
  const fetchData = useCallback(() => {
    lastFetchTimeRef.current = Date.now()
    fetchDataRef.current()
  }, [])

  // Throttled fetch for background refreshes (page visibility, interval)
  const throttledFetchData = useCallback(() => {
    const now = Date.now()
    if (now - lastFetchTimeRef.current >= REFRESH_INTERVAL['15s']) {
      lastFetchTimeRef.current = now
      fetchDataRef.current()
    }
  }, [])

  // onMount
  useEffect(() => {
    isSubscribedRef.current = true

    return () => {
      isSubscribedRef.current = false
      updateFormValues()
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [])

  // maxSlippage
  useEffect(() => {
    if (isReady && maxSlippage) updateFormValues()
    // Intentionally depend on `storeSlippage`, not `maxSlippage` which changes when route metadata resolves - that can trigger a slippage/activeKey refresh loop.
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [storeSlippage, isReady, updateFormValues])

  // pageVisible re-fetch data
  useEffect(() => {
    if (isReady) throttledFetchData()
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [isPageVisible])

  // network switched
  useEffect(() => {
    updateFormValues({ isFrom: true, fromAmount: '', toAmount: '' })
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [curve?.chainId])

  // updateForm - immediate fetch on token changes
  useEffect(() => fetchData(), [tokensMapperStr, searchedParams.fromAddress, searchedParams.toAddress, fetchData])

  // re-fetch data
  usePageVisibleInterval(throttledFetchData, REFRESH_INTERVAL['15s'])

  // steps
  useEffect(() => {
    if (!curve?.signerAddress) return
    const updatedSteps = getSteps(
      activeKey,
      curve,
      routesAndOutput,
      isReady ? formStatus : { ...formStatus, formProcessing: true },
      formValues,
      searchedParams,
      toToken?.symbol ?? toToken?.address ?? '',
      fromToken?.symbol ?? fromToken?.address ?? '',
    )
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setSteps(prev => (isEqual(prev, updatedSteps) ? prev : updatedSteps))
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [isReady, confirmedLoss, routesAndOutput, formEstGas, formStatus, formValues, searchedParams, curve])

  const isDisable = formStatus.formProcessing
  const routesAndOutputLoading =
    !pageLoaded ||
    (userAddress
      ? routerBlacklistLoading || _isRoutesAndOutputLoading(rpcRoutesAndOutput, formValues, formStatus)
      : apiRoutesLoading)

  const setFromAmount = useCallback(
    (fromAmount?: Decimal) => updateFormValues({ isFrom: true, fromAmount: fromAmount ?? '', toAmount: '' }),
    [updateFormValues],
  )
  const setToAmount = useCallback(
    (toAmount?: Decimal) => updateFormValues({ isFrom: false, toAmount: toAmount ?? '', fromAmount: '' }),
    [updateFormValues],
  )
  const { label: priceImpactLabel, color: priceImpactColor } = getPriceImpactDisplay(
    {
      data: decimal(routesAndOutput?.priceImpact),
      error: null,
      isLoading: routesAndOutputLoading,
    },
    { slippage: maxSlippage, slippageType },
  )

  return (
    <Stack sx={{ gap: Spacing.sm }}>
      {/* SWAP FROM */}
      <LargeTokenInput
        label={t`Sell`}
        balance={decimal(formValues.fromAmount)}
        onBalance={setFromAmount}
        name="fromAmount"
        inputBalanceUsd={decimal(formValues.fromAmount && fromUsdRate && fromUsdRate * +formValues.fromAmount)}
        walletBalance={{
          loading: userFromBalanceLoading || isMaxLoading,
          balance: decimal(userFromBalance),
          symbol: fromToken?.symbol,
          usdRate: fromUsdRate,
        }}
        maxBalance={{
          balance: decimal(userFromBalance),
          chips: 'range',
        }}
        isError={!!formValues.fromError}
        disabled={isDisable}
        testId="from-amount"
        tokenSelector={
          <TokenSelector
            selectedToken={fromToken}
            disabled={isDisable || !fromToken}
            isOpen={!!isOpenFromToken}
            onOpen={openModalFromToken}
            onClose={closeModalFromToken}
            size="small"
          >
            <TokenList
              tokens={tokens}
              balances={balances}
              tokenPrices={tokenPrices}
              isLoading={tokenSelectorLoading}
              onToken={({ address: fromAddress }) => {
                const toAddress =
                  fromAddress === searchedParams.toAddress ? searchedParams.fromAddress : searchedParams.toAddress
                resetFormErrors()
                redirect(toAddress, fromAddress)
              }}
            />
          </TokenSelector>
        }
        message={
          formValues.fromError &&
          userFromBalance != null &&
          t`Amount > wallet balance ${formatNumber(userFromBalance, { abbreviate: false })}`
        }
      />
      {/* SWAP ICON */}
      <IconButton
        disabled={isDisable}
        onClick={() => redirect(searchedParams.fromAddress, searchedParams.toAddress)}
        size="medium"
        testId="swap-tokens"
      >
        <Icon name="ArrowsVertical" size={24} />
      </IconButton>
      {/* SWAP TO */}
      <LargeTokenInput
        label={t`Buy`}
        balance={decimal(formValues.toAmount)}
        inputBalanceUsd={decimal(formValues.toAmount && toUsdRate && toUsdRate * +formValues.toAmount)}
        onBalance={setToAmount}
        name="toAmount"
        walletBalance={{
          loading: userToBalanceLoading,
          balance: decimal(userToBalance),
          symbol: toToken?.symbol,
          usdRate: toUsdRate,
        }}
        disabled={isDisable}
        testId="to-amount"
        tokenSelector={
          <TokenSelector
            selectedToken={toToken}
            disabled={isDisable || !toToken}
            isOpen={!!isOpenToToken}
            onOpen={openModalToToken}
            onClose={closeModalToToken}
            size="small"
          >
            <TokenList
              tokens={tokens}
              balances={balances}
              tokenPrices={tokenPrices}
              disableMyTokens
              onToken={({ address: toAddress }) => {
                const fromAddress =
                  toAddress === searchedParams.fromAddress ? searchedParams.toAddress : searchedParams.fromAddress
                resetFormErrors()
                redirect(toAddress, fromAddress)
              }}
            />
          </TokenSelector>
        }
      />
      {/* detail info */}
      <Stack sx={{ gap: Spacing.xs }}>
        <Stack>
          <SlippageToleranceActionInfo
            maxSlippage={maxSlippage}
            type={['stable', 'crypto']}
            active={slippageType}
            size="small"
          />
          <ActionInfo
            label={priceImpactLabel}
            value={
              routesAndOutput?.priceImpact == null ? '-' : formatNumber(routesAndOutput.priceImpact, 'percent.rate')
            }
            valueColor={priceImpactColor}
            loading={routesAndOutputLoading}
            size="small"
            testId="price-impact"
          />
          <ActionInfo
            label={t`Exchange rate`}
            value={routesAndOutput?.exchangeRate && formatExchangeRate(routesAndOutput.exchangeRate)}
            loading={routesAndOutputLoading}
            size="small"
            testId="exchange-rate"
          />
          <RoutesActionInfo
            params={params}
            loading={routesAndOutputLoading}
            routes={routesAndOutput?.routes}
            tokensNameMapper={tokensNameMapper}
            poolDataMapper={poolDataMapper}
            swapCustomRouteRedirect={network?.swapCustomRouteRedirect}
          />
        </Stack>
        {userAddress && <ActionInfoGasEstimate gas={q(gas)} isApproved={formStatus.isApproved} />}
      </Stack>
      {/* alerts */}
      <RouterSwapAlerts
        formStatus={
          userAddress && routerBlacklistError && !formStatus.error
            ? { ...formStatus, error: routerBlacklistError.message }
            : formStatus
        }
        formValues={formValues}
        maxSlippage={maxSlippage}
        isHighImpact={slippageImpact?.isHighImpact}
        isExpectedToAmount={slippageImpact?.isExpectedToAmount}
        toAmountOutput={routesAndOutput?.toAmountOutput}
        isExchangeRateLow={routesAndOutput?.isExchangeRateLow}
        searchedParams={searchedParams}
        onClose={() => updateFormValues()}
      />
      {/* actions */}
      <FormConnectWallet loading={!!userAddress && !steps.length}>
        {txInfoBar}
        <Stepper steps={steps} testId="swap" />
      </FormConnectWallet>
    </Stack>
  )
}

function _isRoutesAndOutputLoading(
  routesAndOutput: RoutesAndOutput | undefined,
  { isFrom, fromAmount, toAmount }: FormValues,
  { error }: FormStatus,
) {
  if (typeof routesAndOutput !== 'undefined') {
    return routesAndOutput.loading
  }
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
  return !error && ((isFrom && +fromAmount > 0) || (!isFrom && +toAmount > 0))
}
