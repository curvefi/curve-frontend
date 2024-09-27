import type { Amount, WithdrawFormValues } from '@/entities/withdraw'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FormWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getMutationStepLabel, getMutationStepStatus, showStepApprove } from '@/components/PagePool/utils'
import {
  useApproveWithdraw,
  useWithdraw,
  useWithdrawDetails,
  useWithdrawApproval,
  useWithdrawEstGas,
} from '@/entities/withdraw'
import { usePoolContext } from '@/components/PagePool/contextPool'

import { FieldsWrapper } from '@/components/PagePool/styles'
import { TxInfoBars } from '@/ui/TxInfoBar'
import AlertFormError from '@/components/AlertFormError'
import AlertSlippage from '@/components/PagePool/Withdraw/components/AlertSlippage'
import CheckboxIsWrapped from '@/components/PagePool/Withdraw/components/CheckboxIsWrapped'
import DetailsInfoEstGas from '@/components/PagePool/components/DetailsInfoEstGas'
import DetailInfoSlippage from '@/components/PagePool/components/DetailInfoSlippage'
import DetailInfoSlippageTolerance from '@/components/PagePool/components/DetailInfoSlippageTolerance'
import FieldLpToken from '@/components/PagePool/Withdraw/components/FieldLpToken'
import FormWithdrawOneCoin from '@/components/PagePool/Withdraw/components/FormWithdrawOneCoin'
import FormWithdrawBalanced from '@/components/PagePool/Withdraw/components/FormWithdrawBalanced'
import FormWithdrawCustom from '@/components/PagePool/Withdraw/components/FormWithdrawCustom'
import SelectWithdrawOptions from '@/components/PagePool/Withdraw/components/SelectWithdrawOptions'
import Stepper from '@/ui/Stepper'
import TransferActions from '@/components/PagePool/components/TransferActions'
import WarningModal from '@/components/PagePool/components/WarningModal'

