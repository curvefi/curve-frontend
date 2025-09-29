import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ethAddress } from 'viem'
import ChipInpHelper from '@/dex/components/ChipInpHelper'
import DetailInfoEstGas from '@/dex/components/DetailInfoEstGas'
import FieldHelperUsdRate from '@/dex/components/FieldHelperUsdRate'
import FormConnectWallet from '@/dex/components/FormConnectWallet'
import DetailInfoSlippageTolerance from '@/dex/components/PagePool/components/DetailInfoSlippageTolerance'
import WarningModal from '@/dex/components/PagePool/components/WarningModal'
import DetailInfoExchangeRate from '@/dex/components/PageRouterSwap/components/DetailInfoExchangeRate'
import DetailInfoPriceImpact from '@/dex/components/PageRouterSwap/components/DetailInfoPriceImpact'
import DetailInfoTradeRoute from '@/dex/components/PageRouterSwap/components/DetailInfoTradeRoute'
import RouterSwapAlerts from '@/dex/components/PageRouterSwap/components/RouterSwapAlerts'
import type {
  FormStatus,
  FormValues,
  RoutesAndOutput,
  SearchedParams,
  StepKey,
} from '@/dex/components/PageRouterSwap/types'
import useTokensNameMapper from '@/dex/hooks/useTokensNameMapper'
import useStore from '@/dex/store/useStore'
import { ChainId, CurveApi, type NetworkUrlParams, TokensMapper } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { getSlippageImpact } from '@/dex/utils/utilsSwap'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import Stepper from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { LargeSxProps, TokenSelector } from '@ui-kit/features/select-token'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useTokenUsdRate, useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { ReleaseChannel, decimal, type Decimal } from '@ui-kit/utils'

