import lodash, { countBy } from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { css, styled } from 'styled-components'
import { type Config, useConfig, useConnection } from 'wagmi'
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
import type { FormStatus, FormValues, StepKey } from '@/dex/components/PagePool/Withdraw/types'
import { resetFormAmounts } from '@/dex/components/PagePool/Withdraw/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { getTokens, hasWrapped, isWrappedOnly } from '@/dex/pool.utils'
import { useStore } from '@/dex/store/useStore'
import { CurveApi } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { Box } from '@legacy-ui/Box'
import { Checkbox } from '@legacy-ui/Checkbox'
import { Radio, RadioGroup } from '@legacy-ui/Radio'
import { getActiveStep, getStepStatus } from '@legacy-ui/Stepper/helpers'
import { Stepper } from '@legacy-ui/Stepper/Stepper'
import type { Step } from '@legacy-ui/Stepper/types'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'
import { mediaQueries } from '@legacy-ui/utils/responsive'
import { FormContent } from '@ui/features/forms/components/FormContent'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { constQ } from '@ui/features/queries/util'
import { notify } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'
import { amountsDescription, DEFAULT_ESTIMATED_GAS, DEFAULT_SLIPPAGE, getSlippageType } from '../../utils'

export const FormWithdraw = ({ maxSlippage, seed }: TransferProps) => {
  const {
    chainId,
    blockchainId,
    userAddress: signerAddress,
    poolId,
    pool,
    api: curve,
    isWrapped,
    setIsWrapped,
    tokens,
    tokenAddresses: poolTokenAddresses,
  } = usePoolContext()
  const isSubscribedRef = useRef(false)

  const activeKey = useStore(state => state.poolWithdraw.activeKey)
  const formEstGas = useStore(state => state.poolWithdraw.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formStatus = useStore(state => state.poolWithdraw.formStatus)
  const formValues = useStore(state => state.poolWithdraw.formValues)
  const slippage = useStore(state => state.poolWithdraw.slippage[activeKey] ?? DEFAULT_SLIPPAGE)
  const fetchStepApprove = useStore(state => state.poolWithdraw.fetchStepApprove)
  const fetchStepWithdraw = useStore(state => state.poolWithdraw.fetchStepWithdraw)
  const setFormValues = useStore(state => state.poolWithdraw.setFormValues)
  const resetState = useStore(state => state.poolWithdraw.resetState)

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const haveSigner = !!signerAddress

  const { address: userAddress } = useConnection()
  const { lpTokenBalance } = usePoolTokenDepositBalances({ chainId, userAddress, poolId })

  const config = useConfig()

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, updatedMaxSlippage: string | null) => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setTxInfoBar(null)
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setSlippageConfirmed(false)
      void setFormValues(
        'WITHDRAW',
        config,
        curve,
        poolId,
        pool,
        { isWrapped, ...updatedFormValues },
        null,
        seed.isSeed,
        updatedMaxSlippage || maxSlippage,
      )
    },
    [setFormValues, config, curve, isWrapped, pool, poolId, seed.isSeed, maxSlippage],
  )

  const handleApproveClick = useCallback(
    async (
      activeKey: string,
      config: Config,
      curve: CurveApi,
      pool: PoolTemplate,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const notifyMessage = t`Please approve spending your LP Tokens.`
      const { dismiss } = notify(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, config, curve, 'WITHDRAW', pool, formValues, maxSlippage)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove],
  )

  const handleWithdrawClick = useCallback(
    async (activeKey: string, curve: CurveApi, pool: PoolTemplate, formValues: FormValues, maxSlippage: string) => {
      const tokenText = amountsDescription(formValues.amounts)
      const notifyMessage = t`Please confirm withdrawal of ${formValues.lpToken} LP Tokens at max ${maxSlippage}% slippage.`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepWithdraw(activeKey, curve, pool, formValues, maxSlippage)

      if (isSubscribedRef.current && resp?.hash && resp.activeKey === activeKey && chainId) {
        const TxDescription = t`Withdrew ${formValues.lpToken} LP Tokens for ${tokenText}`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(chainId, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepWithdraw, chainId],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      config: Config,
      curve: CurveApi,
      pool: PoolTemplate,
      formValues: FormValues,
      formStatus: FormStatus,
      slippageConfirmed: boolean,
      slippage: Slippage,
      steps: Step[],
      maxSlippage: string,
      isSeed: boolean,
    ) => {
      const haveFormLpToken = +formValues.lpToken > 0
      const haveUserLpToken = lpTokenBalance.data != null && +lpTokenBalance.data > 0
      const isValidLpToken = haveUserLpToken && haveFormLpToken && +lpTokenBalance.data! >= +formValues.lpToken
      let isValid = haveSigner && !isSeed && isValidLpToken && !!formValues.selected && !formStatus.error

      if (isValid && (formValues.selected === 'token' || formValues.selected === 'imbalance')) {
        isValid = formValues.amounts.some(a => +a.value > 0)
      }

      const isApproved = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formStatus.formTypeCompleted === 'WITHDRAW'

      const stepsObj: Record<string, Step> = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: () => void handleApproveClick(activeKey, config, curve, pool, formValues, maxSlippage),
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
                    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
                    onClick: () => setSlippageConfirmed(false),
                  },
                  primaryBtnProps: {
                    onClick: () => void handleWithdrawClick(activeKey, curve, pool, formValues, maxSlippage),
                    disabled: !slippageConfirmed,
                  },
                  primaryBtnLabel: 'Withdraw anyway',
                },
              }
            : { onClick: () => void handleWithdrawClick(activeKey, curve, pool, formValues, maxSlippage) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map(s => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['WITHDRAW'] : ['APPROVAL', 'WITHDRAW']
      }

      return stepsKey.map(key => stepsObj[key])
    },
    [handleApproveClick, handleWithdrawClick, haveSigner, lpTokenBalance.data],
  )

  // onMount
  useEffect(() => {
    isSubscribedRef.current = true

    return () => {
      isSubscribedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (poolId) {
      resetState(pool, isWrapped)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [poolId])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues({}, null)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolId, signerAddress, seed.isSeed])

  // max Slippage
  useEffect(() => {
    if (maxSlippage) {
      updateFormValues({}, maxSlippage)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [maxSlippage])

  // steps
  useEffect(() => {
    if (curve && pool && seed.isSeed !== null) {
      const updatedSteps = getSteps(
        activeKey,
        config,
        curve,
        pool,
        formValues,
        formStatus,
        slippageConfirmed,
        slippage,
        steps,
        maxSlippage,
        seed.isSeed,
      )
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
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

  const tokenAddresses = useMemo(() => formValues.amounts.map(a => a.tokenAddress), [formValues.amounts])
  const { data: usdRates } = useTokenUsdRates({ chainId, tokenAddresses })

  // usd amount for slippage warning
  const estUsdAmountTotalReceive = useMemo(() => {
    if (formValues.selected === 'token') {
      const foundCoinWithAmount = formValues.amounts.find(a => Number(a.value) > 0)
      if (foundCoinWithAmount && usdRates?.[foundCoinWithAmount.tokenAddress] != null) {
        const { value, tokenAddress } = foundCoinWithAmount
        const usdRate = usdRates?.[tokenAddress]
        if (usdRate) {
          return (usdRate * Number(value)).toString()
        }
      }
    } else if (formValues.selected === 'lpToken' || formValues.selected === 'imbalance') {
      return lodash
        .sum(
          formValues.amounts
            .filter(({ tokenAddress, value }) => Number(value) > 0 && usdRates?.[tokenAddress])
            .map(({ tokenAddress, value }) => Number(usdRates?.[tokenAddress]) * Number(value)),
        )
        .toString()
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

  const tokenCount = useMemo(() => countBy(tokens), [tokens])

  return (
    <FormContent>
      <FieldLpToken
        amount={formValues.lpToken}
        balance={lpTokenBalance}
        isNotEnough={haveSigner && +formValues.lpToken > +(lpTokenBalance.data ?? '0')}
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
            onChange={selected => {
              if (selected === 'token') {
                updateFormValues(
                  {
                    selected,
                    selectedToken: formValues.selectedToken || tokens[0],
                    selectedTokenAddress: formValues.selectedTokenAddress || poolTokenAddresses[0],
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
            <Radio aria-label="Withdraw from one coin" value="token">
              {t`One coin`}
            </Radio>
            <Radio aria-label="Withdraw as balanced amounts" value="lpToken">
              {t`Balanced`}
            </Radio>
            {!pool.isCrypto && (
              <Radio aria-label="Custom withdraw" value="imbalance">
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
                  selectedTokenAddress={formValues.selectedTokenAddress}
                  tokens={tokens}
                  tokenAddresses={poolTokenAddresses}
                  handleChanged={({ token, tokenAddress }) => {
                    updateFormValues(
                      { selectedToken: token, selectedTokenAddress: tokenAddress },

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
                  tokens={tokens}
                  tokenAddresses={poolTokenAddresses}
                />
              )}

              {/* Custom */}
              <Box grid gridRowGap="narrow">
                {formValues.selected === 'imbalance' &&
                  tokens.map((token, idx) => {
                    const tokenAddress = poolTokenAddresses[idx]
                    const amount = formValues.amounts[idx]
                    return (
                      <FieldToken
                        key={tokenAddress}
                        idx={idx}
                        amount={amount?.value || ''}
                        balance={constQ(undefined)}
                        isNotEnough={false}
                        disabled={isDisabled}
                        haveSigner={haveSigner}
                        haveSameTokenName={tokenCount[token] > 1}
                        isWithdraw
                        blockchainId={blockchainId}
                        token={token}
                        tokenAddress={tokenAddress}
                        handleAmountChange={handleAmountChange}
                        hideMaxButton
                      />
                    )
                  })}
              </Box>
            </StyledSelectionContent>
          )}
        </TokensSelectorWrapper>

        {hasWrapped(pool) && formValues.isWrapped !== null && (
          <Checkbox
            isDisabled={isDisabled || isWrappedOnly(pool)}
            isSelected={isWrapped}
            onChange={nextIsWrapped => {
              const wrapped = getTokens(pool, { wrapped: nextIsWrapped })
              setIsWrapped(nextIsWrapped)
              const cFormValues = lodash.cloneDeep(formValues)

              cFormValues.isWrapped = nextIsWrapped
              cFormValues.amounts = wrapped.tokens.map((token, idx) => ({
                token,
                tokenAddress: wrapped.tokenAddresses[idx],
                value: '',
              }))
              updateFormValues(cFormValues, null)
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
            chainId={chainId}
            isDivider={haveSlippage}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <SlippageToleranceActionInfo maxSlippage={maxSlippage} type={getSlippageType(pool)} userAddress={userAddress} />
      </div>

      {formStatus.error && (
        <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, null)} />
      )}

      <TransferActions loading={!chainId || !steps.length} seed={seed}>
        <AlertSlippage maxSlippage={maxSlippage} usdAmount={estUsdAmountTotalReceive} />
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </FormContent>
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