const FormWithdraw = () => {
  const {
    rChainId,
    rPoolId,
    chainId,
    signerAddress,
    poolId,
    maxSlippage,
    isWrapped,
    poolBaseKeys,
    poolBaseSignerKeys,
    pool,
    signerPoolBalances,
    isSeed,
    tokens,
    scanTxPath,
  } = usePoolContext()

  const [formValues, setFormValues] = useState<WithdrawFormValues>({
    amounts: [],
    amount: null,
    lpToken: '',
    lpTokenError: '',
    selected: '',
    selectedToken: '',
    selectedTokenAddress: '',
  })
  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])

  const { selected, selectedToken, selectedTokenAddress, amounts, lpToken, lpTokenError } = formValues

  const lpTokenBalance = signerPoolBalances?.['lpToken'] ?? ''
  const isInProgress = useMemo(() => steps.some(({ status }) => status === 'in-progress'), [steps])

  const {
    data: { expectedAmounts = [], expected = '', slippage = null, isHighSlippage = false, isBonus = false } = {},
    ...detailsState
  } = useWithdrawDetails({
    ...poolBaseKeys,
    isInProgress,
    selected,
    selectedTokenAddress: tokens.find(({ address }) => selectedTokenAddress === address)?.address ?? '',
    amounts,
    lpToken,
    isWrapped,
    maxSlippage,
  })

  const { data: isApproved = false, ...approvalState } = useWithdrawApproval({
    ...poolBaseSignerKeys,
    isInProgress,
    selected,
    selectedTokenAddress: tokens.find(({ address }) => selectedTokenAddress === address)?.address ?? '',
    amounts,
    lpToken,
    lpTokenError,
    isWrapped,
  })

  const { data: estimatedGas = null, ...estGasState } = useWithdrawEstGas({
    ...poolBaseSignerKeys,
    isApproved,
    isInProgress,
    selected,
    selectedTokenAddress: tokens.find(({ address }) => selectedTokenAddress === address)?.address ?? '',
    amounts,
    lpToken,
    lpTokenError,
    isWrapped,
  })

  const actionParams = useMemo(
    () => ({
      ...poolBaseSignerKeys,
      isLoadingDetails: detailsState.isFetching || approvalState.isFetching || estGasState.isFetching,
      isApproved: isApproved,
      selected,
      amounts,
      lpToken,
      lpTokenError,
      isWrapped,
    }),
    [
      amounts,
      approvalState.isFetching,
      detailsState.isFetching,
      estGasState.isFetching,
      isApproved,
      isWrapped,
      lpToken,
      lpTokenError,
      poolBaseSignerKeys,
      selected,
    ]
  )

  const {
    enabled: enabledApprove,
    mutation: { mutate: approve, data: approveData, error: approveError, reset: approveReset, ...approveState },
  } = useApproveWithdraw({ ...actionParams, selectedToken })

  const approveStatus = useMemo(
    () => ({
      isIdle: approveState.isIdle,
      isPending: approveState.isPending,
      isError: approveState.isError,
      isSuccess: approveState.isSuccess,
    }),
    [approveState.isError, approveState.isIdle, approveState.isPending, approveState.isSuccess]
  )

  const {
    enabled: enabledWithdraw,
    mutation: { mutate: withdraw, data: withdrawData, error: withdrawError, reset: withdrawReset, ...withdrawState },
  } = useWithdraw({ ...actionParams, selectedTokenAddress, maxSlippage })

  const withdrawStatus = useMemo(
    () => ({
      isIdle: withdrawState.isIdle,
      isPending: withdrawState.isPending,
      isError: withdrawState.isError,
      isSuccess: withdrawState.isSuccess,
    }),
    [withdrawState.isError, withdrawState.isIdle, withdrawState.isPending, withdrawState.isSuccess]
  )

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<WithdrawFormValues>) => {
      approveReset()
      withdrawReset()
      setSlippageConfirmed(false)

      setFormValues((prevFormValues) => {
        if (updatedFormValues.amount) {
          updatedFormValues.amounts = updateAmounts(updatedFormValues.amount, prevFormValues.amounts)
          updatedFormValues.amount = null
        }

        let all = { ...prevFormValues, lpTokenError: '', ...updatedFormValues }
        let lpTokenError: WithdrawFormValues['lpTokenError'] = ''
        if (signerAddress) lpTokenError = Number(all.lpToken) > Number(lpTokenBalance) ? 'too-much' : ''
        return { ...all, lpTokenError }
      })
    },
    [approveReset, lpTokenBalance, signerAddress, withdrawReset]
  )

  const resetForm = useCallback(() => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      lpToken: '',
      lpTokenError: '',
      amounts: prevFormValues.amounts.map((a) => ({ ...a, value: '' })),
      amount: null,
    }))
  }, [])

  // tokens
  useEffect(() => {
    if (tokens.length === 0) return

    const currTokens = isWrapped ? pool?.underlyingCoins : pool?.wrappedCoins
    if (selected === 'one-coin' && !currTokens) return

    const currIdx = currTokens?.findIndex((token) => selectedToken === token) ?? 0

    updateFormValues({
      amount: null,
      amounts: tokens.map(({ symbol: token, address: tokenAddress }) => ({
        token,
        tokenAddress,
        value: '',
        error: '',
      })),
      selectedToken: selected === 'one-coin' ? tokens?.[currIdx]?.symbol ?? '' : '',
      selectedTokenAddress: selected === 'one-coin' ? tokens?.[currIdx]?.address ?? '' : '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens])

  // reset form if signerAddress changed
  useEffect(() => {
    resetForm()
  }, [resetForm, signerAddress])

  // reset form after withdraw
  useEffect(() => {
    if (withdrawState.isSuccess) resetForm()
  }, [resetForm, withdrawState.isSuccess])

  // reset confirm slippage
  useEffect(() => {
    if (withdrawState.isError) setSlippageConfirmed(false)
  }, [withdrawState.isError])

  // steps
  useEffect(() => {
    if (!chainId || !poolId || !signerAddress || isSeed === null) {
      setSteps([])
      return
    }

    const actionParams = {
      chainId,
      poolId,
      signerAddress,
      isLoadingDetails: false,
      selected,
      amounts,
      lpToken,
      lpTokenError,
      isWrapped,
    }

    const APPROVAL: Step = {
      key: 'APPROVAL',
      status: getMutationStepStatus(enabledApprove.enabled, approveStatus),
      type: 'action',
      content: getMutationStepLabel(true, approveStatus),
      onClick: () => {
        approveReset()
        approve({ ...actionParams, selectedToken, isApproved: false })
      },
    }

    const onClick = () => {
      withdrawReset()
      withdraw({ ...actionParams, selectedTokenAddress, isApproved: true, maxSlippage })
    }

    const SUBMIT: Step = {
      key: 'WITHDRAW',
      status: getMutationStepStatus(enabledWithdraw.enabled, withdrawStatus),
      type: 'action',
      content: `${t`Withdraw`} ${getMutationStepLabel(false, withdrawStatus)}`,
      ...(isHighSlippage
        ? {
            modal: {
              title: t`Warning!`,
              content: (
                <WarningModal
                  slippage
                  value={slippage || 0}
                  confirmed={slippageConfirmed}
                  transferType="Withdrawal"
                  setConfirmed={setSlippageConfirmed}
                />
              ),
              isDismissable: false,
              cancelBtnProps: { label: t`Cancel`, onClick: () => setSlippageConfirmed(false) },
              primaryBtnProps: { onClick, disabled: !slippageConfirmed },
              primaryBtnLabel: 'Withdraw anyway',
            },
          }
        : { onClick }),
    }

    const showApproveAction = showStepApprove(isApproved, approveData, withdrawData)
    setSteps(showApproveAction ? [APPROVAL, SUBMIT] : [SUBMIT])
  }, [
    amounts,
    approve,
    approveData,
    approveReset,
    approveStatus,
    chainId,
    enabledApprove.enabled,
    enabledWithdraw.enabled,
    isApproved,
    isHighSlippage,
    isSeed,
    isWrapped,
    lpToken,
    lpTokenError,
    maxSlippage,
    poolId,
    selected,
    selectedToken,
    selectedTokenAddress,
    signerAddress,
    slippage,
    slippageConfirmed,
    withdraw,
    withdrawData,
    withdrawReset,
    withdrawStatus,
  ])

  return (
    <FormWithdrawContext.Provider
      value={{
        formValues,
        isLoading: isSeed === null || detailsState.isFetching,
        isDisabled: approveState.isPending || withdrawState.isPending || isSeed === null || isSeed,
        updateFormValues,
      }}
    >
      <FieldLpToken />

      <FieldsWrapper>
        <TokensSelectorWrapper>
          <SelectWithdrawOptions />
          {selected && (
            <StyledSelectionContent>
              {selected === 'one-coin' && <FormWithdrawOneCoin expected={expected} isError={detailsState.isError} />}
              {selected === 'balanced' && (
                <FormWithdrawBalanced expectedAmounts={expectedAmounts} isError={detailsState.isError} />
              )}
              {selected.startsWith('custom') && (
                <FormWithdrawCustom requiredLpToken={expected} expectedAmounts={expectedAmounts} />
              )}
            </StyledSelectionContent>
          )}
        </TokensSelectorWrapper>

        <CheckboxIsWrapped />
      </FieldsWrapper>

      <div>
        {selected !== 'balanced' && (
          <DetailInfoSlippage
            isHighSlippage={isHighSlippage}
            isBonus={isBonus}
            slippage={slippage}
            isLoading={detailsState.isFetching}
          />
        )}
        <DetailsInfoEstGas
          activeStep={!!signerAddress ? getActiveStep(steps) : null}
          estimatedGas={estimatedGas}
          estimatedGasIsLoading={estGasState.isFetching}
          stepsLength={steps.length}
        />
        <DetailInfoSlippageTolerance
          customLabel={t`Additional slippage tolerance:`}
          maxSlippage={maxSlippage}
          stateKey={`${rChainId}-${rPoolId}`}
        />
      </div>

      <TransferActions>
        <Stepper steps={steps} />
        <AlertFormError
          errorKey={
            (
              detailsState.error ||
              estGasState.error ||
              enabledApprove.error ||
              enabledWithdraw.error ||
              approveError ||
              withdrawError
            )?.message ?? ''
          }
        />
        <AlertSlippage />
        {(!!approveData || !!withdrawData) && (
          <div>
            <TxInfoBars data={approveData} error={approveError} scanTxPath={scanTxPath} />
            <TxInfoBars data={withdrawData} error={withdrawError} label={t`withdraw`} scanTxPath={scanTxPath} />
          </div>
        )}
      </TransferActions>
    </FormWithdrawContext.Provider>
  )
}

const StyledSelectionContent = styled.div`
  margin-top: var(--spacing-normal);
`

const TokensSelectorWrapper = styled.div`
  padding: var(--spacing-narrow);
  background-color: var(--box--primary--content--background-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--box--primary--content--shadow-color);
`

function updateAmounts({ idx: amountIdx, value }: { idx: number; value: string }, amounts: Amount[]) {
  return amounts.map((a, idx) => {
    if (idx === amountIdx) return { ...a, value }
    return { ...a }
  })
}

export default FormWithdraw
