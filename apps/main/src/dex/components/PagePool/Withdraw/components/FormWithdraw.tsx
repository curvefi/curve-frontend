import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { styled, css } from 'styled-components'
import { useConnection, type Config } from 'wagmi'
import { useConfig } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { AlertSlippage } from '@/dex/components/AlertSlippage'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { DetailInfoSlippage } from '@/dex/components/PagePool/components/DetailInfoSlippage'
import { FieldLpToken } from '@/dex/components/PagePool/components/FieldLpToken'
import { FieldToken } from '@/dex/components/PagePool/components/FieldToken'
import { SelectedLpTokenExpected } from '@/dex/components/PagePool/components/SelectedLpTokenExpected'
import { SelectedOneCoinExpected } from '@/dex/components/PagePool/components/SelectedOneCoinExpected'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import { WarningModal } from '@/dex/components/PagePool/components/WarningModal'
import { FieldsWrapper } from '@/dex/components/PagePool/styles'
import type { Slippage, TransferProps } from '@/dex/components/PagePool/types'
import { amountsDescription, DEFAULT_ESTIMATED_GAS, DEFAULT_SLIPPAGE } from '@/dex/components/PagePool/utils'
import type { FormStatus, FormValues, StepKey } from '@/dex/components/PagePool/Withdraw/types'
import { resetFormAmounts } from '@/dex/components/PagePool/Withdraw/utils'
import { useNetworks } from '@/dex/entities/networks'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, Pool, PoolData } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Checkbox } from '@ui/Checkbox'
import { Radio, RadioGroup } from '@ui/Radio'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { mediaQueries } from '@ui/utils/responsive'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

