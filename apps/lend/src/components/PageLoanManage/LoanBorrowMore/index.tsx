import type { FormStatus, FormValues, StepKey } from '@/components/PageLoanManage/LoanBorrowMore/types'
import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_CONFIRM_WARNING, DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { NOFITY_MESSAGE, REFRESH_INTERVAL } from '@/constants'
import { _showNoLoanFound } from '@/utils/helpers'
import { formatNumber } from '@/ui/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

import { _parseValues, DEFAULT_FORM_VALUES } from '@/components/PageLoanManage/LoanBorrowMore/utils'
import { FieldsWrapper } from '@/components/SharedFormStyles/FieldsWrapper'
import { StyledDetailInfoWrapper } from '@/components/PageLoanManage/styles'
import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import AlertLoanSummary from '@/components/AlertLoanSummary'
import DetailInfo from '@/components/PageLoanManage/LoanBorrowMore/components/DetailInfo'
import DetailInfoLeverage from '@/components/PageLoanManage/LoanBorrowMore/components/DetailInfoLeverage'
import DialogFormWarning from '@/components/DialogFormWarning'
import InpToken from '@/components/InpToken'
import InpTokenBorrow from '@/components/InpTokenBorrow'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Api, PageContentProps, HealthMode } from '@/types/lend.types'

