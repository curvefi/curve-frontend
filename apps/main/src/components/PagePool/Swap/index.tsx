import type { SwapFormValues } from '@/entities/swap'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { SwapContext } from '@/components/PagePool/Swap/contextSwap'
import {
  useApproveSwap,
  useSwap,
  useSwapExchangeDetails,
  useSwapEstGasApproval,
  useSwapIgnoreExchangeRateCheck,
} from '@/entities/swap'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getMutationStepLabel, getMutationStepStatus, showStepApprove } from '@/components/PagePool/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useUsdRates } from '@/entities/usd-rates'
import useStore from '@/store/useStore'

import { FieldsWrapper } from '@/components/PagePool/styles'
import { TxInfoBars } from '@/ui/TxInfoBar'
import AlertPool from '@/components/PagePool/components/AlertPool'
import AlertFormError from '@/components/AlertFormError'
import AlertFormWarning from '@/components/AlertFormWarning'
import AlertSlippage from '@/components/AlertSlippage'
import Box from '@/ui/Box'
import BtnSwapTokens from '@/components/PagePool/Swap/components/BtnSwapTokens'
import CheckboxIsWrapped from '@/components/PagePool/Swap/components/CheckboxIsWrapped'
import DetailInfoPriceImpact from '@/components/PageRouterSwap/components/DetailInfoPriceImpact'
import DetailInfoExchangeRate from '@/components/PageRouterSwap/components/DetailInfoExchangeRate'
import DetailInfoSlippageTolerance from '@/components/PagePool/components/DetailInfoSlippageTolerance'
import DetailsInfoEstGas from '@/components/PagePool/components/DetailsInfoEstGas'
import FieldFrom from '@/components/PagePool/Swap/components/FieldFrom'
import FieldTo from '@/components/PagePool/Swap/components/FieldTo'
import Stepper from '@/ui/Stepper'
import TransferActions from '@/components/PagePool/components/TransferActions'
import WarningModal from '@/components/PagePool/components/WarningModal'

