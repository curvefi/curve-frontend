import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useConfig } from 'wagmi'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { FormConnectWallet } from '@/dex/components/FormConnectWallet'
import { type HighSlippagePriceImpactProps, WarningModal } from '@/dex/components/PagePool/components/WarningModal'
import { DetailInfoExchangeRate } from '@/dex/components/PageRouterSwap/components/DetailInfoExchangeRate'
import { DetailInfoPriceImpact } from '@/dex/components/PageRouterSwap/components/DetailInfoPriceImpact'
import { RouterSwapAlerts } from '@/dex/components/PageRouterSwap/components/RouterSwapAlerts'
import type {
  FormStatus,
  FormValues,
  RoutesAndOutput,
  SearchedParams,
  StepKey,
} from '@/dex/components/PageRouterSwap/types'
import { useNetworks } from '@/dex/entities/networks'
import { useRouterApi } from '@/dex/hooks/useRouterApi'
import { useTokensNameMapper } from '@/dex/hooks/useTokensNameMapper'
import { useStore } from '@/dex/store/useStore'
import { ChainId, CurveApi, type NetworkUrlParams, TokensMapper } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { getSlippageImpact } from '@/dex/utils/utilsSwap'
import Stack from '@mui/material/Stack'
import { AlertBox } from '@ui/AlertBox'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { TokenList, TokenSelector, useTokenSelectorData } from '@ui-kit/features/select-token'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'
import { DetailInfoTradeRoute } from './components/DetailInfoTradeRoute'

