import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanSwap/types'
import type { FormEstGas, PageLoanManageProps } from '@/components/PageLoanManage/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/store/createLoanSwap'
import { DEFAULT_FORM_EST_GAS } from '@/components/PageLoanManage/utils'
import { DEFAULT_WALLET_BALANCES } from '@/components/LoanInfoUser/utils'
import { curveProps } from '@/utils/helpers'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getStepStatus, getTokenName } from '@/utils/utilsLoan'
import { formatNumber } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledInpChip } from '@/components/PageLoanManage/styles'
import Box from '@/ui/Box'
import DetailInfoComp from '@/ui/DetailInfo'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'
import { getItemsName } from '@/components/PageLoanManage/LoanSwap/utils'
import AlertFormError from '@/components/AlertFormError'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

interface Props extends Pick<PageLoanManageProps, 'curve' | 'llamma' | 'llammaId' | 'rChainId'> {}

// swap wallet balances stablecoin and collateral
const Swap = ({ curve, llamma, llammaId, rChainId }: Props) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanSwap.activeKey)
  const detailInfo = useStore((state) => state.loanSwap.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanSwap.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanSwap.formStatus)
  const formValues = useStore((state) => state.loanSwap.formValues)
  const maxSwappableActiveKey = useStore((state) => state.loanSwap.maxSwappableActiveKey)
  const maxSwappable = useStore((state) => state.loanSwap.maxSwappable[maxSwappableActiveKey] ?? '')
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )

  const init = useStore((state) => state.loanSwap.init)
  const fetchMaxSwappable = useStore((state) => state.loanSwap.fetchMaxSwappable)
  const fetchStepApprove = useStore((state) => state.loanSwap.fetchStepApprove)
  const fetchStepSwap = useStore((state) => state.loanSwap.fetchStepSwap)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanSwap.setFormValues)
  const setStateByKey = useStore((state) => state.loanSwap.setStateByKey)
  const resetState = useStore((state) => state.loanSwap.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { chainId, haveSigner } = curveProps(curve)

  const updateFormValues = useCallback(
    (updatedFormValues: FormValues) => {
      if (chainId && llamma) {
        setFormValues(chainId, llamma, updatedFormValues, maxSlippage)
      }
    },
    [chainId, llamma, maxSlippage, setFormValues],
  )

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setTxInfoBar(null)

      if (isErrorReset || isFullReset) {
        setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved })
      }
    },
    [formStatus, setStateByKey],
  )

  const handleInpChange = (val: string, inpNum: 0 | 1) => {
    reset(false, formStatus.isComplete)

    const updatedFormValues = {
      ...formValues,
      item1: inpNum === 0 ? val : '',
      item1Error: '',
      item2: inpNum === 1 ? val : '',
      item2Error: '',
    }
    updateFormValues(updatedFormValues)
  }

  const handleBtnClickSwapCoins = () => {
    if (chainId && llamma) {
      const updatedFormValues = { ...DEFAULT_FORM_VALUES }
      updatedFormValues.item1Key = formValues.item2Key
      updatedFormValues.item1 = formValues.item2 ?? detailInfo.amount
      updatedFormValues.item2Key = formValues.item1Key

      fetchMaxSwappable(chainId, llamma, updatedFormValues)
      updateFormValues(updatedFormValues)
    }
  }

  const handleBtnClickSwap = useCallback(
    async (payloadActiveKey: string, curve: Curve, llamma: Llamma, formValues: FormValues, maxSlippage: string) => {
      const { item1Name } = getItemsName(llamma, formValues)
      const swapAmount = formValues.item1 === '' ? detailInfo.amount : formValues.item1
      const notifyMessage = t`Please confirm swapping ${swapAmount} ${item1Name} at max ${maxSlippage} slippage.`
      const notify = notifyNotification(notifyMessage, 'pending')

      const resp = await fetchStepSwap(
        payloadActiveKey,
        curve,
        llamma,
        { ...formValues, item1: swapAmount },
        maxSlippage,
      )

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        setTxInfoBar(
          <TxInfoBar
            description={t`Transaction complete`}
            txHash={networks[rChainId].scanTxPath(resp.hash)}
            onClose={() => reset(false, true)}
          />,
        )
      }
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, detailInfo.amount, fetchStepSwap, notifyNotification, rChainId, reset],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: Curve,
      llamma: Llamma,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      maxSlippage: string,
      steps: Step[],
    ) => {
      const { item1, item1Error, item2, item2Error } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const haveItem1 = !!item1 && +item1 > 0
      const haveItem2 = !!item2 && +item2 > 0
      const haveItem = haveItem1 || haveItem2
      const isValid = !!curve.signerAddress && !formEstGas.loading && haveItem && !item1Error && !item2Error && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const { item1Name } = getItemsName(llamma, formValues)
            const swapAmount = formValues.item1 === '' ? detailInfo.amount : formValues.item1
            const notifyMessage = t`Please approve spending your ${item1Name}.`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(activeKey, curve, llamma, { ...formValues, item1: swapAmount }, maxSlippage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        SWAP: {
          key: 'SWAP',
          status: getStepStatus(isComplete, step === 'SWAP', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Swapped` : t`Swap`,
          onClick: () => handleBtnClickSwap(activeKey, curve, llamma, formValues, maxSlippage),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['SWAP'] : ['APPROVAL', 'SWAP']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [detailInfo?.amount, fetchStepApprove, handleBtnClickSwap, notifyNotification],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  // init
  useMemo(() => {
    if (chainId && llamma) {
      init(chainId, llamma)
    }
  }, [chainId, init, llamma])

  // steps
  useEffect(() => {
    if (curve && llamma) {
      const updatedSteps = getSteps(activeKey, curve, llamma, formEstGas, formStatus, formValues, maxSlippage, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llamma?.id, curve?.chainId, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disabled = !chainId || !llamma || formStatus.isInProgress
  const collateralLabelValue = formatNumber(userWalletBalances.collateral)
  const collateralLabel = t`${getTokenName(llamma).collateral} Avail. ${collateralLabelValue}`
  const userStablecoinBalance = formatNumber(userWalletBalances.stablecoin)
  const stablecoinLabel = t`${getTokenName(llamma).stablecoin} Avail. $${userStablecoinBalance}`

  return (
    <>
      <Box grid gridRowGap={2}>
        <Box grid gridRowGap={1}>
          {/* input item1 */}
          <InputProvider
            grid
            gridTemplateColumns="1fr auto"
            padding="4px 8px"
            inputVariant={formValues.item1Error ? 'error' : undefined}
            disabled={disabled}
            id="item1Key"
          >
            <InputDebounced
              id="inpItem1Key"
              type="number"
              labelProps={{
                label: formValues.item1Key === '0' ? stablecoinLabel : collateralLabel,
              }}
              delay={700}
              value={formValues.item1 || detailInfo.amount}
              onChange={(val) => handleInpChange(val, 0)}
            />
            <InputMaxBtn onClick={() => handleInpChange(maxSwappable, 0)} />
          </InputProvider>
          {formValues.item1Error ? (
            <StyledInpChip isError size="xs">
              Amount cannot be greater than {maxSwappable}
            </StyledInpChip>
          ) : (
            <StyledInpChip size="xs">
              Max swappable{' '}
              {maxSlippage
                ? formValues.item1Key === '0'
                  ? formatNumber(maxSwappable)
                  : formatNumber(maxSwappable)
                : '-'}
            </StyledInpChip>
          )}

          <Box flex flexJustifyContent="center">
            <IconButton onClick={handleBtnClickSwapCoins} size="medium">
              <Icon name="ArrowsVertical" size={24} aria-label="icon arrow vertical" />
            </IconButton>
          </Box>
        </Box>

        <InputProvider
          grid
          padding="4px 8px"
          inputVariant={formValues.item2Error ? 'error' : undefined}
          disabled={disabled}
          id="item2Key"
        >
          <InputDebounced
            id="inpItem2Key"
            type="number"
            labelProps={{
              label: formValues.item2Key === '1' ? collateralLabel : stablecoinLabel,
            }}
            delay={700}
            value={formValues.item2 || detailInfo.amount}
            onChange={(val) => handleInpChange(val, 1)}
          />
        </InputProvider>
      </Box>

      {/* detail info */}
      <div>
        <DetailInfoComp loading={detailInfo.loading} loadingSkeleton={[85, 16]} label={t`Price impact:`}>
          {detailInfo.swapPriceImpact}
        </DetailInfoComp>
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
        <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
      </div>

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default Swap