export const FormWithdraw = ({
  chainIdPoolId,
  curve,
  blockchainId,
  maxSlippage,
  poolData,
  poolDataCacheOrApi,
  routerParams,
  seed,
  tokensMapper,
}: TransferProps) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const { rChainId } = routerParams
  const activeKey = useStore((state) => state.poolWithdraw.activeKey)
  const formEstGas = useStore((state) => state.poolWithdraw.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formStatus = useStore((state) => state.poolWithdraw.formStatus)
  const formValues = useStore((state) => state.poolWithdraw.formValues)
  const slippage = useStore((state) => state.poolWithdraw.slippage[activeKey] ?? DEFAULT_SLIPPAGE)
  const fetchStepApprove = useStore((state) => state.poolWithdraw.fetchStepApprove)
  const fetchStepWithdraw = useStore((state) => state.poolWithdraw.fetchStepWithdraw)
  const setFormValues = useStore((state) => state.poolWithdraw.setFormValues)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const { data: networks } = useNetworks()
  const network = (chainId && networks[chainId]) || null

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const { address: userAddress } = useConnection()
  const { lpTokenBalance, isLoading: lpTokenBalanceLoading } = usePoolTokenDepositBalances({
    chainId,
    userAddress,
    poolId,
  })

  const config = useConfig()

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, updatedMaxSlippage: string | null) => {
      setTxInfoBar(null)
      setSlippageConfirmed(false)
      void setFormValues(
        'WITHDRAW',
        config,
        curve,
        poolDataCacheOrApi.pool.id,
        poolData,
        updatedFormValues,
        null,
        seed.isSeed,
        updatedMaxSlippage || maxSlippage,
      )
    },
    [setFormValues, config, curve, poolDataCacheOrApi.pool.id, poolData, seed.isSeed, maxSlippage],
  )

  const handleApproveClick = useCallback(
    async (activeKey: string, config: Config, curve: CurveApi, pool: Pool, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your LP Tokens.`
      const { dismiss } = notify(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, config, curve, 'WITHDRAW', pool, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove],
  )

  const handleWithdrawClick = useCallback(
    async (
      activeKey: string,
      config: Config,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const tokenText = amountsDescription(formValues.amounts)
      const notifyMessage = t`Please confirm withdrawal of ${formValues.lpToken} LP Tokens at max ${maxSlippage}% slippage.`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepWithdraw(activeKey, config, curve, poolData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        const TxDescription = t`Withdrew ${formValues.lpToken} LP Tokens for ${tokenText}`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(network, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepWithdraw, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      config: Config,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      formStatus: FormStatus,
      slippageConfirmed: boolean,
      slippage: Slippage,
      steps: Step[],
      maxSlippage: string,
      isSeed: boolean,
    ) => {
      const haveFormLpToken = +formValues.lpToken > 0
      const haveUserLpToken = lpTokenBalance != null && +lpTokenBalance > 0
      const isValidLpToken = haveUserLpToken && haveFormLpToken && +lpTokenBalance >= +formValues.lpToken
      let isValid = haveSigner && !isSeed && isValidLpToken && !!formValues.selected && !formStatus.error

      if (isValid && (formValues.selected === 'token' || formValues.selected === 'imbalance')) {
        isValid = formValues.amounts.some((a) => +a.value > 0)
      }

      const isApproved = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formStatus.formTypeCompleted === 'WITHDRAW'

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: () => handleApproveClick(activeKey, config, curve, poolData.pool, formValues),
        },
        WITHDRAW: {
          key: 'WITHDRAW',
          status: getStepStatus(isComplete, formStatus.step === 'WITHDRAW', isValid && formStatus.isApproved),
          type: 'action',
          content: isComplete ? t`Withdraw Complete` : t`Withdraw`,
          ...(slippage.isHighSlippage
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    <WarningModal
                      slippage
                      value={slippage.slippage || 0}
                      confirmed={slippageConfirmed}
                      transferType="Withdrawal"
                      setConfirmed={setSlippageConfirmed}
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setSlippageConfirmed(false),
                  },
                  primaryBtnProps: {
                    onClick: () => handleWithdrawClick(activeKey, config, curve, poolData, formValues, maxSlippage),
                    disabled: !slippageConfirmed,
                  },
                  primaryBtnLabel: 'Withdraw anyway',
                },
              }
            : { onClick: () => handleWithdrawClick(activeKey, config, curve, poolData, formValues, maxSlippage) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['WITHDRAW'] : ['APPROVAL', 'WITHDRAW']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [handleApproveClick, handleWithdrawClick, haveSigner, lpTokenBalance],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  useEffect(() => {
    if (poolId) {
      resetState(poolData, 'WITHDRAW')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues({}, null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress, seed.isSeed])

  // max Slippage
  useEffect(() => {
    if (maxSlippage) {
      updateFormValues({}, maxSlippage)
    }
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
        slippageConfirmed,
        slippage,
        steps,
        maxSlippage,
        seed.isSeed,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config,
    chainId,
    poolId,
    signerAddress,
    formValues,
    formStatus,
    slippage.isHighSlippage,
    slippageConfirmed,
    maxSlippage,
    seed.isSeed,
  ])

  const tokenAddresses = useMemo(() => formValues.amounts.map((a) => a.tokenAddress), [formValues.amounts])
  const { data: usdRates } = useTokenUsdRates({ chainId, tokenAddresses })

  // usd amount for slippage warning
  const estUsdAmountTotalReceive = useMemo(() => {
    if (formValues.selected === 'token') {
      const foundCoinWithAmount = formValues.amounts.find((a) => Number(a.value) > 0)

      if (foundCoinWithAmount && !lodash.isUndefined(usdRates[foundCoinWithAmount.tokenAddress])) {
        const { value, tokenAddress } = foundCoinWithAmount
        const usdRate = usdRates[tokenAddress]
        if (usdRate && !lodash.isNaN(usdRate)) {
          return (Number(usdRate) * Number(value)).toString()
        }
      }
    } else if (formValues.selected === 'lpToken' || formValues.selected === 'imbalance') {
      const amounts = formValues.amounts.filter((a) => Number(a.value) > 0)
      let usdAmountTotal = 0

      amounts.forEach((a) => {
        const usdRate = usdRates[a.tokenAddress]
        if (usdRate && !lodash.isNaN(usdRate)) {
          usdAmountTotal += Number(a.value) * Number(usdRate)
        }
      })
      return usdAmountTotal.toString()
    }

    return ''
  }, [formValues, usdRates])

  const haveSlippage = formValues.selected !== 'lpToken'
  const activeStep = haveSigner ? getActiveStep(steps) : null
  const isDisabled = seed.isSeed === null || seed.isSeed || formStatus.formProcessing

  const handleAmountChange = useCallback(
    (val: string, idx: number) => {
      const { amounts } = useStore.getState().poolWithdraw.formValues
      const clonedAmounts = [...amounts]
      clonedAmounts[idx] = { ...clonedAmounts[idx], value: val }
      updateFormValues({ lpToken: '', amounts: clonedAmounts }, null)
    },
    [updateFormValues],
  )

  return (
    <>
      <FieldLpToken
        amount={formValues.lpToken}
        balance={lpTokenBalance ?? ''}
        balanceLoading={lpTokenBalanceLoading}
        hasError={haveSigner && +formValues.lpToken > +(lpTokenBalance ?? '')}
        haveSigner={haveSigner}
        handleAmountChange={useCallback(
          (lpToken: string) =>
            updateFormValues({ amounts: resetFormAmounts(useStore.getState().poolWithdraw.formValues), lpToken }, null),
          [updateFormValues],
        )}
        disabled={isDisabled}
      />

      {/* input fields */}
      <FieldsWrapper>
        <TokensSelectorWrapper>
          <StyledRadioGroup
            aria-label="Customized amounts received"
            isDisabled={isDisabled}
            value={formValues.selected}
            onChange={(selected) => {
              if (selected === 'token') {
                updateFormValues(
                  {
                    selected,
                    selectedToken: formValues.selectedToken || poolDataCacheOrApi.tokens[0],
                    selectedTokenAddress: formValues.selectedTokenAddress || poolDataCacheOrApi.tokenAddresses[0],
                  },

                  null,
                )
              } else if (selected === 'lpToken') {
                updateFormValues({ amounts: resetFormAmounts(formValues), selected }, null)
              } else if (selected === 'imbalance') {
                updateFormValues({ lpToken: '', selected }, null)
              }
            }}
          >
            <Radio aria-label="Withdraw from one coin" value={'token'}>
              {t`One coin`}
            </Radio>
            <Radio aria-label="Withdraw as balanced amounts" value={'lpToken'}>
              {t`Balanced`}
            </Radio>
            {!poolDataCacheOrApi.pool.isCrypto && (
              <Radio aria-label="Custom withdraw" value={'imbalance'}>
                {t`Custom`}
              </Radio>
            )}
          </StyledRadioGroup>

          {formValues.selected && (
            <StyledSelectionContent>
              {/* One coin */}
              {formValues.selected === 'token' && (
                <SelectedOneCoinExpected
                  amounts={formValues.amounts}
                  haveSigner={haveSigner}
                  blockchainId={blockchainId}
                  loading={slippage.loading}
                  poolDataCacheOrApi={poolDataCacheOrApi}
                  selectedTokenAddress={formValues.selectedTokenAddress}
                  tokens={poolDataCacheOrApi.tokens}
                  tokensMapper={tokensMapper}
                  tokenAddresses={poolDataCacheOrApi.tokenAddresses}
                  handleChanged={({ token, tokenAddress }) => {
                    updateFormValues(
                      {
                        selectedToken: token,
                        selectedTokenAddress: tokenAddress,
                      },

                      null,
                    )
                  }}
                />
              )}

              {/* Balanced amounts */}
              {formValues.selected === 'lpToken' && (
                <SelectedLpTokenExpected
                  amounts={formValues.amounts}
                  blockchainId={blockchainId}
                  loading={slippage.loading}
                  poolDataCacheOrApi={poolDataCacheOrApi}
                  tokens={poolDataCacheOrApi.tokens}
                  tokensMapper={tokensMapper}
                  tokenAddresses={poolDataCacheOrApi.tokenAddresses}
                />
              )}

              {/* Custom */}
              <Box grid gridRowGap="narrow">
                {formValues.selected === 'imbalance' &&
                  poolDataCacheOrApi.tokens.map((token, idx) => {
                    const tokenAddress = poolDataCacheOrApi.tokenAddresses[idx]
                    const amount = formValues.amounts[idx]
                    return (
                      <FieldToken
                        key={tokenAddress}
                        idx={idx}
                        amount={amount?.value || ''}
                        balance={''}
                        balanceLoading={false}
                        disabled={isDisabled}
                        hasError={false}
                        haveSigner={haveSigner}
                        haveSameTokenName={poolDataCacheOrApi?.tokensCountBy[token] > 1}
                        isWithdraw
                        blockchainId={blockchainId}
                        token={token}
                        tokenAddress={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
                        handleAmountChange={handleAmountChange}
                        hideMaxButton
                      />
                    )
                  })}
              </Box>
            </StyledSelectionContent>
          )}
        </TokensSelectorWrapper>

        {poolDataCacheOrApi.hasWrapped && formValues.isWrapped !== null && (
          <Checkbox
            isDisabled={!poolData || isDisabled || network?.poolIsWrappedOnly[poolDataCacheOrApi.pool.id]}
            isSelected={formValues.isWrapped}
            onChange={(isWrapped) => {
              if (poolData) {
                const wrapped = setPoolIsWrapped(poolData, isWrapped)
                const cFormValues = lodash.cloneDeep(formValues)

                cFormValues.isWrapped = isWrapped
                cFormValues.amounts = wrapped.tokens.map((token, idx) => ({
                  token,
                  tokenAddress: wrapped.tokenAddresses[idx],
                  value: '',
                }))
                updateFormValues(cFormValues, null)
              }
            }}
          >
            {t`Withdraw Wrapped`}
          </Checkbox>
        )}
      </FieldsWrapper>

      <div>
        {formValues.selected !== 'lpToken' && <DetailInfoSlippage {...slippage} />}
        {haveSigner && (
          <DetailInfoEstGas
            chainId={rChainId}
            isDivider={haveSlippage}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <SlippageToleranceActionInfo maxSlippage={maxSlippage} stateKey={chainIdPoolId} />
      </div>

      {formStatus.error && (
        <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, null)} />
      )}

      <TransferActions
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        loading={!chainId || !steps.length || !seed.loaded}
        routerParams={routerParams}
        seed={seed}
      >
        <AlertSlippage maxSlippage={maxSlippage} usdAmount={estUsdAmountTotalReceive} />
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </>
  )
}

const StyledSelectionContent = styled.div`
  margin-top: var(--spacing-normal);
`

const StyledRadioGroup = styled(RadioGroup)`
  display: grid;
  font-size: var(--font-size-2);
  grid-auto-flow: row;
  justify-content: flex-start;

  ${mediaQueries('sm')(css`
    grid-auto-flow: column;
    column-gap: 0;
  `)}

  svg {
    margin-right: -5px;
  }

  label {
    margin-right: 0.75rem;
  }
`

const TokensSelectorWrapper = styled.div`
  padding: var(--spacing-narrow);
  background-color: var(--box--primary--content--background-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--box--primary--content--shadow-color);
`
