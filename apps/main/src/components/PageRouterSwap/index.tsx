import type { FormStatus, RoutesAndOutput, StepKey } from '@/components/PageRouterSwap/types'
import type { FormValues, SearchedParams } from '@/components/PageRouterSwap/types'
import type { Params } from 'react-router'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react'

import { DEFAULT_EST_GAS, DEFAULT_ROUTES_AND_OUTPUT } from '@/components/PageRouterSwap/utils'
import { NETWORK_TOKEN } from '@/constants'
import { REFRESH_INTERVAL } from '@/constants'
import { formatNumber } from '@/ui/utils'
import { getActiveStep, getStepStatus } from '@/ui/Stepper/helpers'
import { getTokensMapperStr } from '@/store/createTokensSlice'
import { getTokensListStr, getTokensObjList } from '@/store/createQuickSwapSlice'
import { getUsdRatesStr } from '@/store/createUsdRatesSlice'
import { getUserBalancesStr } from '@/store/createUserBalancesSlice'
import { getChainSignerActiveKey } from '@/utils'
import networks from '@/networks'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useSelectToList from '@/components/PageRouterSwap/components/useSelectToList'
import useStore from '@/store/useStore'
import useTokensNameMapper from '@/hooks/useTokensNameMapper'

import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertFormWarning from '@/components/AlertFormWarning'
import AlertSlippage from '@/components/AlertSlippage'
import Box from '@/ui/Box'
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
import Stepper from '@/ui/Stepper'
import TokenComboBox from '@/components/ComboBoxSelectToken'
import TxInfoBar from '@/ui/TxInfoBar'
import WarningModal from '@/components/PagePool/components/WarningModal'

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
  const firstBasePlusPriority = useStore((state) => state.gas.gasInfo?.basePlusPriority?.[0])
  const formEstGas = useStore((state) => state.quickSwap.formEstGas[activeKey] ?? DEFAULT_EST_GAS)
  const formStatus = useStore((state) => state.quickSwap.formStatus)
  const formValues = useStore((state) => state.quickSwap.formValues)
  const globalMaxSlippage = useStore((state) => state.maxSlippage)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const routesAndOutput = useStore((state) => state.quickSwap.routesAndOutput[activeKey] ?? DEFAULT_ROUTES_AND_OUTPUT)
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
  const setFormValues = useStore((state) => state.quickSwap.setFormValues)
  const setSelectFromList = useStore((state) => state.quickSwap.setSelectFromList)
  const setSelectToList = useStore((state) => state.quickSwap.setSelectToList)

  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const selectFromListStr = useMemo(() => getTokensListStr(selectFromList), [selectFromList])
  const userBalancesStr = useMemo(() => getUserBalancesStr(userBalancesMapper), [userBalancesMapper])
  const usdRatesStr = useMemo(() => getUsdRatesStr(usdRatesMapper), [usdRatesMapper])
  const tokensMapperNonSmallTvlStr = useMemo(
    () => getTokensMapperStr(tokensMapperNonSmallTvl),
    [tokensMapperNonSmallTvl]
  )

  const selectFromTokensList = useMemo(
    () => (pageLoaded ? getTokensObjList(selectFromList ?? selectToList, tokensMapper) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageLoaded, selectFromListStr, selectToListStr, tokensMapperStr]
  )

  const selectToTokensList = useMemo(
    () => getTokensObjList(selectToList, tokensMapper),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectToListStr, tokensMapperStr]
  )

  const haveSigner = !!signerAddress
  const userFromBalance = userBalancesMapper[searchedParams.fromAddress]
  const userToBalance = userBalancesMapper[searchedParams.toAddress]
  const fromUsdRate = usdRatesMapper[searchedParams.fromAddress]
  const toUsdRate = usdRatesMapper[searchedParams.toAddress]

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isGetMaxFrom: boolean, maxSlippage: string, isFullReset: boolean) => {
      setTxInfoBar(null)
      setConfirmedLoss(false)

      setFormValues(
        updatedFormValues,
        searchedParams,
        pageLoaded,
        rChainId === curve?.chainId ? curve : null,
        isGetMaxFrom,
        maxSlippage || globalMaxSlippage,
        isFullReset,
        tokensNameMapper
      )
    },
    [curve, globalMaxSlippage, pageLoaded, rChainId, searchedParams, setFormValues, tokensNameMapper]
  )

  const handleBtnClickSwap = useCallback(
    async (
      actionActiveKey: string,
      curve: CurveApi,
      formValues: FormValues,
      maxSlippage: string,
      searchedParams: SearchedParams
    ) => {
      const { fromAmount } = formValues
      const { fromAddress, toAddress } = searchedParams
      const fromToken = tokensNameMapper[fromAddress] ?? ''
      const toToken = tokensNameMapper[toAddress] ?? ''
      const notifyMessage = t`Please confirm swap ${fromAmount} ${fromToken} for ${toToken} at max slippage ${maxSlippage}%.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepSwap(actionActiveKey, curve, formValues, searchedParams, maxSlippage)

      if (isSubscribed.current && chainId && resp && resp.hash && resp.activeKey === activeKey) {
        setTxInfoBar(
          <TxInfoBar
            description={t`Swapped ${fromAmount} ${fromToken} for ${resp.swappedAmount} ${toToken}`}
            txHash={networks[chainId].scanTxPath(resp.hash)}
            onClose={() => updateFormValues({}, false, '', true)}
          />
        )
      }

      typeof dismiss === 'function' && dismiss()
    },
    [activeKey, chainId, fetchStepSwap, notifyNotification, tokensNameMapper, updateFormValues]
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      routesAndOutput: RoutesAndOutput,
      formStatus: FormStatus,
      formValues: FormValues,
      searchedParams: SearchedParams,
      userBalancesLoading: boolean
    ) => {
      const { formProcessing, formTypeCompleted, step } = formStatus
      const { fromAmount } = formValues
      const { fromAddress } = searchedParams
      const haveFromAmount = +fromAmount > 0
      const maxSlippage = routesAndOutput.maxSlippage
      const isValidFromAmount =
        !userBalancesLoading &&
        haveFromAmount &&
        !formValues.fromError &&
        !!userFromBalance &&
        +userFromBalance >= +fromAmount
      const isValid = !routesAndOutput.loading && !formStatus.error && isValidFromAmount
      const isApproved = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formStatus.formTypeCompleted === 'SWAP'

      const stepsObj: { [k: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid && !formProcessing),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${tokensNameMapper[fromAddress] ?? ''}.`
            const { dismiss } = notifyNotification(notifyMessage, 'pending')
            await fetchStepApprove(activeKey, curve, formValues, searchedParams, globalMaxSlippage, tokensNameMapper)
            if (typeof dismiss === 'function') dismiss()
          },
        },
        SWAP: {
          key: 'SWAP',
          status: getStepStatus(isComplete, step === 'SWAP', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Swap Complete` : t`Swap`,
          ...(routesAndOutput.modal
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
                    onClick: () => handleBtnClickSwap(activeKey, curve, formValues, maxSlippage, searchedParams),
                    disabled: !confirmedLoss,
                  },
                  primaryBtnLabel: 'Swap anyway',
                },
              }
            : { onClick: () => handleBtnClickSwap(activeKey, curve, formValues, maxSlippage, searchedParams) }),
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
      confirmedLoss,
      fetchStepApprove,
      globalMaxSlippage,
      handleBtnClickSwap,
      notifyNotification,
      steps,
      tokensNameMapper,
      userFromBalance,
    ]
  )

  const fetchData = useCallback(() => {
    if (!formStatus.formProcessing && !formStatus.formTypeCompleted) {
      updateFormValues({}, false, '', false)
    }
  }, [formStatus, updateFormValues])

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      updateFormValues({}, false, '', true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // full reset
  useEffect(() => {
    updateFormValues({}, false, '', true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, signerAddress, isLoadingApi])

  // updateForm
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchData(), [tokensMapperStr, searchedParams.fromAddress, searchedParams.toAddress])

  // token list
  useEffect(() => {
    setSelectToList(pageLoaded, curve, isHideSmallPools ? tokensMapperNonSmallTvl : tokensMapper, volumesMapper)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, isHideSmallPools, pageLoaded, tokensMapperStr, tokensMapperNonSmallTvlStr, volumesMapper])

  // fromToken list
  useEffect(() => {
    setSelectFromList(pageLoaded, curve, selectToList, firstBasePlusPriority, usdRatesMapper, userBalancesMapper)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, firstBasePlusPriority, pageLoaded, signerAddress, selectToListStr, usdRatesStr, userBalancesStr])

  // maxSlippage
  useEffect(() => {
    if (globalMaxSlippage) {
      updateFormValues({}, false, globalMaxSlippage, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalMaxSlippage])

  // pageVisible re-fetch data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchData(), [isPageVisible])

  // re-fetch data
  usePageVisibleInterval(() => fetchData(), REFRESH_INTERVAL['1m'], isPageVisible)

  // steps
  useEffect(() => {
    if (pageLoaded) {
      const updatedSteps = getSteps(
        activeKey,
        curve,
        routesAndOutput,
        formStatus,
        formValues,
        searchedParams,
        userBalancesLoading
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageLoaded,
    confirmedLoss,
    routesAndOutput?.modal,
    routesAndOutput.toAmount,
    formEstGas,
    formStatus,
    formValues,
    searchedParams,
    userBalancesLoading,
  ])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const imageBaseUrl = networks[rChainId].imageBaseUrl
  const isDisable = !pageLoaded || formStatus.formProcessing

  return (
    <>
      {/* inputs */}
      <Box grid gridRowGap="narrow">
        <div>
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
              value={formValues.fromAmount}
              onChange={(fromAmount) => updateFormValues({ isFrom: true, fromAmount, toAmount: '' }, false, '', false)}
            />
            <InputMaxBtn
              loading={isMaxLoading}
              disabled={isDisable}
              isNetworkToken={searchedParams.fromAddress === NETWORK_TOKEN}
              testId="max"
              onClick={() => updateFormValues({ isFrom: true, fromAmount: '', toAmount: '' }, true, '', false)}
            />
            <TokenComboBox
              title=""
              disabled={isDisable}
              disabledKeys={[]}
              haveSigner={haveSigner}
              imageBaseUrl={imageBaseUrl}
              listBoxHeight="500px"
              selectedToken={tokensMapper[searchedParams.fromAddress]}
              testId="from-token"
              tokens={selectFromTokensList}
              onSelectionChange={(value) => {
                const fromAddress = value as string
                const toAddress =
                  fromAddress === searchedParams.toAddress ? searchedParams.fromAddress : searchedParams.toAddress
                redirect(toAddress, fromAddress)
              }}
            />
          </InputProvider>
          <FieldHelperUsdRate amount={formValues.fromAmount} usdRate={fromUsdRate} />
          <Box flex flexJustifyContent="center">
            <IconButton
              disabled={isDisable}
              onClick={() => {
                updateFormValues({ isFrom: true, fromAmount: '', toAmount: '' }, false, '', false)
                redirect(searchedParams.fromAddress, searchedParams.toAddress)
              }}
              size="medium"
              testId="swap-tokens"
            >
              <Icon name="ArrowsVertical" size={24} />
            </IconButton>
          </Box>
        </div>

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
              onChange={(toAmount) => updateFormValues({ isFrom: false, toAmount, fromAmount: '' }, false, '', false)}
            />
            <TokenComboBox
              title=""
              disabled={isDisable}
              disabledKeys={[]}
              imageBaseUrl={imageBaseUrl}
              listBoxHeight="500px"
              selectedToken={tokensMapper[searchedParams.toAddress]}
              testId="to-token"
              tokens={selectToTokensList}
              onSelectionChange={(value) => {
                const toAddress = value as string
                const fromAddress =
                  toAddress === searchedParams.fromAddress ? searchedParams.toAddress : searchedParams.fromAddress
                redirect(toAddress, fromAddress)
              }}
            />
          </InputProvider>
          <FieldHelperUsdRate amount={formValues.toAmount} usdRate={toUsdRate} />
        </div>
      </Box>

      {/* detail info */}
      <div>
        <DetailInfoExchangeRate loading={routesAndOutput.loading} exchangeRates={routesAndOutput.exchangeRates} />
        <DetailInfoPriceImpact
          loading={routesAndOutput.loading}
          priceImpact={routesAndOutput.priceImpact}
          isHighImpact={routesAndOutput.isHighImpact}
        />
        <DetailInfoTradeRoute
          params={params}
          loading={routesAndOutput.loading}
          routes={routesAndOutput.routes}
          tokensNameMapper={tokensNameMapper}
        />

        {haveSigner && chainId && (
          <DetailInfoEstGas
            curve={curve}
            chainId={chainId}
            {...formEstGas}
            isDivider
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <DetailInfoSlippageTolerance
          maxSlippage={globalMaxSlippage || routesAndOutput.maxSlippage}
          testId="slippage-tolerance"
        />
      </div>

      {/* actions*/}
      <AlertSlippage
        maxSlippage={routesAndOutput.maxSlippage}
        usdAmount={
          !isUndefined(toUsdRate) && !isNaN(toUsdRate)
            ? (Number(formValues.toAmount) * Number(toUsdRate)).toString()
            : ''
        }
      />

      {formStatus.warning === 'warning-exchange-rate-low-is-expected-to-amount' ? (
        <AlertBox
          alertType={'error'}
        >{t`Warning! The exchange rate is too low, and due to slippage, the expected amount you would like to receive (${formValues.toAmount}) will actually be ${routesAndOutput.toAmountOutput}.`}</AlertBox>
      ) : formStatus.warning === 'warning-is-expected-to-amount' ? (
        <AlertBox
          alertType={'warning'}
        >{t`Warning! Due to slippage, the expected amount you would like to receive (${formValues.toAmount}) will actually be ${routesAndOutput.toAmountOutput}`}</AlertBox>
      ) : (
        <AlertFormWarning errorKey={formStatus.warning} />
      )}

      <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, false, '', false)} />

      {formValues.fromError ? (
        <AlertBox alertType="error">{t`Not enough balance for ${
          tokensNameMapper[searchedParams.fromAddress]
        }`}</AlertBox>
      ) : null}

      <FormConnectWallet loading={!steps.length} curve={curve}>
        {txInfoBar}
        <Stepper steps={steps} testId="swap" />
      </FormConnectWallet>
    </>
  )
}

QuickSwap.defaultProps = {
  className: '',
}

export default QuickSwap