const QuickSwap = ({
  pageLoaded,
  params,
  rChainId,
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
  const { chainId, signerAddress } = curve ?? {}
  const { tokensNameMapper } = useTokensNameMapper(rChainId)
  const tokenList = useStore((state) => state.quickSwap.tokenList[rChainId])
  const activeKey = useStore((state) => state.quickSwap.activeKey)
  const formEstGas = useStore((state) => state.quickSwap.formEstGas[activeKey])
  const formStatus = useStore((state) => state.quickSwap.formStatus)
  const formValues = useStore((state) => state.quickSwap.formValues)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const routesAndOutput = useStore((state) => state.quickSwap.routesAndOutput[activeKey])
  const isMaxLoading = useStore((state) => state.quickSwap.isMaxLoading)
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const userBalancesLoading = useStore((state) => state.userBalances.loading)
  const fetchStepApprove = useStore((state) => state.quickSwap.fetchStepApprove)
  const fetchStepSwap = useStore((state) => state.quickSwap.fetchStepSwap)
  const resetFormErrors = useStore((state) => state.quickSwap.resetFormErrors)
  const setFormValues = useStore((state) => state.quickSwap.setFormValues)
  const updateTokenList = useStore((state) => state.quickSwap.updateTokenList)
  const network = useStore((state) => (chainId ? state.networks.networks[chainId] : null))

  const cryptoMaxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  const stableMaxSlippage = useUserProfileStore((state) => state.maxSlippage.stable)
  const isStableswapRoute = routesAndOutput?.isStableswapRoute
  const storeMaxSlippage = isStableswapRoute ? stableMaxSlippage : cryptoMaxSlippage
  const slippageImpact = routesAndOutput
    ? getSlippageImpact({ maxSlippage: storeMaxSlippage, ...routesAndOutput })
    : null

  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { fromAddress, toAddress } = searchedParams

  const isReady = pageLoaded && isPageVisible
  const haveSigner = !!signerAddress

  const userFromBalance = userBalancesMapper[fromAddress]
  const userToBalance = userBalancesMapper[toAddress]

  const { data: fromUsdRate } = useTokenUsdRate({ chainId, tokenAddress: fromAddress }, !!fromAddress)
  const { data: toUsdRate } = useTokenUsdRate({ chainId, tokenAddress: toAddress }, !!toAddress)

  const userTokens = Object.entries(userBalancesMapper)
    .filter(([, balance]) => parseFloat(balance ?? '0') > 0)
    .map(([address]) => address)
  const { data: usdRatesMapper } = useTokenUsdRates({ chainId, tokenAddresses: userTokens })

  const tokens = useMemo(() => {
    if (lodash.isEmpty(tokenList) || lodash.isEmpty(tokensMapper)) return []

    return tokenList!
      .map((address) => tokensMapper[address])
      .filter((token) => !!token)
      .map(toTokenOption(network?.networkId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenList, tokensMapperStr, network?.networkId])

  const fromToken = tokens.find((x) => x.address.toLocaleLowerCase() == fromAddress)
  const toToken = tokens.find((x) => x.address.toLocaleLowerCase() == toAddress)

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
        pageLoaded ? curve : null,
        updatedFormValues,
        searchedParams,
        maxSlippage || storeMaxSlippage,
        isGetMaxFrom,
        isFullReset,
        isRefetch,
      )
    },
    [curve, storeMaxSlippage, pageLoaded, searchedParams, setFormValues],
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

      const resp = await fetchStepSwap(actionActiveKey, curve, formValues, searchedParams, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error && network) {
        const txMessage = t`Transaction complete. Received ${resp.swappedAmount} ${toSymbol}.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={network.scanTxPath(resp.hash)}
            onClose={() => updateFormValues({}, false, '', true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (typeof dismiss === 'function') dismiss()
    },
    [activeKey, fetchStepSwap, updateFormValues, network],
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
            await fetchStepApprove(activeKey, curve, formValues, searchedParams, storeMaxSlippage)
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
                    // TODO: fix typescript error
                    // @ts-ignore
                    <WarningModal
                      {...routesAndOutput.modal}
                      confirmed={confirmedLoss}
                      setConfirmed={setConfirmedLoss}
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
    [confirmedLoss, fetchStepApprove, storeMaxSlippage, handleBtnClickSwap, slippageImpact?.isExpectedToAmount, steps],
  )

  const fetchData = useCallback(() => {
    if (isReady && !formStatus.formProcessing && formStatus.formTypeCompleted !== 'SWAP') {
      updateFormValues({}, false, '', false, true)
    }
  }, [formStatus.formProcessing, formStatus.formTypeCompleted, isReady, updateFormValues])

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
    if (isReady) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  // network switched
  useEffect(() => {
    updateFormValues({ isFrom: true, fromAmount: '', toAmount: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId])

  // updateForm
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchData(), [tokensMapperStr, searchedParams.fromAddress, searchedParams.toAddress])

  useEffect(() => {
    void updateTokenList(isReady ? curve : null, tokensMapper)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, tokensMapperStr, curve?.signerAddress])

  // re-fetch data
  usePageVisibleInterval(fetchData, REFRESH_INTERVAL['15s'], isPageVisible)

  // steps
  useEffect(() => {
    if (!curve) return
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
    setSteps(updatedSteps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, confirmedLoss, routesAndOutput, formEstGas, formStatus, formValues, searchedParams, userBalancesLoading])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const isDisable = formStatus.formProcessing
  const routesAndOutputLoading = !pageLoaded || _isRoutesAndOutputLoading(routesAndOutput, formValues, formStatus)
  const [releaseChannel] = useReleaseChannel()

  const setFromAmount = useCallback(
    (fromAmount?: Decimal) => updateFormValues({ isFrom: true, fromAmount: fromAmount ?? '', toAmount: '' }),
    [updateFormValues],
  )
  const setToAmount = useCallback(
    (toAmount?: Decimal) => updateFormValues({ isFrom: false, toAmount: toAmount ?? '', fromAmount: '' }),
    [updateFormValues],
  )

  return (
    <>
      {/* inputs */}
      <Box grid gridRowGap="narrow" margin="var(--spacing-3) 0 var(--spacing-3) 0">
        <div>
          {releaseChannel !== ReleaseChannel.Beta ? (
            <Box grid gridGap={1}>
              <InputProvider
                id="fromAmount"
                grid
                gridTemplateColumns="1fr auto 38%"
                inputVariant={formValues.fromError ? 'error' : undefined}
                disabled={isDisable}
              >
                <InputDebounced
                  id="inpFromAmount"
                  type="number"
                  labelProps={
                    haveSigner && {
                      label: t`Avail.`,
                      descriptionLoading: userBalancesLoading,
                      description: formatNumber(userFromBalance),
                    }
                  }
                  testId="from-amount"
                  value={isMaxLoading ? '' : formValues.fromAmount}
                  onChange={(fromAmount) => updateFormValues({ isFrom: true, fromAmount, toAmount: '' })}
                />
                <InputMaxBtn
                  loading={isMaxLoading}
                  disabled={isDisable}
                  isNetworkToken={searchedParams.fromAddress === ethAddress}
                  testId="max"
                  onClick={() => updateFormValues({ isFrom: true, toAmount: '' }, true)}
                />

                <TokenSelector
                  selectedToken={fromToken}
                  tokens={tokens}
                  balances={userBalancesMapper}
                  disabled={isDisable || !fromToken}
                  tokenPrices={usdRatesMapper}
                  onToken={(token) => {
                    const fromAddress = token.address
                    const toAddress =
                      fromAddress === searchedParams.toAddress ? searchedParams.fromAddress : searchedParams.toAddress
                    resetFormErrors()
                    redirect(toAddress, fromAddress)
                  }}
                />
              </InputProvider>
              <FieldHelperUsdRate amount={formValues.fromAmount} usdRate={fromUsdRate} />
              {formValues.fromError && (
                <ChipInpHelper size="xs" isDarkBg isError>
                  {t`Amount > wallet balance ${formatNumber(userFromBalance)}`}
                </ChipInpHelper>
              )}
            </Box>
          ) : (
            <LargeTokenInput
              dataType="decimal"
              onBalance={setFromAmount}
              name="fromAmount"
              maxBalance={{
                loading: userBalancesLoading || isMaxLoading,
                balance: decimal(userFromBalance),
                symbol: fromToken?.symbol || '',
                ...(fromUsdRate != null &&
                  userFromBalance != null && { notionalValueUsd: fromUsdRate * +userFromBalance }),
                ...(searchedParams.fromAddress === ethAddress && {
                  tooltip: t`'Balance minus estimated gas'`,
                }),
                showSlider: false,
              }}
              isError={!!formValues.fromError}
              disabled={isDisable}
              testId="from-amount"
              tokenSelector={
                <TokenSelector
                  sx={LargeSxProps}
                  selectedToken={fromToken}
                  tokens={tokens}
                  balances={userBalancesMapper}
                  disabled={isDisable || !fromToken}
                  tokenPrices={usdRatesMapper}
                  onToken={({ address: fromAddress }) => {
                    const toAddress =
                      fromAddress === searchedParams.toAddress ? searchedParams.fromAddress : searchedParams.toAddress
                    resetFormErrors()
                    redirect(toAddress, fromAddress)
                  }}
                />
              }
              message={
                formValues.fromError ? (
                  t`Amount > wallet balance ${formatNumber(userFromBalance)}`
                ) : (
                  <FieldHelperUsdRate amount={formValues.fromAmount} usdRate={fromUsdRate} />
                )
              }
            />
          )}

          {/* SWAP ICON */}
          <Box flex flexJustifyContent="center">
            <IconButton
              disabled={isDisable}
              onClick={() => redirect(searchedParams.fromAddress, searchedParams.toAddress)}
              size="medium"
              testId="swap-tokens"
            >
              <Icon name="ArrowsVertical" size={24} />
            </IconButton>
          </Box>
        </div>

        {/* SWAP TO */}
        {releaseChannel !== ReleaseChannel.Beta ? (
          <div>
            <InputProvider disabled={isDisable} grid gridTemplateColumns="1fr 38%" id="to">
              <InputDebounced
                id="inpTo"
                type="number"
                labelProps={
                  haveSigner && {
                    label: t`Avail.`,
                    descriptionLoading: userBalancesLoading,
                    description: formatNumber(userToBalance),
                  }
                }
                testId="to-amount"
                value={formValues.toAmount}
                onChange={(toAmount) => updateFormValues({ isFrom: false, toAmount, fromAmount: '' })}
              />
              <TokenSelector
                selectedToken={toToken}
                tokens={tokens}
                balances={userBalancesMapper}
                disabled={isDisable || !toToken}
                tokenPrices={usdRatesMapper}
                disableMyTokens={true}
                onToken={(token) => {
                  const toAddress = token.address
                  const fromAddress =
                    toAddress === searchedParams.fromAddress ? searchedParams.toAddress : searchedParams.fromAddress
                  resetFormErrors()
                  redirect(toAddress, fromAddress)
                }}
              />
            </InputProvider>
            <FieldHelperUsdRate amount={formValues.toAmount} usdRate={toUsdRate} />
          </div>
        ) : (
          <LargeTokenInput
            dataType="decimal"
            balance={decimal(formValues.toAmount)}
            onBalance={setToAmount}
            name="toAmount"
            {...(userToBalance != null && {
              label: `Avail. ${formatNumber(userToBalance)} ${toToken?.symbol || ''}`,
            })}
            message={<FieldHelperUsdRate amount={formValues.toAmount} usdRate={toUsdRate} />}
            disabled={isDisable}
            testId="to-amount"
            tokenSelector={
              <TokenSelector
                sx={LargeSxProps}
                selectedToken={toToken}
                tokens={tokens}
                balances={userBalancesMapper}
                disabled={isDisable || !toToken}
                tokenPrices={usdRatesMapper}
                disableMyTokens={true}
                onToken={({ address: toAddress }) => {
                  const fromAddress =
                    toAddress === searchedParams.fromAddress ? searchedParams.toAddress : searchedParams.fromAddress
                  resetFormErrors()
                  redirect(toAddress, fromAddress)
                }}
              />
            }
          />
        )}
      </Box>

      {/* detail info */}
      <div>
        <DetailInfoExchangeRate loading={routesAndOutputLoading} exchangeRates={routesAndOutput?.exchangeRates} />
        <DetailInfoPriceImpact
          loading={routesAndOutputLoading}
          priceImpact={routesAndOutput?.priceImpact}
          isHighImpact={slippageImpact?.isHighImpact ?? null}
        />
        <DetailInfoTradeRoute
          params={params}
          loading={routesAndOutputLoading}
          routes={routesAndOutput?.routes}
          tokensNameMapper={tokensNameMapper}
        />

        {haveSigner && (
          <DetailInfoEstGas
            chainId={rChainId}
            {...formEstGas}
            loading={typeof formEstGas === 'undefined' && routesAndOutputLoading}
            isDivider
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <DetailInfoSlippageTolerance
          maxSlippage={storeMaxSlippage}
          stateKey={isStableswapRoute ? 'stable' : 'crypto'}
        />
      </div>

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
      <FormConnectWallet loading={!steps.length}>
        {txInfoBar}
        <Stepper steps={steps} testId="swap" />
      </FormConnectWallet>
    </>
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

export default QuickSwap
