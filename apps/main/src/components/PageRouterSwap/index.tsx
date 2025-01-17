import type { FormStatus, RoutesAndOutput, StepKey } from '@/components/PageRouterSwap/types'
import type { FormValues, SearchedParams } from '@/components/PageRouterSwap/types'
import type { Params } from 'react-router'
import type { Step } from '@/ui/Stepper/types'
import { t } from '@lingui/macro'
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import { NETWORK_TOKEN } from '@/constants'
import { REFRESH_INTERVAL } from '@/constants'
import { formatNumber } from '@/ui/utils'
import { getActiveStep, getStepStatus } from '@/ui/Stepper/helpers'
import { getTokensMapperStr } from '@/store/createTokensSlice'
import { getTokensObjList } from '@/store/createQuickSwapSlice'
import { getChainSignerActiveKey } from '@/utils'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useSelectToList from '@/components/PageRouterSwap/components/useSelectToList'
import useStore from '@/store/useStore'
import useTokensNameMapper from '@/hooks/useTokensNameMapper'
import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import ChipInpHelper from '@/components/ChipInpHelper'
import IconButton from '@/ui/IconButton'
import DetailInfoEstGas from '@/components/DetailInfoEstGas'
import DetailInfoExchangeRate from '@/components/PageRouterSwap/components/DetailInfoExchangeRate'
import DetailInfoPriceImpact from '@/components/PageRouterSwap/components/DetailInfoPriceImpact'
import DetailInfoSlippageTolerance from '@/components/PagePool/components/DetailInfoSlippageTolerance'
import DetailInfoTradeRoute from '@/components/PageRouterSwap/components/DetailInfoTradeRoute'
import FieldHelperUsdRate from '@/components/FieldHelperUsdRate'
import Icon from '@/ui/Icon'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import FormConnectWallet from '@/components/FormConnectWallet'
import RouterSwapAlerts from '@/components/PageRouterSwap/components/RouterSwapAlerts'
import Stepper from '@/ui/Stepper'
import TokenComboBox from '@/components/ComboBoxSelectToken'
import TxInfoBar from '@/ui/TxInfoBar'
import WarningModal from '@/components/PagePool/components/WarningModal'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { CurveApi, ChainId, Token, TokensMapper } from '@/types/main.types'

