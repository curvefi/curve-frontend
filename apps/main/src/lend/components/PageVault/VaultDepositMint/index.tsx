import type { FormValues, FormStatus, StepKey } from '@/lend/components/PageVault/VaultDepositMint/types'
import type { Step } from '@ui/Stepper/types'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'

import { _getMaxActiveKey, _isDeposit } from '@/lend/store/createVaultDepositMintSlice'
import { formatNumber } from '@ui/utils'
import { getActiveStep } from '@ui/Stepper/helpers'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useMarketAlert from '@/lend/hooks/useMarketAlert'
import useStore from '@/lend/store/useStore'

import { StyledDetailInfoWrapper, StyledInpChip } from '@/lend/components/PageLoanManage/styles'
import AlertBox from '@ui/AlertBox'
import AlertFormError from '@/lend/components/AlertFormError'
import Box from '@ui/Box'
import DetailInfo from '@ui/DetailInfo'
import DetailInfoRate from '@/lend/components/DetailInfoRate'
import DetailInfoEstimateGas from '@/lend/components/DetailInfoEstimateGas'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'
import LoanFormConnect from '@/lend/components/LoanFormConnect'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { Api, PageContentProps } from '@/lend/types/lend.types'

const VaultDepositMint = ({ rChainId, rOwmId, rFormType, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)
  const marketAlert = useMarketAlert(rChainId, rOwmId)

  const activeKey = useStore((state) => state.vaultDepositMint.activeKey)
  const formEstGas = useStore((state) => state.vaultDepositMint.formEstGas[activeKey])
  const formStatus = useStore((state) => state.vaultDepositMint.formStatus)
  const formValues = useStore((state) => state.vaultDepositMint.formValues)
  const detailInfo = useStore((state) => state.vaultDepositMint.detailInfo[activeKey])
  const maxActiveKey = _getMaxActiveKey(rChainId, rFormType, market)
  const maxResp = useStore((state) => state.vaultDepositMint.max[maxActiveKey])
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.vaultDepositMint.fetchStepApprove)
  const fetchStepDepositMint = useStore((state) => state.vaultDepositMint.fetchStepDepositMint)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.vaultDepositMint.setFormValues)
  const resetState = useStore((state) => state.vaultDepositMint.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)
  const { borrowed_token } = market ?? {}

  const { signerAddress } = api ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(rChainId, rFormType, isLoaded ? api : null, market, updatedFormValues)
    },
    [api, isLoaded, market, rChainId, rFormType, setFormValues],
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)
    },
    [updateFormValues],
  )

  const handleInpAmountChange = (amount: string) => {
    reset({ amount })
  }

  const handleBtnClickDeposit = useCallback(
    async (
      payloadActiveKey: string,
      rFormType: string,
      api: Api,
      market: OneWayMarketTemplate,
      formValues: FormValues,
    ) => {
      const { chainId } = api
      const { amount } = formValues

      const notifyMessage = t`deposit ${amount} ${borrowed_token?.symbol}`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepDepositMint(payloadActiveKey, rFormType, api, market, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={networks[chainId].scanTxPath(resp.hash)}
            onClose={() => reset({})}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, borrowed_token?.symbol, fetchStepDepositMint, notifyNotification, reset],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      rFormType: string,
      api: Api,
      market: OneWayMarketTemplate,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { signerAddress } = api
      const { amount, amountError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const { symbol } = market.borrowed_token
      const isValid = !!signerAddress && +amount > 0 && !amountError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${symbol}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, rFormType, api, market, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        DEPOSIT_MINT: {
          key: 'DEPOSIT_MINT',
          status: helpers.getStepStatus(isComplete, step === 'DEPOSIT_MINT', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Deposited` : t`Deposit`,
          onClick: async () => handleBtnClickDeposit(payloadActiveKey, rFormType, api, market, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['DEPOSIT_MINT'] : ['APPROVAL', 'DEPOSIT_MINT']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickDeposit, notifyNotification],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  useEffect(() => {
    if (isLoaded) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && market && rFormType) {
      const updatedSteps = getSteps(activeKey, rFormType, api, market, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  return (
    <>
      <div>
        {/* input amount */}
        <Box grid gridRowGap={1}>
          <InputProvider
            grid
            gridTemplateColumns="1fr auto"
            padding="4px 8px"
            inputVariant={formValues.amountError ? 'error' : undefined}
            disabled={disabled}
            id="amount"
          >
            <InputDebounced
              id="inpCollateral"
              type="number"
              labelProps={{
                label: t`${borrowed_token?.symbol} Avail.`,
                descriptionLoading: !!signerAddress && typeof userBalances === 'undefined',
                description: formatNumber(userBalances?.borrowed, { defaultValue: '-' }),
              }}
              value={formValues.amount}
              onChange={handleInpAmountChange}
            />
            <InputMaxBtn
              onClick={() => {
                const userBorrowedBal = userBalances?.borrowed ?? ''
                const max = maxResp?.max ?? ''
                handleInpAmountChange(+userBorrowedBal < +max ? userBorrowedBal : max)
              }}
            />
          </InputProvider>
          <InpChipUsdRate address={borrowed_token?.address} amount={formValues.amount} />
          {formValues.amountError === 'too-much-wallet' ? (
            <StyledInpChip size="xs" isDarkBg isError>
              {t`Amount > wallet balance`} {formatNumber(userBalances?.borrowed ?? '')}
            </StyledInpChip>
          ) : formValues.amountError === 'too-much-max' ? (
            <StyledInpChip size="xs" isDarkBg isError>
              {t`Amount > max deposit amount`} {formatNumber(maxResp?.max ?? '')}
            </StyledInpChip>
          ) : (
            <StyledInpChip size="xs" isDarkBg>
              {t`Max`} {_isDeposit(rFormType) ? t`deposit` : t`mint`}{' '}
              {formatNumber(maxResp?.max, { defaultValue: '-' })}
            </StyledInpChip>
          )}
        </Box>
      </div>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {/* preview */}
        <DetailInfo
          loading={
            !!signerAddress && typeof detailInfo === 'undefined' && +formValues.amount > 0 && !formValues.amountError
          }
          loadingSkeleton={[100, 20]}
          label={t`Expected vault shares:`}
        >
          <strong>{formatNumber(detailInfo?.preview, { defaultValue: '-' })}</strong>
        </DetailInfo>
        <DetailInfoRate isBorrow={false} rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />

        {signerAddress && (
          <DetailInfoEstimateGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </StyledDetailInfoWrapper>

      {marketAlert && <AlertBox alertType={marketAlert.alertType}>{marketAlert.message}</AlertBox>}

      {/* actions */}
      {!marketAlert?.isDisableDeposit && (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
          {formStatus.error ? <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({})} /> : null}
          {txInfoBar}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </>
  )
}

export default VaultDepositMint
