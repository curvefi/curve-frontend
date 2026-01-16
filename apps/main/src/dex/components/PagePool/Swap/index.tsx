import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Address } from 'viem'
import { useConfig, useConnection, type Config } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { AlertFormWarning } from '@/dex/components/AlertFormWarning'
import { AlertSlippage } from '@/dex/components/AlertSlippage'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import { WarningModal } from '@/dex/components/PagePool/components/WarningModal'
import type { ExchangeOutput, FormStatus, FormValues, StepKey } from '@/dex/components/PagePool/Swap/types'
import { DEFAULT_EST_GAS, DEFAULT_EXCHANGE_OUTPUT, getSwapTokens } from '@/dex/components/PagePool/Swap/utils'
import type { PageTransferProps, Seed } from '@/dex/components/PagePool/types'
import { DetailInfoExchangeRate } from '@/dex/components/PageRouterSwap/components/DetailInfoExchangeRate'
import { DetailInfoPriceImpact } from '@/dex/components/PageRouterSwap/components/DetailInfoPriceImpact'
import { useNetworks } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, PoolAlert, PoolData, TokensMapper } from '@/dex/types/main.types'
import { toTokenOption } from '@/dex/utils'
import { getSlippageImpact } from '@/dex/utils/utilsSwap'
import Stack from '@mui/material/Stack'
import { AlertBox } from '@ui/AlertBox'
import { Checkbox } from '@ui/Checkbox'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { TokenList, TokenSelector } from '@ui-kit/features/select-token'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

const { cloneDeep, isNaN, isUndefined } = lodash
const { Spacing } = SizesAndSpaces

