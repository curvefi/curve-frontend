import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { AlertLoanSummary as AlertSummary } from '@/lend/components/AlertLoanSummary'
import { DialogFormWarning } from '@/lend/components/DialogFormWarning'
import { InpToken } from '@/lend/components/InpToken'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import { DetailInfo } from '@/lend/components/PageLendMarket/LoanRepay/components/DetailInfo'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageLendMarket/LoanRepay/types'
import { _parseValues, DEFAULT_FORM_VALUES } from '@/lend/components/PageLendMarket/LoanRepay/utils'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_CONFIRM_WARNING } from '@/lend/components/PageLendMarket/utils'
import { StyledDetailInfoWrapper } from '@/lend/components/styles'
import { NOFITY_MESSAGE } from '@/lend/constants'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { Api, FormError, type MarketUrlParams, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname } from '@/lend/utils/utilsRouter'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import type { HealthMode } from '@/llamalend/llamalend.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AlertBox } from '@ui/AlertBox'
import { Checkbox } from '@ui/Checkbox'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getPercentage, isGreaterThan, isGreaterThanOrEqualTo, sum } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const LoanRepay = ({
  rChainId,
  rOwmId,
  isLoaded,
  api,
  market,
  userActiveKey,
  params,
}: PageContentProps & { params: MarketUrlParams }) => {
  const isSubscribed = useRef(false)
  const push = useNavigate()
  const activeKey = useStore((state) => state.loanRepay.activeKey)
  const detailInfoLeverage = useStore((state) => state.loanRepay.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanRepay.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanRepay.formStatus)
  const formValues = useStore((state) => state.loanRepay.formValues)
  const { state: userState } = useUserLoanDetails(userActiveKey)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.loanRepay.fetchStepApprove)
  const fetchStepRepay = useStore((state) => state.loanRepay.fetchStepRepay)
  const fetchAllUserDetails = useStore((state) => state.user.fetchAll)
  const setFormValues = useStore((state) => state.loanRepay.setFormValues)
  const resetState = useStore((state) => state.loanRepay.resetState)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const [{ isConfirming, confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}
  const { borrowed_token, collateral_token } = market ?? {}
  const { decimals: borrowedTokenDecimals } = borrowed_token ?? {}
  const { expectedBorrowed } = detailInfoLeverage ?? {}
  const hasExpectedBorrowed = !!expectedBorrowed

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
        updatedFormValues,
        updatedMaxSlippage || maxSlippage,
        shouldRefetch,
      )

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [api, isLoaded, maxSlippage, market, setFormValues],
  )

  const handleBtnClickPay = useCallback(
    async (
      payloadActiveKey: string,
      api: Api,
      market: OneWayMarketTemplate,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const notification = notify(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepRepay(payloadActiveKey, api, market, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`

        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(networks[rChainId], resp.hash)}
            onClose={() => {
              if (resp.loanExists) {
                updateFormValues(DEFAULT_FORM_VALUES, '', true)
              } else {
                push(getCollateralListPathname(params))
              }
            }}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [activeKey, fetchStepRepay, push, params, rChainId, updateFormValues],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      market: OneWayMarketTemplate,
      healthMode: HealthMode,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      maxSlippage: string,
      steps: Step[],
      priceImpact: string,
    ) => {
      const { signerAddress } = api
      const { borrowed_token, collateral_token } = market
      const { isFullRepay, stateCollateral, userBorrowed } = formValues
      const { error, isApproved, isApprovedCompleted, isComplete, isInProgress, step } = formStatus
      const { haveValues, haveFormErrors, swapRequired, getStepTokensStr } = _parseValues(formValues)

      const isValid =
        !!signerAddress &&
        !formEstGas?.loading &&
        haveValues &&
        !haveFormErrors &&
        (!!healthMode.percent || isFullRepay || detailInfoLeverage?.repayIsFull) &&
        !error

      if (haveValues) {
        const tokensMessage = getStepTokensStr(formValues, market).symbolAndAmountList
        const notifyMessage = swapRequired
          ? t`Repay with ${tokensMessage} at max slippage ${maxSlippage}%.`
          : isFullRepay
            ? t`Repay in full.`
            : t`Repay with ${tokensMessage}.`

        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertSummary
              pendingMessage={`${notifyMessage}`}
              receive={expectedBorrowed?.totalBorrowed}
              formValueStateCollateral={stateCollateral}
              formValueUserBorrowed={userBorrowed}
              userState={userState}
              userWallet={userBalances}
              market={market}
              type={detailInfoLeverage?.repayIsFull || isFullRepay ? 'full' : 'partial'}
            />
          </AlertBox>,
        )
      } else if (!isComplete) {
        setTxInfoBar(null)
      }

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const tokensMessage = getStepTokensStr(formValues, market).symbolList
            const notifyMessage = t`Please approve spending your ${tokensMessage}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, market, formValues, maxSlippage)
            notification?.dismiss()
          },
        },
        REPAY: {
          key: 'REPAY',
          status: helpers.getStepStatus(isComplete, step === 'REPAY', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Repaid` : t`Repay`,
          ...(priceImpact
            ? {
                modal: {
                  isDismissable: false,
                  initFn: () => setConfirmWarning({ isConfirming: true, confirmedWarning: false }),
                  title: t`Warning!`,
                  content: (
                    <DialogFormWarning
                      priceImpact={{
                        priceImpact,
                        swapTo: borrowed_token.symbol,
                        swapFrom: collateral_token.symbol,
                      }}
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
                    onClick: () => handleBtnClickPay(payloadActiveKey, api, market, formValues, maxSlippage),
                    disabled: !confirmedWarning,
                  },
                  primaryBtnLabel: t`Repay anyway`,
                },
              }
            : {
                onClick: async () => handleBtnClickPay(payloadActiveKey, api, market, formValues, maxSlippage),
              }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved && !isApprovedCompleted ? ['REPAY'] : ['APPROVAL', 'REPAY']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [
      confirmedWarning,
      detailInfoLeverage?.repayIsFull,
      expectedBorrowed?.totalBorrowed,
      fetchStepApprove,
      handleBtnClickPay,
      userState,
      userBalances,
    ],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  usePageVisibleInterval(() => {
    const { swapRequired } = _parseValues(formValues)
    if (isLoaded && swapRequired && !formStatus.isComplete && !formStatus.step && !formStatus.error && !isConfirming) {
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

  useEffect(() => {
    if (isLoaded) updateFormValues({}, maxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  // steps
  useEffect(() => {
    if (isLoaded && api && market) {
      const updatedSteps = getSteps(
        activeKey,
        api,
        market,
        healthMode,
        formEstGas,
        formStatus,
        formValues,
        maxSlippage,
        steps,
        detailInfoLeverage?.isHighPriceImpact ? detailInfoLeverage.priceImpact : '',
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    activeKey,
    confirmedWarning,
    detailInfoLeverage?.isHighPriceImpact,
    detailInfoLeverage?.repayIsFull,
    expectedBorrowed?.totalBorrowed,
    healthMode?.percent,
    formEstGas?.loading,
    formStatus,
    formValues,
    maxSlippage,
    userState,
    userBalances,
  ])

  const hasLeverage = market?.leverage?.hasLeverage()
  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disable = formStatus.isInProgress
  const isFullRepay = formValues.isFullRepay || (detailInfoLeverage?.repayIsFull ?? false)

  const disableCheckbox = useMemo(() => {
    if (userState && userBalances && borrowedTokenDecimals) {
      const { borrowed: stateBorrowed, debt: stateDebt } = userState
      const { borrowed: userBorrowed } = userBalances

      const isPayableWithStateBorrowed = isGreaterThanOrEqualTo(stateBorrowed, stateDebt, borrowedTokenDecimals)
      const isPayableWithWalletBorrowed = isGreaterThanOrEqualTo(userBorrowed, stateDebt, borrowedTokenDecimals)

      return (
        !signerAddress || disable || !!expectedBorrowed || !(isPayableWithWalletBorrowed || isPayableWithStateBorrowed)
      )
    }

    return true
  }, [borrowedTokenDecimals, disable, expectedBorrowed, signerAddress, userState, userBalances])

  const network = networks[rChainId]
  const setUserCollateral = useCallback(
    (userCollateral: string) => updateFormValues({ userCollateral, isFullRepay: false }),
    [updateFormValues],
  )
  const setStateCollateral = useCallback(
    (stateCollateral: string) => updateFormValues({ stateCollateral, isFullRepay: false }),
    [updateFormValues],
  )

  return (
    <Stack gap={Spacing.lg}>
      {hasLeverage && (
        <Stack gap={Spacing.sm}>
          <Typography variant="headingXsMedium"> {t`Repay from collateral:`} </Typography>

          <InpToken
            network={network}
            id="stateCollateral"
            inpError={formValues.stateCollateralError}
            inpDisabled={disable}
            inpLabelLoading={!!signerAddress && typeof userState?.collateral === 'undefined'}
            inpLabelDescription={formatNumber(userState?.collateral, { defaultValue: '-' })}
            inpValue={formValues.stateCollateral}
            tokenAddress={collateral_token?.address}
            tokenSymbol={collateral_token?.symbol}
            tokenBalance={userState?.collateral}
            handleInpChange={setStateCollateral}
            handleMaxClick={() =>
              updateFormValues({ stateCollateral: userState?.collateral ?? '', isFullRepay: false })
            }
          />
        </Stack>
      )}

      <Stack gap={Spacing.sm}>
        <Typography variant="headingXsMedium">{t`Repay from wallet:`}</Typography>

        <Stack gap={Spacing.md}>
          {hasLeverage && (
            <InpToken
              network={network}
              id="userCollateral"
              inpError={formValues.userCollateralError}
              inpDisabled={disable}
              inpLabelLoading={!!signerAddress && typeof userBalances?.collateral === 'undefined'}
              inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
              inpValue={formValues.userCollateral}
              tokenAddress={collateral_token?.address}
              tokenSymbol={collateral_token?.symbol}
              tokenBalance={userBalances?.collateral}
              handleInpChange={setUserCollateral}
              handleMaxClick={() =>
                updateFormValues({ userCollateral: userBalances?.collateral ?? '', isFullRepay: false })
              }
            />
          )}

          <InpToken
            network={network}
            id="userBorrowed"
            inpError={formValues.userBorrowedError}
            inpDisabled={disable || (!hasLeverage && !userState)}
            inpLabelLoading={!!signerAddress && typeof userBalances?.borrowed === 'undefined'}
            inpLabelDescription={formatNumber(userBalances?.borrowed, { defaultValue: '-' })}
            inpValue={formValues.userBorrowed}
            tokenAddress={borrowed_token?.address}
            tokenSymbol={borrowed_token?.symbol}
            tokenBalance={userBalances?.borrowed}
            debt={userState?.debt ?? '0'}
            handleInpChange={useCallback(
              (userBorrowed) => {
                if (hasExpectedBorrowed) {
                  updateFormValues({ userBorrowed, isFullRepay: false })
                  return
                }

                if (!hasExpectedBorrowed && userState?.borrowed != null && borrowedTokenDecimals) {
                  const totalRepay = sum([userState.borrowed, userBorrowed], borrowedTokenDecimals)
                  const isFullRepay = isGreaterThanOrEqualTo(totalRepay, userState.debt, borrowedTokenDecimals)
                  updateFormValues({ userBorrowed, isFullRepay })
                  return
                }

                updateFormValues({ userBorrowed, isFullRepay: false })
              },
              [borrowedTokenDecimals, hasExpectedBorrowed, updateFormValues, userState?.borrowed, userState?.debt],
            )}
            handleMaxClick={async () => {
              if (+userBalances.borrowed === 0) {
                updateFormValues({ userBorrowed: '', isFullRepay: false })
                return
              }

              if (expectedBorrowed) {
                updateFormValues({ userBorrowed: userBalances.borrowed, isFullRepay: false })
                return
              }

              if (api && market && userBalances && userState?.debt && borrowedTokenDecimals) {
                const { userLoanDetailsResp } = await fetchAllUserDetails(api, market, true)
                const { borrowed: stateBorrowed = '0', debt: stateDebt = '0' } =
                  userLoanDetailsResp?.details?.state ?? {}

                const amountNeeded = sum([stateDebt, stateBorrowed], borrowedTokenDecimals)
                const amountNeededWithInterestRate = amountNeeded + getPercentage(amountNeeded, 1n)

                if (isGreaterThan(amountNeededWithInterestRate, userBalances.borrowed, borrowedTokenDecimals)) {
                  updateFormValues({ userBorrowed: userBalances.borrowed, isFullRepay: false })
                  return
                }

                updateFormValues({ userBorrowed: '', isFullRepay: true })
                return
              }
              updateFormValues({ userBorrowed: '', isFullRepay: false })
            }}
          />
        </Stack>
      </Stack>

      <Typography variant="headingXsMedium">
        {t`Debt balance`} {formatNumber(userState?.debt, { defaultValue: '-' })} {borrowed_token?.symbol}
      </Typography>

      <Checkbox
        isDisabled={disableCheckbox}
        isSelected={detailInfoLeverage?.repayIsFull || formValues.isFullRepay}
        onChange={(isFullRepay) => {
          if (isFullRepay) {
            updateFormValues({ ...DEFAULT_FORM_VALUES, isFullRepay })
          } else {
            updateFormValues({ ...DEFAULT_FORM_VALUES })
          }
        }}
      >
        {t`Repay in full and close loan`}
      </Checkbox>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        <DetailInfo
          rChainId={rChainId}
          rOwmId={rOwmId}
          api={api}
          activeKey={activeKey}
          activeStep={activeStep}
          healthMode={healthMode}
          isFullRepay={isFullRepay}
          steps={steps}
          userActiveKey={userActiveKey}
          market={market}
          setHealthMode={setHealthMode}
        />
      </StyledDetailInfoWrapper>

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {txInfoBar}
        {!!healthMode.message && <AlertBox alertType="warning">{healthMode.message}</AlertBox>}
        {formStatus.error === FormError.FullRepaymentRequired ? (
          <AlertBox alertType="error">
            {t`Only partial repayment from wallet's ${borrowed_token?.symbol} or full repayment from collateral or wallet's ${collateral_token?.symbol} is
              allowed during liquidation mode.`}
          </AlertBox>
        ) : formStatus.error || formStatus.stepError ? (
          <AlertFormError
            limitHeight
            errorKey={formStatus.error || formStatus.stepError}
            handleBtnClose={() => updateFormValues({})}
          />
        ) : null}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </Stack>
  )
}
export const LoanRepayTab = ({ rChainId, market, isLoaded }: PageContentProps) => (
  <RepayForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
)
