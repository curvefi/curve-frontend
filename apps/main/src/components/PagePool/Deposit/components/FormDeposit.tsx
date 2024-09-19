import type { DepositFormValues } from '@/entities/deposit'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'

import {
  useApproveDeposit,
  useDeposit,
  useDepositBalancedAmounts,
  useDepositDetails,
  useDepositEstGasApproval,
} from '@/entities/deposit'
import { DepositContext } from '@/components/PagePool/Deposit/contextDeposit'
import { calcNewCrvApr } from '@/components/PagePool/Deposit/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getMutationStepLabel, getMutationStepStatus, showStepApprove } from '@/components/PagePool/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { usePoolSeedAmounts } from '@/entities/pool'
import usePoolTotalStaked from '@/hooks/usePoolTotalStaked'
import useStore from '@/store/useStore'

import { FieldsWrapper } from '@/components/PagePool/styles'
import { TxInfoBars } from '@/ui/TxInfoBar'
import AlertFormError from '@/components/AlertFormError'
import AlertPool from '@/components/PagePool/components/AlertPool'
import AlertSlippage from '@/components/PagePool/components/AlertSlippage'
import CheckboxBalancedAmounts from '@/components/PagePool/Deposit/components/CheckboxBalancedAmounts'
import CheckboxIsWrapped from '@/components/PagePool/Deposit/components/CheckboxIsWrapped'
import DetailsInfoEstGas from '@/components/PagePool/components/DetailsInfoEstGas'
import DetailInfoEstLpTokens from '@/components/PagePool/components/DetailInfoEstLpTokens'
import DetailInfoExpectedApy from '@/components/PagePool/components/DetailInfoExpectedApy'
import DetailInfoSlippage from '@/components/PagePool/components/DetailInfoSlippage'
import DetailInfoSlippageTolerance from '@/components/PagePool/components/DetailInfoSlippageTolerance'
import FieldsAmount from '@/components/PagePool/Deposit/components/FieldsAmount'
import HighSlippagePriceImpactModal from '@/components/PagePool/components/WarningModal'
import Stepper from '@/ui/Stepper'
import TransferActions from '@/components/PagePool/components/TransferActions'

type Props = {
  formType: 'DEPOSIT' | 'DEPOSIT_STAKE'
}

