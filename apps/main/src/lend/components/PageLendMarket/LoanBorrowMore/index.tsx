import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { AlertLoanSummary } from '@/lend/components/AlertLoanSummary'
import { DialogFormWarning } from '@/lend/components/DialogFormWarning'
import { InpToken } from '@/lend/components/InpToken'
import { InpTokenBorrow } from '@/lend/components/InpTokenBorrow'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import { DetailInfo } from '@/lend/components/PageLendMarket/LoanBorrowMore/components/DetailInfo'
import { DetailInfoLeverage } from '@/lend/components/PageLendMarket/LoanBorrowMore/components/DetailInfoLeverage'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageLendMarket/LoanBorrowMore/types'
import { _parseValues, DEFAULT_FORM_VALUES } from '@/lend/components/PageLendMarket/LoanBorrowMore/utils'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_CONFIRM_WARNING } from '@/lend/components/PageLendMarket/utils'
import { StyledDetailInfoWrapper } from '@/lend/components/styles'
import { NOFITY_MESSAGE } from '@/lend/constants'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { Api, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import type { HealthMode } from '@/llamalend/llamalend.types'
import Stack from '@mui/material/Stack'
import { AlertBox } from '@ui/AlertBox'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'

const { Spacing } = SizesAndSpaces

export type LoanBorrowMoreProps = PageContentProps & { isLeverage?: boolean }

export const LoanBorrowMore = ({
  rChainId,
  rOwmId,
  isLoaded,
  api,
  market,
  userActiveKey,
  isLeverage = false,
}: LoanBorrowMoreProps) => {
  const isSubscribed = useRef(false)
  const activeKey = useStore((state) => state.loanBorrowMore.activeKey)
  const activeKeyMax = useStore((state) => state.loanBorrowMore.activeKeyMax)
  const detailInfoLeverage = useStore((state) => state.loanBorrowMore.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanBorrowMore.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanBorrowMore.formStatus)
  const formValues = useStore((state) => state.loanBorrowMore.formValues)
  const maxRecv = useStore((state) => state.loanBorrowMore.maxRecv[activeKeyMax])
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const { state: userState } = useUserLoanDetails(userActiveKey)
  const fetchStepApprove = useStore((state) => state.loanBorrowMore.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanBorrowMore.fetchStepIncrease)
  const setFormValues = useStore((state) => state.loanBorrowMore.setFormValues)
  const resetState = useStore((state) => state.loanBorrowMore.resetState)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const [{ isConfirming, confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

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
      void setFormValues(
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

      const notification = notify(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepIncrease(payloadActiveKey, api, market, formValues, maxSlippage, isLeverage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(networks[chainId], resp.hash)}
            onClose={() => updateFormValues({}, '', true, true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [activeKey, fetchStepIncrease, updateFormValues],
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
              userState={userState}
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
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, market, formValues, maxSlippage, isLeverage)
            notification?.dismiss()
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
    [expectedCollateral?.totalCollateral, userState, userBalances, fetchStepApprove, handleBtnClickBorrow],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  usePageVisibleInterval(() => {
    if (isLoaded && isLeverage && !formStatus.isComplete && !formStatus.step && !formStatus.error && !isConfirming) {
      updateFormValues({})
    }
  }, REFRESH_INTERVAL['10s'])

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
    userState,
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

  const setUserBorrowed = useCallback((userBorrowed: string) => updateFormValues({ userBorrowed }), [updateFormValues])
  const network = networks[rChainId]

  return (
    <Stack gap={Spacing.lg}>
      <Stack gap={Spacing.sm}>
        <InpToken
          network={network}
          id="userCollateral"
          inpLabel={t`Add from wallet:`}
          inpError={formValues.userCollateralError}
          inpDisabled={disabled}
          inpLabelLoading={!!signerAddress && typeof userBalances?.collateral === 'undefined'}
          inpValue={formValues.userCollateral}
          tokenAddress={market?.collateral_token?.address}
          tokenSymbol={market?.collateral_token?.symbol}
          tokenBalance={userBalances?.collateral}
          handleInpChange={useCallback((userCollateral) => updateFormValues({ userCollateral }), [updateFormValues])}
        />

        {isLeverage && (
          <InpToken
            network={network}
            id="userBorrowed"
            inpLabel={t`Add borrowed from wallet:`}
            inpError={formValues.userBorrowedError}
            inpDisabled={disabled}
            inpLabelLoading={!!signerAddress && typeof userBalances?.borrowed === 'undefined'}
            inpValue={formValues.userBorrowed}
            tokenAddress={market?.borrowed_token?.address}
            tokenSymbol={market?.borrowed_token?.symbol}
            tokenBalance={userBalances?.borrowed}
            handleInpChange={setUserBorrowed}
          />
        )}
      </Stack>

      <Stack gap={Spacing.sm}>
        <InpTokenBorrow
          network={network}
          id="debt"
          inpError={formValues.debtError}
          inpDisabled={disabled}
          inpValue={formValues.debt}
          tokenAddress={market?.borrowed_token?.address}
          tokenSymbol={market?.borrowed_token?.symbol}
          maxRecv={maxRecv}
          handleInpChange={useCallback((debt) => updateFormValues({ debt }), [updateFormValues])}
        />
      </Stack>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isLeverage ? <DetailInfoLeverage {...detailInfoProps} /> : <DetailInfo {...detailInfoProps} />}
      </StyledDetailInfoWrapper>

      {/* actions */}
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
    </Stack>
  )
}

/**
 * The new implementation of LoanBorrowMore with mui isn't ready yet. For now, we wrap the old one for styling.
 */
export const LoanBorrowMoreWrapped = (props: LoanBorrowMoreProps) => (
  <FormContent>
    <LoanBorrowMore {...props} />
  </FormContent>
)
