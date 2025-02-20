import type { FormStatus, FormValues, StepKey } from '@/dex/components/PagePool/Withdraw/types'
import type { Slippage, TransferProps } from '@/dex/components/PagePool/types'
import type { Step } from '@ui/Stepper/types'
import { t } from '@ui-kit/lib/i18n'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import styled, { css } from 'styled-components'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { amountsDescription } from '@/dex/components/PagePool/utils'
import { mediaQueries } from '@ui/utils/responsive'
import { resetFormAmounts } from '@/dex/components/PagePool/Withdraw/utils'
import { formatNumber } from '@ui/utils'
import useStore from '@/dex/store/useStore'
import { DEFAULT_ESTIMATED_GAS, DEFAULT_SLIPPAGE } from '@/dex/components/PagePool'
import { FieldsWrapper } from '@/dex/components/PagePool/styles'
import { Radio, RadioGroup } from '@ui/Radio'
import AlertFormError from '@/dex/components/AlertFormError'
import AlertSlippage from '@/dex/components/AlertSlippage'
import Box from '@ui/Box'
import Checkbox from '@ui/Checkbox'
import DetailInfoSlippage from '@/dex/components/PagePool/components/DetailInfoSlippage'
import DetailInfoEstGas from '@/dex/components/DetailInfoEstGas'
import DetailInfoSlippageTolerance from '@/dex/components/PagePool/components/DetailInfoSlippageTolerance'
import SelectedLpTokenExpected from '@/dex/components/PagePool/components/SelectedLpTokenExpected'
import SelectedOneCoinExpected from '@/dex/components/PagePool/components/SelectedOneCoinExpected'
import FieldLpToken from '@/dex/components/PagePool/components/FieldLpToken'
import FieldToken from '@/dex/components/PagePool/components/FieldToken'
import Stepper from '@ui/Stepper'
import TransferActions from '@/dex/components/PagePool/components/TransferActions'
import TxInfoBar from '@ui/TxInfoBar'
import WarningModal from '@/dex/components/PagePool/components/WarningModal'
import { CurveApi, Pool, PoolData } from '@/dex/types/main.types'
import { notify } from '@ui-kit/features/connect-wallet'