const FormDeposit: React.FC<Props> = ({ formType }) => {
  const {
    rChainId,
    rPoolId,
    chainId,
    signerAddress,
    maxSlippage,
    isWrapped,
    poolBaseKeys,
    poolBaseSignerKeys,
    pool,
    poolId,
    signerPoolBalances,
    isSeed,
    tokens,
    scanTxPath,
  } = usePoolContext()

  const { gaugeTotalSupply } = usePoolTotalStaked(pool) ?? {}

  const crvApr = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId]?.crv?.[0])

  const [formValues, setFormValues] = useState<DepositFormValues>({
    amount: null,
    amounts: tokens.map(({ symbol: token, address: tokenAddress }) => ({ token, tokenAddress, value: '', error: '' })),
    amountsError: '',
    isBalancedAmounts: false,
    apiError: '',
  })

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])

  const { amounts, amountsError, isBalancedAmounts, apiError } = formValues

  const firstAmount = amounts[0]?.value
  const detailsAmounts = isSeed ? (amounts.some((a) => a.value === '') ? [] : amounts) : amounts
  const isInProgress = useMemo(() => steps.some(({ status }) => status === 'in-progress'), [steps])

  const { data: seedAmounts } = usePoolSeedAmounts({
    ...poolBaseKeys,
    isSeed,
    firstAmount: formValues.amounts?.[0]?.value,
    useUnderlying: !isWrapped,
  })

  const {
    data: { expected = '', isBonus = false, isHighSlippage = false, slippage = 0, virtualPrice = '' } = {},
    ...detailsState
  } = useDepositDetails({
    ...poolBaseKeys,
    isInProgress,
    formType,
    amounts: detailsAmounts,
    isSeed,
    isWrapped,
    maxSlippage,
  })

  const newCrvApr = useMemo(() => {
    if (formType === 'DEPOSIT') return null
    return calcNewCrvApr(crvApr, expected, gaugeTotalSupply)
  }, [crvApr, expected, formType, gaugeTotalSupply])
  const showAprChange = Number(crvApr) > 0 && newCrvApr !== null && newCrvApr.ratio > 1.25

  const { data: { estimatedGas = null, isApproved = false } = {}, ...estGasApprovalState } = useDepositEstGasApproval({
    ...poolBaseSignerKeys,
    isInProgress,
    formType,
    amounts: detailsAmounts,
    amountsError,
    isWrapped,
  })

  const { data: balancedAmounts, ...balancedAmountsState } = useDepositBalancedAmounts({
    ...poolBaseKeys,
    isBalancedAmounts,
    isWrapped,
  })

  const actionParams = {
    ...poolBaseSignerKeys,
    formType,
    amounts,
    amountsError,
    isWrapped,
    isLoadingDetails: estGasApprovalState.isFetching || detailsState.isFetching,
    isApproved,
  }

  const {
    enabled: enabledApprove,
    mutation: {
      mutate: approve,
      data: approveData,
      status: approveStatus,
      error: approveError,
      reset: approveReset,
      ...approveState
    },
  } = useApproveDeposit(actionParams)

  const {
    enabled: enabledDeposit,
    mutation: {
      mutate: deposit,
      data: depositData,
      status: depositStatus,
      error: depositError,
      reset: depositReset,
      ...depositState
    },
  } = useDeposit({ ...actionParams, maxSlippage })

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<DepositFormValues>) => {
      approveReset()
      depositReset()
      setSlippageConfirmed(false)

      setFormValues((prevFormValues) => {
        let all: DepositFormValues = { ...prevFormValues, apiError: '', amountsError: '', ...updatedFormValues }

        all.amounts = all.amounts.map((a, idx) => {
          let amount = { ...a }

          if (updatedFormValues.amount && updatedFormValues.amount.idx === idx) {
            amount.value = updatedFormValues.amount.value
          }

          const amountBalance = signerPoolBalances?.[a.tokenAddress] ?? ''
          amount.error = signerAddress ? (Number(amount.value) > Number(amountBalance) ? 'too-much' : '') : ''
          return amount
        })

        const amountsWithError = all.amounts.filter((a) => !!a.error).map((a) => a.token)
        let amountsError = ''
        if (amountsWithError.length > 1) amountsError = t`Not enough balances for ${amountsWithError.join(', ')}.`
        if (amountsWithError.length === 1) amountsError = t`Not enough balance for ${amountsWithError[0]}.`
        return { ...all, amount: null, amountsError }
      })
    },
    [approveReset, depositReset, signerAddress, signerPoolBalances]
  )

  // seed amounts
  useEffect(() => {
    if (!isSeed || Number(firstAmount) === 0 || !seedAmounts?.length) return

    updateFormValues({
      amounts: seedAmounts.map(({ amount, ...rest }) => ({
        ...rest,
        value: amount,
        error: '',
      })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstAmount, isSeed, seedAmounts])

  // update form with wrapped or underlying tokens
  useEffect(() => {
    if (tokens.length === 0) return

    updateFormValues({
      amount: null,
      amounts: tokens.map(({ symbol, address }, idx) => {
        const currAmount = amounts[idx]?.value ?? ''
        const showBalancedAmount = isBalancedAmounts && !!balancedAmounts?.length
        return {
          token: symbol,
          tokenAddress: address,
          value: showBalancedAmount ? balancedAmounts[idx] : Number(currAmount) > 0 ? currAmount : '',
          error: '',
        }
      }),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, isBalancedAmounts, balancedAmounts])

  const resetForm = useCallback(() => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      amount: null,
      amounts: prevFormValues.amounts.map((a) => ({ ...a, value: '', error: '' })),
      isBalancedAmounts: false,
    }))
  }, [])

  useEffect(() => {
    if (!balancedAmountsState.error) return

    updateFormValues({ apiError: `${t`Unable to get balanced proportion:`} ${balancedAmountsState.error.message}` })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balancedAmountsState.error])

  // reset form if signerAddress changed
  useEffect(() => {
    resetForm()
  }, [resetForm, signerAddress])

  // reset form after deposit
  useEffect(() => {
    if (depositState.isSuccess) resetForm()
  }, [resetForm, depositState.isSuccess])

  // reset confirm slippage
  useEffect(() => {
    if (depositState.isError) setSlippageConfirmed(false)
  }, [depositState.isError])

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
      formType,
      amounts,
      amountsError,
      isLoadingDetails: false,
      isWrapped,
    }

    const APPROVAL: Step = {
      key: 'APPROVAL',
      status: getMutationStepStatus(enabledApprove.enabled, approveStatus),
      type: 'action',
      content: getMutationStepLabel(true, approveStatus),
      onClick: () => {
        approveReset()
        approve({ ...actionParams, isApproved: false })
      },
    }

    const onClick = () => {
      depositReset()
      deposit({ ...actionParams, isApproved: true, maxSlippage })
    }

    const SUBMIT: Step = {
      key: formType,
      status: getMutationStepStatus(enabledDeposit.enabled, depositStatus),
      type: 'action',
      content: `${formType === 'DEPOSIT' ? t`Deposit` : t`Deposit & Stake`} ${getMutationStepLabel(
        false,
        depositStatus
      )}`,
      ...(isHighSlippage
        ? {
            modal: {
              title: t`Warning!`,
              content: (
                <HighSlippagePriceImpactModal
                  slippage
                  confirmed={slippageConfirmed}
                  value={slippage || 0}
                  transferType="Deposit"
                  setConfirmed={setSlippageConfirmed}
                />
              ),
              isDismissable: false,
              cancelBtnProps: { label: t`Cancel`, onClick: () => setSlippageConfirmed(false) },
              primaryBtnProps: { onClick, disabled: !slippageConfirmed },
              primaryBtnLabel: 'Deposit anyway',
            },
          }
        : { onClick }),
    }

    const showApprove = showStepApprove(isApproved, approveData, depositData)
    setSteps(showApprove ? [APPROVAL, SUBMIT] : [SUBMIT])
  }, [
    amounts,
    amountsError,
    approve,
    approveData,
    approveReset,
    approveStatus,
    chainId,
    deposit,
    depositData,
    depositReset,
    depositStatus,
    enabledApprove.enabled,
    enabledDeposit.enabled,
    formType,
    isApproved,
    isHighSlippage,
    isSeed,
    isWrapped,
    maxSlippage,
    poolId,
    signerAddress,
    slippage,
    slippageConfirmed,
  ])

  return (
    <DepositContext.Provider
      value={{
        formValues,
        isDisabled:
          approveState.isPending || depositState.isPending || isSeed === null || balancedAmountsState.isFetching,
        isLoading: isSeed === null || balancedAmountsState.isFetching,
        updateFormValues,
      }}
    >
      <FieldsWrapper>
        <FieldsAmount estimatedGas={estimatedGas} />
        <CheckboxBalancedAmounts />
        <CheckboxIsWrapped />
      </FieldsWrapper>

      <div>
        <DetailInfoEstLpTokens expected={expected} virtualPrice={virtualPrice} isLoading={detailsState.isFetching} />
        {showAprChange && <DetailInfoExpectedApy crvApr={crvApr} newCrvApr={newCrvApr} />}
        <DetailInfoSlippage
          isHighSlippage={isHighSlippage}
          isBonus={isBonus}
          slippage={slippage}
          isLoading={detailsState.isFetching}
        />
        <DetailsInfoEstGas
          isDivider
          activeStep={!!signerAddress ? getActiveStep(steps) : null}
          estimatedGas={estimatedGas}
          estimatedGasIsLoading={estGasApprovalState.isFetching}
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
            amountsError ||
            apiError ||
            ((enabledApprove.error || enabledDeposit.error || estGasApprovalState.error || approveError || depositError)
              ?.message ??
              '')
          }
        />
        <AlertPool />
        <AlertSlippage expected={expected} virtualPrice={virtualPrice} />
        {(!!approveData || !!depositData) && (
          <div>
            <TxInfoBars data={approveData} error={approveError} scanTxPath={scanTxPath} />
            <TxInfoBars
              label={formType === 'DEPOSIT' ? t`deposit` : t`deposit & stake`}
              data={depositData}
              error={depositError}
              scanTxPath={scanTxPath}
            />
          </div>
        )}
      </TransferActions>
    </DepositContext.Provider>
  )
}

export default FormDeposit