const QuickSwap = ({
  pageLoaded,
  params,
  rChainId,
  searchedParams,
  tokensMapper,
  tokensMapperStr,
  redirect,
}: {
  pageLoaded: boolean
  params: Params
  rChainId: ChainId
  searchedParams: SearchedParams
  tokensMapper: TokensMapper
  tokensMapperStr: string
  redirect: (toAddress: string, fromAddress: string) => void
}) => {
  const isSubscribed = useRef(false)

  const curve = useStore((state) => state.curve)
  const { chainId, signerAddress } = curve ?? {}
  const { tokensNameMapper } = useTokensNameMapper(rChainId)
  const { selectToList, selectToListStr } = useSelectToList(rChainId)
  const chainSignerActiveKey = getChainSignerActiveKey(rChainId, signerAddress)
  const activeKey = useStore((state) => state.quickSwap.activeKey)
  const formEstGas = useStore((state) => state.quickSwap.formEstGas[activeKey])
  const formStatus = useStore((state) => state.quickSwap.formStatus)
  const formValues = useStore((state) => state.quickSwap.formValues)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const routesAndOutput = useStore((state) => state.quickSwap.routesAndOutput[activeKey])
  const isHideSmallPools = useStore((state) => state.poolList.formValues.hideSmallPools)
  const isMaxLoading = useStore((state) => state.quickSwap.isMaxLoading)
  const selectFromList = useStore((state) => state.quickSwap.selectFromList[chainSignerActiveKey])
  const tokensMapperNonSmallTvl = useStore((state) => state.tokens.tokensMapperNonSmallTvl[rChainId] ?? {})
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const userBalancesLoading = useStore((state) => state.userBalances.loading)
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)
  const volumesMapper = useStore((state) => state.pools.volumeMapper[rChainId])
  const fetchStepApprove = useStore((state) => state.quickSwap.fetchStepApprove)
  const fetchStepSwap = useStore((state) => state.quickSwap.fetchStepSwap)
  const resetFormErrors = useStore((state) => state.quickSwap.resetFormErrors)
  const setFormValues = useStore((state) => state.quickSwap.setFormValues)
  const setSelectFromList = useStore((state) => state.quickSwap.setSelectFromList)
  const setSelectToList = useStore((state) => state.quickSwap.setSelectToList)
  const network = useStore((state) => (chainId ? state.networks.networks[chainId] : null))

  const globalMaxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { fromAddress, toAddress } = searchedParams

  const isReady = pageLoaded && !isLoadingApi && isPageVisible
  const haveSigner = !!signerAddress
  const userFromBalance = userBalancesMapper[fromAddress]
  const userToBalance = userBalancesMapper[toAddress]
  const fromUsdRate = usdRatesMapper[fromAddress]
  const toUsdRate = usdRatesMapper[toAddress]
  const fromToken = tokensNameMapper[fromAddress] ?? ''
  const toToken = tokensNameMapper[toAddress] ?? ''

  const tokensMapperNonSmallTvlStr = useMemo(
    () => getTokensMapperStr(tokensMapperNonSmallTvl),
    [tokensMapperNonSmallTvl],
  )

  const selectFromTokensList = useMemo(
    () => getTokensObjList(selectFromList ?? selectToList, tokensMapper),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectFromList, selectToListStr, tokensMapperStr],
  )

  const selectToTokensList = useMemo(
    () => getTokensObjList(selectToList, tokensMapper),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectToListStr, tokensMapperStr],
  )

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

      setFormValues(
        pageLoaded && !isLoadingApi ? curve : null,
        updatedFormValues,
        searchedParams,
        isGetMaxFrom,
        maxSlippage || globalMaxSlippage,
        isFullReset,
        isRefetch,
      )
    },
    [curve, globalMaxSlippage, isLoadingApi, pageLoaded, searchedParams, setFormValues],
  )

  const handleBtnClickSwap = useCallback(
    async (
      actionActiveKey: string,
      curve: CurveApi,
      formValues: FormValues,
      maxSlippage: string,
      routesAndOutput: RoutesAndOutput,
      searchedParams: SearchedParams,
      toToken: string,
      fromToken: string,
    ) => {
      const { fromAmount, toAmount } = formValues
      const { isExpectedToAmount, toAmountOutput } = routesAndOutput

      const notifyMessage = t`swap ${fromAmount} ${fromToken} for ${
        isExpectedToAmount ? toAmountOutput : toAmount
      } ${toToken} at max slippage ${maxSlippage}%.`
      const { dismiss } = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepSwap(actionActiveKey, curve, formValues, searchedParams, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error && network) {
        const txMessage = t`Transaction complete. Received ${resp.swappedAmount} ${toToken}.`
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
    [activeKey, fetchStepSwap, notifyNotification, updateFormValues, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      routesAndOutput: RoutesAndOutput | undefined,
      formStatus: FormStatus,
      formValues: FormValues,
      searchedParams: SearchedParams,
      toToken: string,
      fromToken: string,
    ) => {
      const { formProcessing, formTypeCompleted, step } = formStatus
      const { fromAmount } = formValues

      const maxSlippage = routesAndOutput?.maxSlippage
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
            const notifyMessage = t`Please approve spending your ${fromToken}.`
            const { dismiss } = notifyNotification(notifyMessage, 'pending')
            await fetchStepApprove(activeKey, curve, formValues, searchedParams, globalMaxSlippage)
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
                      if (typeof maxSlippage !== 'undefined' && typeof routesAndOutput !== 'undefined') {
                        handleBtnClickSwap(
                          activeKey,
                          curve,
                          formValues,
                          maxSlippage,
                          routesAndOutput,
                          searchedParams,
                          toToken,
                          fromToken,
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
                  if (typeof maxSlippage !== 'undefined' && typeof routesAndOutput !== 'undefined') {
                    handleBtnClickSwap(
                      activeKey,
                      curve,
                      formValues,
                      maxSlippage,
                      routesAndOutput,
                      searchedParams,
                      toToken,
                      fromToken,
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
    [confirmedLoss, fetchStepApprove, globalMaxSlippage, handleBtnClickSwap, notifyNotification, steps],
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
    if (isReady) updateFormValues({}, false, globalMaxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalMaxSlippage])

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

  // full reset
  useEffect(() => {
    if (isReady) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi])

  // updateForm
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchData(), [tokensMapperStr, searchedParams.fromAddress, searchedParams.toAddress])

  // fromToken list
  useEffect(() => {
    setSelectFromList(isReady ? curve : null, selectToList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.signerAddress])

  // toToken list
  useEffect(() => {
    setSelectToList(isReady ? curve : null, isHideSmallPools ? tokensMapperNonSmallTvl : tokensMapper)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHideSmallPools, isReady, tokensMapperStr, tokensMapperNonSmallTvlStr, volumesMapper])

  // re-fetch data
  usePageVisibleInterval(() => fetchData(), REFRESH_INTERVAL['15s'], isPageVisible)

  // steps
  useEffect(() => {
    const updatedSteps = getSteps(
      activeKey,
      curve,
      routesAndOutput,
      isReady ? formStatus : { ...formStatus, formProcessing: true },
      formValues,
      searchedParams,
      toToken,
      fromToken,
    )
    setSteps(updatedSteps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, confirmedLoss, routesAndOutput, formEstGas, formStatus, formValues, searchedParams, userBalancesLoading])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const imageBaseUrl = network?.imageBaseUrl ?? ''
  const isDisable = formStatus.formProcessing
  const routesAndOutputLoading = !pageLoaded || _isRoutesAndOutputLoading(routesAndOutput, formValues, formStatus)

  return (
    <>
      {/* inputs */}
      <Box grid gridRowGap="narrow" margin="var(--spacing-3) 0 var(--spacing-3) 0">
        <div>
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
                isNetworkToken={searchedParams.fromAddress === NETWORK_TOKEN}
                testId="max"
                onClick={() => updateFormValues({ isFrom: true, toAmount: '' }, true)}
              />
              <TokenComboBox
                title=""
                disabled={isDisable}
                imageBaseUrl={imageBaseUrl}
                listBoxHeight="500px"
                selectedToken={tokensMapper[searchedParams.fromAddress]}
                showCheckboxHideSmallPools
                showSearch
                showBalances={haveSigner}
                testId="from-token"
                tokens={selectFromTokensList as Token[]}
                onOpen={() => setSelectFromList(curve, selectToList)}
                onSelectionChange={(value) => {
                  const fromAddress = value as string
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

        <div>
          {/* SWAP TO */}
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
            <TokenComboBox
              title=""
              disabled={isDisable}
              imageBaseUrl={imageBaseUrl}
              listBoxHeight="500px"
              selectedToken={tokensMapper[searchedParams.toAddress]}
              showCheckboxHideSmallPools
              showSearch
              testId="to-token"
              tokens={selectToTokensList as Token[]}
              onSelectionChange={(value) => {
                const toAddress = value as string
                const fromAddress =
                  toAddress === searchedParams.fromAddress ? searchedParams.toAddress : searchedParams.fromAddress
                resetFormErrors()
                redirect(toAddress, fromAddress)
              }}
            />
          </InputProvider>
          <FieldHelperUsdRate amount={formValues.toAmount} usdRate={toUsdRate} />
        </div>
      </Box>

      {/* detail info */}
      <div>
        <DetailInfoExchangeRate loading={routesAndOutputLoading} exchangeRates={routesAndOutput?.exchangeRates} />
        <DetailInfoPriceImpact
          loading={routesAndOutputLoading}
          priceImpact={routesAndOutput?.priceImpact}
          isHighImpact={routesAndOutput?.isHighImpact}
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
          maxSlippage={globalMaxSlippage || routesAndOutput?.maxSlippage}
          testId="slippage-tolerance"
          stateKey="global"
        />
      </div>

      {/* alerts */}
      <RouterSwapAlerts
        formStatus={formStatus}
        formValues={formValues}
        searchedParams={searchedParams}
        routesAndOutput={routesAndOutput}
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