const FormWithdraw = ({
  chainIdPoolId,
  curve,
  blockchainId,
  maxSlippage,
  poolData,
  poolDataCacheOrApi,
  routerParams,
  seed,
  tokensMapper,
  userPoolBalances,
}: TransferProps) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const { rChainId } = routerParams
  const activeKey = useStore((state) => state.poolWithdraw.activeKey)
  const formEstGas = useStore((state) => state.poolWithdraw.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formStatus = useStore((state) => state.poolWithdraw.formStatus)
  const formValues = useStore((state) => state.poolWithdraw.formValues)
  const slippage = useStore((state) => state.poolWithdraw.slippage[activeKey] ?? DEFAULT_SLIPPAGE)
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)
  const fetchStepApprove = useStore((state) => state.poolWithdraw.fetchStepApprove)
  const fetchStepWithdraw = useStore((state) => state.poolWithdraw.fetchStepWithdraw)
  const setFormValues = useStore((state) => state.poolWithdraw.setFormValues)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const network = useStore((state) => (chainId ? state.networks.networks[chainId] : null))

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, updatedMaxSlippage: string | null) => {
      setTxInfoBar(null)
      setSlippageConfirmed(false)
      setFormValues(
        'WITHDRAW',
        curve,
        poolDataCacheOrApi.pool.id,
        poolData,
        updatedFormValues,
        null,
        seed.isSeed,
        updatedMaxSlippage || maxSlippage,
      )
    },
    [setFormValues, curve, poolDataCacheOrApi.pool.id, poolData, seed.isSeed, maxSlippage],
  )

  const handleApproveClick = useCallback(
    async (activeKey: string, curve: CurveApi, pool: Pool, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your LP Tokens.`
      const { dismiss } = notify(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, curve, 'WITHDRAW', pool, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove],
  )

  const handleWithdrawClick = useCallback(
    async (activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues, maxSlippage: string) => {
      const tokenText = amountsDescription(formValues.amounts)
      const notifyMessage = t`Please confirm withdrawal of ${formValues.lpToken} LP Tokens at max ${maxSlippage}% slippage.`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepWithdraw(activeKey, curve, poolData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        const TxDescription = t`Withdrew ${formValues.lpToken} LP Tokens for ${tokenText}`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={network.scanTxPath(resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepWithdraw, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
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
      const haveUserLpToken = typeof userPoolBalances !== 'undefined' && +userPoolBalances.lpToken > 0
      const isValidLpToken = haveUserLpToken && haveFormLpToken && +userPoolBalances.lpToken >= +formValues.lpToken
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
          onClick: () => handleApproveClick(activeKey, curve, poolData.pool, formValues),
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
                    onClick: () => handleWithdrawClick(activeKey, curve, poolData, formValues, maxSlippage),
                    disabled: !slippageConfirmed,
                  },
                  primaryBtnLabel: 'Withdraw anyway',
                },
              }
            : { onClick: () => handleWithdrawClick(activeKey, curve, poolData, formValues, maxSlippage) }),
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
    [handleApproveClick, handleWithdrawClick, haveSigner, userPoolBalances],
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

  // usd amount for slippage warning
  const estUsdAmountTotalReceive = useMemo(() => {
    if (formValues.selected === 'token') {
      const foundCoinWithAmount = formValues.amounts.find((a) => Number(a.value) > 0)

      if (foundCoinWithAmount && !isUndefined(usdRatesMapper[foundCoinWithAmount.tokenAddress])) {
        const { value, tokenAddress } = foundCoinWithAmount
        const usdRate = usdRatesMapper[tokenAddress]
        if (usdRate && !isNaN(usdRate)) {
          return (Number(usdRate) * Number(value)).toString()
        }
      }
    } else if (formValues.selected === 'lpToken' || formValues.selected === 'imbalance') {
      const amounts = formValues.amounts.filter((a) => Number(a.value) > 0)
      let usdAmountTotal = 0

      amounts.forEach((a) => {
        const usdRate = usdRatesMapper[a.tokenAddress]
        if (usdRate && !isNaN(usdRate)) {
          usdAmountTotal += Number(a.value) * Number(usdRate)
        }
      })
      return usdAmountTotal.toString()
    }

    return ''
  }, [formValues, usdRatesMapper])

  const haveSlippage = formValues.selected !== 'lpToken'
  const activeStep = haveSigner ? getActiveStep(steps) : null
  const isDisabled = seed.isSeed === null || seed.isSeed || formStatus.formProcessing
  const balLpToken = (userPoolBalances?.lpToken as string) ?? '0'

  return (
    <>
      <FieldLpToken
        amount={formValues.lpToken}
        balance={haveSigner ? formatNumber(balLpToken) : ''}
        balanceLoading={haveSigner ? typeof userPoolBalances === 'undefined' : false}
        hasError={haveSigner && +formValues.lpToken > +balLpToken}
        haveSigner={haveSigner}
        handleAmountChange={(val) => {
          updateFormValues(
            {
              amounts: resetFormAmounts(formValues),
              lpToken: val,
            },
            null,
          )
        }}
        disableInput={isDisabled}
        disabledMaxButton={isDisabled}
        handleMaxClick={() => {
          updateFormValues(
            {
              amounts: resetFormAmounts(formValues),
              lpToken: (userPoolBalances?.lpToken as string) ?? '0',
            },

            null,
          )
        }}
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
                        disableInput={isDisabled}
                        disableMaxButton={isDisabled}
                        hasError={false}
                        haveSigner={haveSigner}
                        haveSameTokenName={poolDataCacheOrApi?.tokensCountBy[token] > 1}
                        isWithdraw
                        blockchainId={blockchainId}
                        token={token}
                        tokenAddress={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
                        handleAmountChange={(val) => {
                          const clonedAmounts = cloneDeep(formValues.amounts)
                          clonedAmounts[idx].value = val
                          updateFormValues({ lpToken: '', amounts: clonedAmounts }, null)
                        }}
                        hideMaxButton
                        handleMaxClick={() => {}}
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
                const cFormValues = cloneDeep(formValues)

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
        <DetailInfoSlippageTolerance
          customLabel={t`Additional slippage tolerance:`}
          maxSlippage={maxSlippage}
          stateKey={chainIdPoolId}
        />
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
        userPoolBalances={userPoolBalances}
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

export default FormWithdraw