const LoanBorrowMore = ({
  rChainId,
  rOwmId,
  isLeverage = false,
  isLoaded,
  api,
  market,
  userActiveKey,
}: PageContentProps & { isLeverage?: boolean }) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanBorrowMore.activeKey)
  const activeKeyMax = useStore((state) => state.loanBorrowMore.activeKeyMax)
  const detailInfoLeverage = useStore((state) => state.loanBorrowMore.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanBorrowMore.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanBorrowMore.formStatus)
  const formValues = useStore((state) => state.loanBorrowMore.formValues)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)
  const maxRecv = useStore((state) => state.loanBorrowMore.maxRecv[activeKeyMax])
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const fetchStepApprove = useStore((state) => state.loanBorrowMore.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanBorrowMore.fetchStepIncrease)
  const refetchMaxRecv = useStore((state) => state.loanBorrowMore.refetchMaxRecv)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanBorrowMore.setFormValues)
  const resetState = useStore((state) => state.loanBorrowMore.resetState)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const [{ isConfirming, confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}
  const { expectedCollateral } = detailInfoLeverage ?? {}

  const updateFormValues = useCallback(
    (
      updatedFormValues: Partial<FormValues>,
      updatedMaxSlippage?: string,
      isFullReset?: boolean,
      shouldRefetch?: boolean,
    ) => {
      setConfirmWarning(DEFAULT_CONFIRM_WARNING)
      setFormValues(
        isLoaded ? api : null,
        market,
        isFullReset ? DEFAULT_FORM_VALUES : updatedFormValues,
        updatedMaxSlippage ?? maxSlippage,
        isLeverage,
        shouldRefetch,
      )

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [api, isLeverage, isLoaded, maxSlippage, market, setFormValues],
  )

  const handleBtnClickBorrow = useCallback(
    async (
      payloadActiveKey: string,
      api: Api,
      formValues: FormValues,
      market: OneWayMarketTemplate,
      maxSlippage: string,
      isLeverage: boolean,
    ) => {
      const { chainId } = api

      const notify = notifyNotification(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepIncrease(payloadActiveKey, api, market, formValues, maxSlippage, isLeverage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={networks[chainId].scanTxPath(resp.hash)}
            onClose={() => updateFormValues({}, '', true, true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepIncrease, notifyNotification, updateFormValues],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      market: OneWayMarketTemplate,
      healthMode: HealthMode,
      confirmedWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      maxSlippage: string,
      isLeverage: boolean,
      priceImpact: string,
      steps: Step[],
    ) => {
      const { signerAddress } = api
      const { collateral_token, borrowed_token } = market
      const { debt, userCollateral } = formValues
      const { error, isApproved, isApprovedCompleted, isComplete, isInProgress, step } = formStatus
      const { haveValues, haveDebt, haveFormErrors, getStepTokensStr } = _parseValues(formValues)

      const isValid = !!signerAddress && !haveFormErrors && !formEstGas?.loading && !error && !!healthMode.percent

      if (haveDebt) {
        const debtStr = `${debt} ${market.borrowed_token.symbol}`
        const tokensMessage = getStepTokensStr(formValues, market).symbolAndAmountList
        const notifyMessage = isLeverage
          ? haveValues
            ? t`Borrow additional ${debtStr}, deposit ${tokensMessage} at max slippage ${maxSlippage}%.`
            : t`Borrow additional ${debtStr}`
          : haveValues
            ? t`Borrow additional ${debtStr}, deposit ${tokensMessage}.`
            : t`Borrow additional ${debtStr}`

        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertLoanSummary
              pendingMessage={notifyMessage}
              market={market}
              receive={expectedCollateral?.totalCollateral ?? userCollateral}
              formValueStateDebt={debt}
              userState={userLoanDetails?.state}
              userWallet={userBalances}
              type="change"
            />
          </AlertBox>,
        )
      } else if (!isComplete) {
        setTxInfoBar(null)
      }

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid && haveValues),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const tokensMessage = getStepTokensStr(formValues, market).symbolList
            const notifyMessage = t`Please approve spending of ${tokensMessage}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, market, formValues, maxSlippage, isLeverage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        BORROW_MORE: {
          key: 'BORROW_MORE',
          status: helpers.getStepStatus(isComplete, step === 'BORROW_MORE', isValid && isApproved && haveDebt),
          type: 'action',
          content: formStatus.isComplete ? t`Borrowed` : t`Borrow More`,
          ...(healthMode.message || priceImpact
            ? {
                modal: {
                  isDismissable: false,
                  initFn: () => setConfirmWarning({ isConfirming: true, confirmedWarning: false }),
                  title: t`Warning!`,
                  content: (
                    <DialogFormWarning
                      health={healthMode.message ? healthMode : null}
                      priceImpact={
                        priceImpact
                          ? {
                              priceImpact,
                              swapTo: borrowed_token.symbol,
                              swapFrom: collateral_token.symbol,
                            }
                          : null
                      }
                      confirmed={confirmedWarning}
                      setConfirmed={(val) =>
                        setConfirmWarning({ isConfirming: false, confirmedWarning: val as boolean })
                      }
                    />
                  ),
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmWarning(DEFAULT_CONFIRM_WARNING),
                  },
                  primaryBtnProps: {
                    onClick: () =>
                      handleBtnClickBorrow(payloadActiveKey, api, formValues, market, maxSlippage, isLeverage),
                    disabled: !confirmedWarning,
                  },
                  primaryBtnLabel: t`Borrow more anyway`,
                },
              }
            : {
                onClick: async () =>
                  handleBtnClickBorrow(payloadActiveKey, api, formValues, market, maxSlippage, isLeverage),
              }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved && !isApprovedCompleted ? ['BORROW_MORE'] : ['APPROVAL', 'BORROW_MORE']
      }
      return stepsKey.map((k) => stepsObj[k])
    },
    [
      expectedCollateral?.totalCollateral,
      userLoanDetails?.state,
      userBalances,
      notifyNotification,
      fetchStepApprove,
      handleBtnClickBorrow,
    ],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  usePageVisibleInterval(
    () => {
      if (
        isLoaded &&
        isPageVisible &&
        isLeverage &&
        !formStatus.isComplete &&
        !formStatus.step &&
        !formStatus.error &&
        !isConfirming
      ) {
        updateFormValues({})
      }
    },
    REFRESH_INTERVAL['10s'],
    isPageVisible,
  )

  useEffect(() => {
    if (isLoaded) {
      resetState()
      updateFormValues({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // form changed to leverage, reset form
  useEffect(() => {
    if (isLoaded) updateFormValues(DEFAULT_FORM_VALUES, '', true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeverage])

  // steps
  useEffect(() => {
    if (isLoaded && api && market) {
      const updatedSteps = getSteps(
        activeKey,
        api,
        market,
        healthMode,
        confirmedWarning,
        formEstGas,
        formStatus,
        formValues,
        maxSlippage,
        isLeverage,
        detailInfoLeverage?.isHighPriceImpact ? detailInfoLeverage.priceImpact : '',
        steps,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    activeKey,
    confirmedWarning,
    expectedCollateral?.totalCollateral,
    userLoanDetails?.state,
    userBalances,
    detailInfoLeverage?.expectedCollateral,
    detailInfoLeverage?.isHighPriceImpact,
    healthMode?.percent,
    formEstGas?.loading,
    formStatus,
    formValues,
  ])

  useEffect(() => {
    if (isLoaded) updateFormValues({}, maxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  const detailInfoProps = {
    rChainId,
    rOwmId,
    api,
    market,
    activeKey,
    activeStep,
    healthMode,
    isLoaded,
    steps,
    userActiveKey,
    setHealthMode,
  }

  return (
    <>
      <FieldsWrapper $showBorder={isLeverage}>
        <InpToken
          id="userCollateral"
          inpTopLabel={t`Add from wallet:`}
          inpError={formValues.userCollateralError}
          inpDisabled={disabled}
          inpLabelLoading={!!signerAddress && typeof userBalances?.collateral === 'undefined'}
          inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
          inpValue={formValues.userCollateral}
          tokenAddress={market?.collateral_token?.address}
          tokenSymbol={market?.collateral_token?.symbol}
          tokenBalance={userBalances?.collateral}
          handleInpChange={(userCollateral) => updateFormValues({ userCollateral })}
          handleMaxClick={() => updateFormValues({ userCollateral: userBalances?.collateral ?? '' })}
        />

        {isLeverage && (
          <InpToken
            id="userBorrowed"
            inpError={formValues.userBorrowedError}
            inpDisabled={disabled}
            inpLabelLoading={!!signerAddress && typeof userBalances?.borrowed === 'undefined'}
            inpLabelDescription={formatNumber(userBalances?.borrowed, { defaultValue: '-' })}
            inpValue={formValues.userBorrowed}
            tokenAddress={market?.borrowed_token?.address}
            tokenSymbol={market?.borrowed_token?.symbol}
            tokenBalance={userBalances?.borrowed}
            handleInpChange={(userBorrowed) => updateFormValues({ userBorrowed })}
            handleMaxClick={() => updateFormValues({ userBorrowed: userBalances?.borrowed ?? '' })}
          />
        )}
      </FieldsWrapper>

      <InpTokenBorrow
        id="debt"
        inpTopLabel={t`Borrow amount:`}
        inpError={formValues.debtError}
        inpDisabled={disabled}
        inpValue={formValues.debt}
        tokenAddress={market?.borrowed_token?.address}
        tokenSymbol={market?.borrowed_token?.symbol}
        maxRecv={maxRecv}
        handleInpChange={(debt) => updateFormValues({ debt })}
        handleMaxClick={async () => {
          const debt = await refetchMaxRecv(market, isLeverage)
          updateFormValues({ debt })
        }}
      />

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isLeverage ? <DetailInfoLeverage {...detailInfoProps} /> : <DetailInfo {...detailInfoProps} />}
      </StyledDetailInfoWrapper>

      {/* actions */}
      {_showNoLoanFound(signerAddress, formStatus.isComplete, loanExists) ? (
        <AlertNoLoanFound owmId={rOwmId} />
      ) : (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!isLoaded}>
          {txInfoBar}
          {healthMode.message && <AlertBox alertType="warning">{healthMode.message}</AlertBox>}
          {(formStatus.error || formStatus.stepError) && (
            <AlertFormError
              limitHeight
              errorKey={formStatus.error || formStatus.stepError}
              handleBtnClose={() => updateFormValues({})}
            />
          )}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </>
  )
}

export default LoanBorrowMore