const { Spacing } = SizesAndSpaces

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
  const isSubscribed = useRef(false)
  const { signerAddress } = curve ?? {}
  const { tokensNameMapper } = useTokensNameMapper(chainId)
  const activeKey = useStore((state) => state.quickSwap.activeKey)
  const formEstGas = useStore((state) => state.quickSwap.formEstGas[activeKey])
  const formStatus = useStore((state) => state.quickSwap.formStatus)
  const formValues = useStore((state) => state.quickSwap.formValues)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const rpcRoutesAndOutput = useStore((state) => state.quickSwap.routesAndOutput[activeKey])
  const isMaxLoading = useStore((state) => state.quickSwap.isMaxLoading)
  const fetchStepApprove = useStore((state) => state.quickSwap.fetchStepApprove)
  const fetchStepSwap = useStore((state) => state.quickSwap.fetchStepSwap)
  const resetFormErrors = useStore((state) => state.quickSwap.resetFormErrors)
  const setFormValues = useStore((state) => state.quickSwap.setFormValues)
  const { data: networks } = useNetworks()
  const network = (chainId && networks[chainId]) || null

  const haveSigner = !!signerAddress
  const cryptoMaxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  const stableMaxSlippage = useUserProfileStore((state) => state.maxSlippage.stable)
  const { data: apiRoutes, isLoading: apiRoutesLoading } = useRouterApi({ chainId, searchedParams }, !haveSigner)

  const routesAndOutput = haveSigner ? rpcRoutesAndOutput : apiRoutes
  const isStableswapRoute = routesAndOutput?.isStableswapRoute
  const storeMaxSlippage = isStableswapRoute ? stableMaxSlippage : cryptoMaxSlippage
  const slippageImpact = routesAndOutput
    ? getSlippageImpact({ maxSlippage: storeMaxSlippage, ...routesAndOutput })
    : null

  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { fromAddress, toAddress } = searchedParams

  const [isOpenFromToken, openModalFromToken, closeModalFromToken] = useSwitch()
  const [isOpenToToken, openModalToToken, closeModalToToken] = useSwitch()

  const isReady = pageLoaded && isPageVisible

  const tokens = useMemo(
    () =>
      Object.values(tokensMapper ?? {})
        .filter((token) => !!token)
        .map(toTokenOption(network?.networkId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensMapperStr, network?.networkId],
  )

  const fromToken = tokens.find((x) => x.address.toLocaleLowerCase() == fromAddress)
  const toToken = tokens.find((x) => x.address.toLocaleLowerCase() == toAddress)

  const { data: userFromBalance, isLoading: userFromBalanceLoading } = useTokenBalance(
    {
      chainId,
      userAddress: signerAddress,
      tokenAddress: fromAddress ? (fromAddress as Address) : undefined,
    },
    !!signerAddress && !!fromAddress,
  )

  const { data: userToBalance, isLoading: userToBalanceLoading } = useTokenBalance(
    {
      chainId,
      userAddress: signerAddress,
      tokenAddress: toAddress ? (toAddress as Address) : undefined,
    },
    !!signerAddress && !!toAddress,
  )

  const { data: fromUsdRate } = useTokenUsdRate({ chainId, tokenAddress: fromAddress }, !!fromAddress)
  const { data: toUsdRate } = useTokenUsdRate({ chainId, tokenAddress: toAddress }, !!toAddress)

  const { balances, tokenPrices } = useTokenSelectorData(
    { chainId, userAddress: signerAddress, tokens },
    !!isOpenFromToken || !!isOpenToToken,
  )

  const config = useConfig()
  const updateFormValues = useCallback(
    (
      updatedFormValues: Partial<FormValues>,
      isGetMaxFrom?: boolean,
      maxSlippage?: string,
      isFullReset?: boolean,
      isRefetch?: boolean,
    ) => {
      setTxInfoBar(null)
      setConfirmedLoss(false)

      void setFormValues(
        config,
        pageLoaded ? curve : null,
        updatedFormValues,
        searchedParams,
        maxSlippage || storeMaxSlippage,
        isGetMaxFrom,
        isFullReset,
        isRefetch,
      )
    },
    [config, curve, storeMaxSlippage, pageLoaded, searchedParams, setFormValues],
  )

  const handleBtnClickSwap = useCallback(
    async (
      actionActiveKey: string,
      curve: CurveApi,
      formValues: FormValues,
      maxSlippage: string,
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

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error && network) {
        const txMessage = t`Transaction complete. Received ${resp.swappedAmount} ${toSymbol}.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(network, resp.hash)}
            onClose={() => updateFormValues({}, false, '', true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (typeof dismiss === 'function') dismiss()
    },
    [activeKey, config, fetchStepSwap, updateFormValues, network],
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
      const isValid =
        typeof routesAndOutput !== 'undefined' && !routesAndOutput.loading && !formStatus.error && isValidFromAmount
      const isApproved = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formStatus.formTypeCompleted === 'SWAP'

      const stepsObj: { [k: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid && !formProcessing),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${fromSymbol}.`
            const { dismiss } = notify(notifyMessage, 'pending')
            await fetchStepApprove(activeKey, config, curve, formValues, searchedParams, storeMaxSlippage)
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
                    onClick: () => setConfirmedLoss(false),
                  },
                  primaryBtnProps: {
                    onClick: () => {
                      if (typeof routesAndOutput !== 'undefined') {
                        void handleBtnClickSwap(
                          activeKey,
                          curve,
                          formValues,
                          storeMaxSlippage,
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
                  if (typeof routesAndOutput !== 'undefined') {
                    void handleBtnClickSwap(
                      activeKey,
                      curve,
                      formValues,
                      storeMaxSlippage,
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
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['SWAP'] : ['APPROVAL', 'SWAP']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [
      config,
      confirmedLoss,
      fetchStepApprove,
      storeMaxSlippage,
      handleBtnClickSwap,
      slippageImpact?.isExpectedToAmount,
      steps,
    ],
  )

  const lastFetchTimeRef = useRef<number>(0)
  const fetchDataRef = useRef<() => void>(() => {})

  // Keep fetchDataRef always pointing to the latest fetchData logic
  fetchDataRef.current = () => {
    if (isReady && !formStatus.formProcessing && formStatus.formTypeCompleted !== 'SWAP') {
      updateFormValues({}, false, '', false, true)
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
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      updateFormValues({}, false, '', true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // maxSlippage
  useEffect(() => {
    if (isReady) updateFormValues({}, false, cryptoMaxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoMaxSlippage])

  // pageVisible re-fetch data
  useEffect(() => {
    if (isReady) throttledFetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  // network switched
  useEffect(() => {
    updateFormValues({ isFrom: true, fromAmount: '', toAmount: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setSteps((prev) => (lodash.isEqual(prev, updatedSteps) ? prev : updatedSteps))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, confirmedLoss, routesAndOutput, formEstGas, formStatus, formValues, searchedParams])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const isDisable = formStatus.formProcessing
  const routesAndOutputLoading =
    !pageLoaded ||
    (haveSigner ? _isRoutesAndOutputLoading(rpcRoutesAndOutput, formValues, formStatus) : apiRoutesLoading)

  const setFromAmount = useCallback(
    (fromAmount?: Decimal) => updateFormValues({ isFrom: true, fromAmount: fromAmount ?? '', toAmount: '' }),
    [updateFormValues],
  )
  const setToAmount = useCallback(
    (toAmount?: Decimal) => updateFormValues({ isFrom: false, toAmount: toAmount ?? '', fromAmount: '' }),
    [updateFormValues],
  )

  return (
    <Stack gap={Spacing.sm}>
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
          >
            <TokenList
              tokens={tokens}
              balances={balances}
              tokenPrices={tokenPrices}
              onToken={({ address: fromAddress }) => {
                const toAddress =
                  fromAddress === searchedParams.toAddress ? searchedParams.fromAddress : searchedParams.toAddress
                resetFormErrors()
                redirect(toAddress, fromAddress)
              }}
            />
          </TokenSelector>
        }
        message={formValues.fromError && t`Amount > wallet balance ${formatNumber(userFromBalance)}`}
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
      <Stack>
        <DetailInfoExchangeRate loading={routesAndOutputLoading} exchangeRates={routesAndOutput?.exchangeRates} />
        <DetailInfoPriceImpact
          loading={routesAndOutputLoading}
          priceImpact={routesAndOutput?.priceImpact}
          isHighImpact={slippageImpact?.isHighImpact}
        />
        <DetailInfoTradeRoute
          params={params}
          loading={routesAndOutputLoading}
          routes={routesAndOutput?.routes}
          tokensNameMapper={tokensNameMapper}
        />

        {haveSigner && (
          <DetailInfoEstGas
            chainId={chainId}
            {...formEstGas}
            loading={typeof formEstGas === 'undefined' && routesAndOutputLoading}
            isDivider
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <SlippageToleranceActionInfo
          maxSlippage={storeMaxSlippage}
          stateKey={isStableswapRoute ? 'stable' : 'crypto'}
        />
      </Stack>

      {/* alerts */}
      <RouterSwapAlerts
        formStatus={formStatus}
        formValues={formValues}
        maxSlippage={storeMaxSlippage}
        isHighImpact={slippageImpact?.isHighImpact}
        isExpectedToAmount={slippageImpact?.isExpectedToAmount}
        toAmountOutput={routesAndOutput?.toAmountOutput}
        isExchangeRateLow={routesAndOutput?.isExchangeRateLow}
        searchedParams={searchedParams}
        updateFormValues={updateFormValues}
      />

      {/* actions */}
      <FormConnectWallet loading={haveSigner && !steps.length}>
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
  return !error && ((isFrom && +fromAmount > 0) || (!isFrom && +toAmount > 0))
}