const Swap = () => {
  const {
    rChainId,
    rPoolId,
    chainId,
    poolId,
    isWrapped,
    isSeed,
    signerAddress,
    maxSlippage,
    poolBaseKeys,
    poolBaseSignerKeys,
    pool,
    poolTvl,
    signerPoolBalances,
    tokens,
    scanTxPath,
  } = usePoolContext()

  const hasRouter = useStore((state) => state.hasRouter)

  const [steps, setSteps] = useState<Step[]>([])
  const [confirmedLoss, setConfirmedLoss] = useState(false)
  const [formValues, setFormValues] = useState<SwapFormValues>({
    isFrom: null,
    fromAddress: '',
    fromToken: '',
    fromAmount: '',
    fromError: '',
    toAddress: '',
    toAmount: '',
    toError: '',
    toToken: '',
  })

  const { isFrom, fromToken, fromAddress, fromAmount, fromError, toToken, toAddress, toAmount, toError } = formValues

  const { data: usdRatesMapper } = useUsdRates({
    ...poolBaseKeys,
    addresses: [fromAddress, toAddress],
  })
  const toUsdRate = usdRatesMapper?.[toAddress]

  const { data: ignoreExchangeRateCheck } = useSwapIgnoreExchangeRateCheck(poolBaseKeys)

  const isInProgress = useMemo(() => steps.some(({ status }) => status === 'in-progress'), [steps])

  const {
    data: {
      exchangeRates = [],
      isHighImpact = false,
      priceImpact = null,
      fromAmount: expectedFromAmount = '',
      toAmount: expectedToAmount = '',
      modal = null,
      warning: exchangeWarning = '',
    } = {},
    ...exchangeDetailsState
  } = useSwapExchangeDetails({
    ...poolBaseKeys,
    isInProgress,
    isFrom,
    fromAmount,
    fromAddress,
    fromToken,
    toAddress,
    toAmount,
    toToken,
    isWrapped,
    maxSlippage,
    ignoreExchangeRateCheck,
    tokens,
  })

  const { data: { estimatedGas = null, isApproved = false } = {}, ...estGasApprovalState } = useSwapEstGasApproval({
    ...poolBaseSignerKeys,
    isInProgress,
    fromAddress,
    toAddress,
    fromAmount,
    isWrapped,
    maxSlippage,
  })

  const actionParams = {
    ...poolBaseSignerKeys,
    fromAmount,
    fromAddress,
    fromToken,
    fromError,
    toError,
    isWrapped,
    isLoadingDetails: exchangeDetailsState.isFetching || estGasApprovalState.isFetching,
    isApproved: isApproved,
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
  } = useApproveSwap(actionParams)

  const {
    enabled: enabledSwap,
    mutation: { mutate: swap, data: swapData, status: swapStatus, error: swapError, reset: swapReset, ...swapState },
  } = useSwap({ ...actionParams, toAddress, toToken, toAmount, maxSlippage })

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<SwapFormValues>) => {
      approveReset()
      swapReset()
      setConfirmedLoss(false)

      setFormValues((prevFormValues) => {
        const all = { ...prevFormValues, fromError: '', toError: '', ...updatedFormValues }
        const updatedFromBalance = signerPoolBalances?.[all.fromAddress] ?? ''

        // validation
        let fromError: SwapFormValues['fromError'] = ''
        if (signerAddress) fromError = Number(all.fromAmount) > Number(updatedFromBalance) ? 'too-much' : ''
        let toError: SwapFormValues['toError'] = Number(all.toAmount) > Number(poolTvl) ? 'too-much-reserves' : ''

        return { ...all, fromError, toError }
      })
    },
    [approveReset, swapReset, signerPoolBalances, poolTvl, signerAddress]
  )

  // switch between wrapped or underlying tokens
  useEffect(() => {
    if (tokens.length === 0) return

    const currTokens = isWrapped ? pool?.underlyingCoins : pool?.wrappedCoins
    if (!currTokens) return

    const fromIdx = fromToken ? currTokens.findIndex((token) => fromToken === token) : 0
    const toIdx = toToken ? currTokens.findIndex((token) => toToken === token) : 1

    const { symbol: updatedFromToken, address: updatedFromAddress } = tokens[fromIdx]
    const { symbol: updatedToToken, address: updatedToAddress } = tokens[toIdx]

    updateFormValues({
      fromToken: updatedFromToken,
      fromAddress: updatedFromAddress,
      fromAmount: isFrom ? fromAmount : '',
      toToken: updatedToToken,
      toAddress: updatedToAddress,
      toAmount: isFrom ? '' : toAmount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens])

  const resetForm = useCallback(() => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      fromAmount: '',
      toAmount: '',
    }))
  }, [])

  // update formValues based on exchange details
  useEffect(() => {
    if (!exchangeDetailsState.isSuccess) return

    isFrom ? updateFormValues({ toAmount: expectedToAmount }) : updateFormValues({ fromAmount: expectedFromAmount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeDetailsState.isSuccess, isFrom, expectedToAmount, expectedFromAmount])

  // reset form if signerAddress changed
  useEffect(() => {
    resetForm()
  }, [resetForm, signerAddress])

  // reset form after swap
  useEffect(() => {
    if (swapState.isSuccess) resetForm()
  }, [resetForm, swapState.isSuccess])

  // reset confirmation loss
  useEffect(() => {
    if (swapState.isError) setConfirmedLoss(false)
  }, [swapState.isError])

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
      fromAmount,
      fromAddress,
      fromToken,
      fromError,
      isWrapped,
      isLoadingDetails: false,
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
      swapReset()
      swap({ ...actionParams, isApproved: true, toAddress, toToken, toAmount, maxSlippage })
    }

    const SUBMIT: Step = {
      key: 'SUBMIT',
      status: getMutationStepStatus(enabledSwap.enabled, swapStatus),
      type: 'action',
      content: `${t`Swap`} ${getMutationStepLabel(false, swapStatus)}`,
      ...(!!modal
        ? {
            modal: {
              title: t`Warning!`,
              content: <WarningModal {...modal} confirmed={confirmedLoss} setConfirmed={setConfirmedLoss} />,
              cancelBtnProps: { label: t`Cancel`, onClick: () => setConfirmedLoss(false) },
              isDismissable: false,
              primaryBtnProps: { onClick, disabled: !confirmedLoss },
              primaryBtnLabel: 'Swap anyway',
            },
          }
        : { onClick }),
    }

    const showApproveAction = showStepApprove(isApproved, approveData, swapData)
    setSteps(showApproveAction ? [APPROVAL, SUBMIT] : [SUBMIT])
  }, [
    approve,
    approveData,
    approveReset,
    approveStatus,
    chainId,
    confirmedLoss,
    enabledApprove.enabled,
    enabledSwap.enabled,
    fromAddress,
    fromAmount,
    fromError,
    fromToken,
    isApproved,
    isSeed,
    isWrapped,
    maxSlippage,
    modal,
    poolId,
    signerAddress,
    swap,
    swapData,
    swapReset,
    swapStatus,
    toAddress,
    toAmount,
    toToken,
  ])

  return (
    <SwapContext.Provider
      value={{
        formValues,
        isDisabled: approveState.isPending || swapState.isPending || !hasRouter || isSeed === null || isSeed,
        isLoading: isSeed === null,
        updateFormValues,
      }}
    >
      <StyledFieldsWrapper>
        <FieldFrom
          estimatedGas={estimatedGas}
          estimatedGasIsLoading={estGasApprovalState.isFetching}
          usdRatesMapper={usdRatesMapper}
        />
        <BtnSwapTokens />
        <FieldTo usdRatesMapper={usdRatesMapper} />
        <CheckboxIsWrapped />
      </StyledFieldsWrapper>

      <Box>
        <DetailInfoExchangeRate
          exchangeRates={exchangeRates}
          loading={exchangeDetailsState.isFetching || exchangeDetailsState.isFetching}
        />
        <DetailInfoPriceImpact
          loading={exchangeDetailsState.isFetching || exchangeDetailsState.isFetching}
          priceImpact={priceImpact}
          isHighImpact={isHighImpact}
        />
        <DetailsInfoEstGas
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
      </Box>

      <TransferActions>
        <Stepper steps={steps} />
        <AlertFormError
          errorKey={
            (
              enabledApprove.error ||
              enabledSwap.error ||
              estGasApprovalState.error ||
              exchangeDetailsState.error ||
              approveError ||
              swapError
            )?.message ?? ''
          }
        />
        <AlertPool />
        <AlertSlippage
          maxSlippage={maxSlippage}
          usdAmount={
            !isUndefined(toUsdRate) && !isNaN(toUsdRate) ? (Number(toAmount) * Number(toUsdRate)).toString() : ''
          }
        />
        <AlertFormWarning errorKey={exchangeWarning} />
        {(!!approveData || !!swapData) && (
          <div>
            <TxInfoBars data={approveData} error={approveError} scanTxPath={scanTxPath} />
            <TxInfoBars data={swapData} error={swapError} label={t`swap`} scanTxPath={scanTxPath} />
          </div>
        )}
      </TransferActions>
    </SwapContext.Provider>
  )
}

const StyledFieldsWrapper = styled(FieldsWrapper)`
  margin-top: var(--spacing-normal);
`

export default Swap