export const Swap = ({
  chainIdPoolId,
  curve,
  maxSlippage,
  poolAlert,
  poolData,
  poolDataCacheOrApi,
  routerParams,
  seed,
  tokensMapper,
}: Pick<PageTransferProps, 'curve' | 'params' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams'> & {
  chainIdPoolId: string
  poolAlert: PoolAlert | null
  maxSlippage: string
  seed: Seed
  tokensMapper: TokensMapper
}) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const { rChainId } = routerParams
  const activeKey = useStore((state) => state.poolSwap.activeKey)
  const exchangeOutput = useStore((state) => state.poolSwap.exchangeOutput[activeKey] ?? DEFAULT_EXCHANGE_OUTPUT)
  const formEstGas = useStore((state) => state.poolSwap.formEstGas[activeKey] ?? DEFAULT_EST_GAS)
  const formStatus = useStore((state) => state.poolSwap.formStatus)
  const formValues = useStore((state) => state.poolSwap.formValues)
  const hasRouter = useStore((state) => state.hasRouter)
  const isMaxLoading = useStore((state) => state.poolSwap.isMaxLoading)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchUserPoolInfo = useStore((state) => state.user.fetchUserPoolInfo)
  const fetchStepApprove = useStore((state) => state.poolSwap.fetchStepApprove)
  const fetchStepSwap = useStore((state) => state.poolSwap.fetchStepSwap)
  const resetState = useStore((state) => state.poolSwap.resetState)
  const setFormValues = useStore((state) => state.poolSwap.setFormValues)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const { data: networks } = useNetworks()
  const network = (chainId && networks[chainId]) || null

  const slippageImpact = exchangeOutput ? getSlippageImpact({ maxSlippage, ...exchangeOutput }) : null

  const [steps, setSteps] = useState<Step[]>([])
  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const config = useConfig()
  const { address: userAddress } = useConnection()
  const {
    data: userFromBalance,
    isLoading: userFromBalanceLoading,
    refetch: refetchUserFromBalance,
  } = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: (formValues.fromAddress as Address) || undefined,
  })

  const {
    data: userToBalance,
    isLoading: userToBalanceLoading,
    refetch: refetchUserToBalance,
  } = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: (formValues.toAddress as Address) || undefined,
  })

  const { data: fromUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: formValues.fromAddress },
    !!formValues.fromAddress,
  )

  const { data: toUsdRate } = useTokenUsdRate({ chainId, tokenAddress: formValues.toAddress }, !!formValues.toAddress)

  const { selectList, swapTokensMapper } = useMemo(() => {
    const { selectList, swapTokensMapper } = getSwapTokens(tokensMapper, poolDataCacheOrApi)

    return {
      selectList: selectList.map(toTokenOption(network?.networkId)),
      swapTokensMapper,
    }
  }, [poolDataCacheOrApi, tokensMapper, network?.networkId])

  const fromToken = selectList.find((x) => x.address.toLocaleLowerCase() == formValues.fromAddress)
  const toToken = selectList.find((x) => x.address.toLocaleLowerCase() == formValues.toAddress)

  const [isOpenFromToken, openModalFromToken, closeModalFromToken] = useSwitch()
  const [isOpenToToken, openModalToToken, closeModalToToken] = useSwitch()

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isGetMaxFrom: boolean | null, updatedMaxSlippage: string | null) => {
      setConfirmedLoss(false)
      setTxInfoBar(null)

      void setFormValues(
        config,
        curve,
        poolDataCacheOrApi.pool.id,
        poolData,
        updatedFormValues,
        isGetMaxFrom,
        seed.isSeed,
        updatedMaxSlippage || maxSlippage,
      )
    },
    [setFormValues, config, curve, poolDataCacheOrApi.pool.id, poolData, seed.isSeed, maxSlippage],
  )

  const handleSwapClick = useCallback(
    async (
      actionActiveKey: string,
      config: Config,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const { fromAmount, fromToken, toToken } = formValues
      const notifyMessage = t`Please confirm swap ${fromAmount} ${fromToken} for ${toToken} at max slippage ${maxSlippage}%.`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepSwap(actionActiveKey, config, curve, poolData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        void refetchUserFromBalance()
        void refetchUserToBalance()
        setTxInfoBar(
          <TxInfoBar
            description={`Swapped ${fromAmount} ${fromToken}.`}
            txHash={scanTxPath(network, resp.hash)}
            onClose={() => {
              updateFormValues({}, null, null)
            }}
          />,
        )
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepSwap, activeKey, network, refetchUserFromBalance, refetchUserToBalance, updateFormValues],
  )

  const getSteps = useCallback(
    (
      actionActiveKey: string,
      config: Config,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      formStatus: FormStatus,
      exchangeOutput: ExchangeOutput,
      confirmedLoss: boolean,
      steps: Step[],
      isSeed: boolean,
      maxSlippage: string,
      userPoolBalancesLoading: boolean,
    ) => {
      const { formProcessing, formTypeCompleted, step } = formStatus
      const isValid =
        !userPoolBalancesLoading &&
        !isSeed &&
        !formStatus.error &&
        !formValues.fromError &&
        !formValues.toError &&
        +formValues.fromAmount > 0
      const isApprove = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formTypeCompleted === 'SWAP'

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApprove, step === 'APPROVAL', isValid && !formProcessing),
          type: 'action',
          content: isApprove ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${formValues.fromToken}.`
            const { dismiss } = notify(notifyMessage, 'pending')
            await fetchStepApprove(actionActiveKey, config, curve, poolData.pool, formValues, maxSlippage)
            if (typeof dismiss === 'function') dismiss()
          },
        },
        SWAP: {
          key: 'SWAP',
          status: getStepStatus(isComplete, step === 'SWAP', formStatus.isApproved && isValid),
          type: 'action',
          content: isComplete ? t`Swap Complete` : t`Swap`,
          ...(exchangeOutput.modal
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    // TODO: fix typescript error
                    <WarningModal
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...(exchangeOutput.modal as any)}
                      confirmed={confirmedLoss}
                      setConfirmed={setConfirmedLoss}
                    />
                  ),
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => {
                      setConfirmedLoss(false)
                    },
                  },
                  isDismissable: false,
                  primaryBtnProps: {
                    onClick: () => handleSwapClick(actionActiveKey, config, curve, poolData, formValues, maxSlippage),
                    disabled: !confirmedLoss,
                  },
                  primaryBtnLabel: 'Swap anyway',
                },
              }
            : { onClick: () => handleSwapClick(actionActiveKey, config, curve, poolData, formValues, maxSlippage) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['SWAP'] : ['APPROVAL', 'SWAP']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [fetchStepApprove, handleSwapClick],
  )

  const fetchData = useCallback(() => {
    if (curve && poolData && isPageVisible && !formStatus.formProcessing && !formStatus.formTypeCompleted) {
      updateFormValues({}, null, '')
    }
  }, [curve, formStatus.formProcessing, formStatus.formTypeCompleted, isPageVisible, poolData, updateFormValues])

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  useEffect(() => {
    if (poolId) {
      resetState(poolData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId])

  // get user balances
  useEffect(() => {
    if (curve && poolId && haveSigner && (isUndefined(userFromBalance) || isUndefined(userToBalance))) {
      void fetchUserPoolInfo(config, curve, poolId, true)
    }
  }, [chainId, poolId, haveSigner, userFromBalance, userToBalance, config, curve, fetchUserPoolInfo])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues({}, null, null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress, seed.isSeed])

  // maxSlippage
  useEffect(() => {
    updateFormValues({}, null, maxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  // steps
  useEffect(() => {
    if (curve && poolData && seed.isSeed !== null) {
      const updatedSteps = getSteps(
        activeKey,
        config,
        curve,
        poolData,
        formValues,
        formStatus,
        exchangeOutput,
        confirmedLoss,
        steps,
        seed.isSeed,
        maxSlippage,
        userFromBalanceLoading || userToBalanceLoading,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config,
    chainId,
    poolId,
    confirmedLoss,
    exchangeOutput?.modal,
    formEstGas,
    formStatus,
    formValues,
    maxSlippage,
    seed.isSeed,
    userFromBalanceLoading,
    userToBalanceLoading,
  ])

  // pageVisible
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchData(), [isPageVisible])

  // re-fetch data
  usePageVisibleInterval(() => fetchData(), REFRESH_INTERVAL['1m'])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const isDisabled = seed.isSeed === null || seed.isSeed || formStatus.formProcessing

  const setFromAmount = useCallback(
    (value?: Decimal) => updateFormValues({ isFrom: true, fromAmount: value ?? '', toAmount: '' }, null, null),
    [updateFormValues],
  )
  const setToAmount = useCallback(
    (value?: Decimal) => updateFormValues({ isFrom: false, toAmount: value ?? '', fromAmount: '' }, null, null),
    [updateFormValues],
  )

  return (
    <FormContent>
      <Stack gap={Spacing.sm}>
        <LargeTokenInput
          label={t`Sell`}
          name="fromAmount"
          onBalance={setFromAmount}
          balance={decimal(formValues.fromAmount)}
          inputBalanceUsd={decimal(formValues.fromAmount && fromUsdRate && fromUsdRate * +formValues.fromAmount)}
          tokenSelector={
            <TokenSelector
              selectedToken={fromToken}
              disabled={isDisabled || selectList.length === 0}
              compact
              onClose={closeModalFromToken}
              isOpen={!!isOpenFromToken}
              onOpen={openModalFromToken}
            >
              <TokenList
                tokens={selectList}
                disableSearch
                onToken={({ address, symbol }) =>
                  updateFormValues(
                    {
                      ...formValues,
                      ...(address === formValues.toAddress && {
                        toAddress: formValues.fromAddress,
                        toToken: swapTokensMapper[formValues.fromAddress].symbol,
                      }),
                      fromAddress: address,
                      fromToken: symbol,
                      ...(formValues.isFrom === false ? { fromAmount: '' } : { toAmount: '' }),
                    },
                    null,
                    '',
                  )
                }
              />
            </TokenSelector>
          }
          {...(formValues.fromError && {
            isError: true,
            message: t`Amount > wallet balance ${formatNumber(userFromBalance)}`,
          })}
          disabled={isDisabled}
          walletBalance={{
            balance: decimal(userFromBalance),
            loading: userFromBalanceLoading || isMaxLoading,
            symbol: fromToken?.symbol,
            usdRate: fromUsdRate,
          }}
          maxBalance={{
            balance: decimal(userFromBalance),
            chips: 'range',
          }}
        />

        <IconButton
          disabled={isDisabled}
          onClick={() => {
            const cFormValues = cloneDeep(formValues)
            cFormValues.isFrom = true
            cFormValues.fromAmount = formValues.toAmount
            cFormValues.fromToken = formValues.toToken
            cFormValues.fromAddress = formValues.toAddress
            cFormValues.toToken = formValues.fromToken
            cFormValues.toAddress = formValues.fromAddress
            cFormValues.toAmount = ''

            updateFormValues(cFormValues, null, '')
          }}
          size="medium"
        >
          <Icon name="ArrowsVertical" size={24} aria-label="icon arrow vertical" />
        </IconButton>

        {/* if hasRouter value is false, it means entering toAmount is not ready */}

        <LargeTokenInput
          label={t`Buy`}
          name="toAmount"
          onBalance={setToAmount}
          inputBalanceUsd={decimal(formValues.toAmount && toUsdRate && toUsdRate * +formValues.toAmount)}
          balance={decimal(formValues.toAmount)}
          disabled={isUndefined(hasRouter) || (!isUndefined(hasRouter) && !hasRouter) || isDisabled}
          tokenSelector={
            <TokenSelector
              selectedToken={toToken}
              disabled={isDisabled || selectList.length === 0}
              compact
              isOpen={!!isOpenToToken}
              onOpen={openModalToToken}
              onClose={closeModalToToken}
            >
              <TokenList
                tokens={selectList}
                disableSearch
                onToken={({ address, symbol }) =>
                  updateFormValues(
                    {
                      ...formValues,
                      ...(address === formValues.fromAddress && {
                        fromAddress: formValues.toAddress,
                        fromToken: swapTokensMapper[formValues.toAddress].symbol,
                      }),
                      toAddress: address,
                      toToken: symbol,
                      ...(formValues.isFrom === false ? { fromAmount: '' } : { toAmount: '' }),
                    },
                    null,
                    '',
                  )
                }
              />
            </TokenSelector>
          }
          walletBalance={{
            balance: decimal(userToBalance),
            loading: userToBalanceLoading,
            symbol: toToken?.symbol,
            usdRate: toUsdRate,
          }}
        />

        {poolDataCacheOrApi.hasWrapped && formValues.isWrapped !== null && (
          <div>
            <Checkbox
              isDisabled={isDisabled || !poolData || network?.poolIsWrappedOnly[poolDataCacheOrApi.pool.id]}
              isSelected={formValues.isWrapped}
              onChange={(isWrapped) => {
                if (poolData) {
                  const fromIdx = poolData.tokenAddresses.findIndex((a) => a === formValues.fromAddress)
                  const toIdx = poolData.tokenAddresses.findIndex((a) => a === formValues.toAddress)
                  const wrapped = setPoolIsWrapped(poolData, isWrapped)
                  const cFormValues = cloneDeep(formValues)
                  cFormValues.isWrapped = isWrapped
                  cFormValues.fromToken = wrapped.tokens[fromIdx]
                  cFormValues.fromAddress = wrapped.tokenAddresses[fromIdx]
                  cFormValues.toToken = wrapped.tokens[toIdx]
                  cFormValues.toAddress = wrapped.tokenAddresses[toIdx]

                  if (cFormValues.isFrom) {
                    cFormValues.toAmount = ''
                  } else {
                    cFormValues.fromAmount = ''
                  }

                  updateFormValues(cFormValues, null, '')
                }
              }}
            >
              {t`Swap Wrapped`}
            </Checkbox>
          </div>
        )}
      </Stack>

      <Stack>
        <DetailInfoExchangeRate exchangeRates={exchangeOutput.exchangeRates} loading={exchangeOutput.loading} />

        <DetailInfoPriceImpact
          loading={exchangeOutput.loading}
          priceImpact={exchangeOutput.priceImpact}
          isHighImpact={slippageImpact?.isHighImpact}
        />

        {haveSigner && (
          <DetailInfoEstGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <SlippageToleranceActionInfo maxSlippage={maxSlippage} stateKey={chainIdPoolId} />
      </Stack>

      {poolAlert && poolAlert?.isInformationOnlyAndShowInForm && (
        <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
      )}

      <AlertSlippage
        maxSlippage={maxSlippage}
        usdAmount={
          !isUndefined(toUsdRate) && !isNaN(toUsdRate)
            ? (Number(formValues.toAmount) * Number(toUsdRate)).toString()
            : ''
        }
      />
      <AlertFormWarning errorKey={formStatus.warning} />
      <AlertFormError
        errorKey={formStatus.error}
        handleBtnClose={() => {
          updateFormValues({}, null, null)
        }}
      />

      {formValues.toError ? (
        <AlertBox alertType="error">{t`The entered amount exceeds the available currency reserves.`}</AlertBox>
      ) : null}

      {/* actions*/}
      <TransferActions
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        loading={!chainId || !steps.length || !seed.loaded}
        routerParams={routerParams}
        seed={seed}
      >
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </FormContent>
  )
}
