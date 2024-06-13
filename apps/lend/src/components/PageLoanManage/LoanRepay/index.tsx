import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanRepay/types'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { DEFAULT_CONFIRM_WARNING, DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { DEFAULT_FORM_VALUES, _parseValues } from '@/components/PageLoanManage/LoanRepay/utils'
import { NOFITY_MESSAGE, REFRESH_INTERVAL } from '@/constants'
import { _showNoLoanFound } from '@/utils/helpers'
import { _biCalculatePercentage, _biIsGreaterThan, _biIsGreaterThanOrEqualTo, _biSum } from '@/ui/utils'
import { formatNumber } from '@/ui/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getCollateralListPathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

import { FieldsWrapper } from '@/components/SharedFormStyles/FieldsWrapper'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/components/PageLoanManage/styles'
import AlertBox from '@/ui/AlertBox'
import AlertFormError, { FormError } from '@/components/AlertFormError'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import AlertSummary from '@/components/AlertLoanSummary'
import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import DetailInfo from '@/components/PageLoanManage/LoanRepay/components/DetailInfo'
import DialogFormWarning from '@/components/DialogFormWarning'
import InpToken from '@/components/InpToken'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanRepay = ({
  rChainId,
  rOwmId,
  isLoaded,
  api,
  owmData,
  owmDataCachedOrApi,
  userActiveKey,
  borrowed_token,
  collateral_token,
}: PageContentProps) => {
  const isSubscribed = useRef(false)
  const params = useParams()
  const navigate = useNavigate()

  const activeKey = useStore((state) => state.loanRepay.activeKey)
  const detailInfoLeverage = useStore((state) => state.loanRepay.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanRepay.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanRepay.formStatus)
  const formValues = useStore((state) => state.loanRepay.formValues)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)
  const maxSlippage = useStore((state) => state.maxSlippage)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.loanRepay.fetchStepApprove)
  const fetchStepRepay = useStore((state) => state.loanRepay.fetchStepRepay)
  const fetchAllUserDetails = useStore((state) => state.user.fetchAll)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanRepay.setFormValues)
  const resetState = useStore((state) => state.loanRepay.resetState)

  const [{ isConfirming, confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}
  const { state } = userLoanDetails || {}
  const { decimals: borrowedTokenDecimals } = borrowed_token ?? {}
  const { expectedBorrowed } = detailInfoLeverage ?? {}

  const updateFormValues = useCallback(
    (
      updatedFormValues: Partial<FormValues>,
      updatedMaxSlippage?: string,
      isFullReset?: boolean,
      shouldRefetch?: boolean
    ) => {
      setConfirmWarning(DEFAULT_CONFIRM_WARNING)
      setFormValues(isLoaded ? api : null, owmData, updatedFormValues, updatedMaxSlippage || maxSlippage, shouldRefetch)

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [api, isLoaded, maxSlippage, owmData, setFormValues]
  )

  const handleBtnClickPay = useCallback(
    async (payloadActiveKey: string, api: Api, owmData: OWMData, formValues: FormValues, maxSlippage: string) => {
      const notify = notifyNotification(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepRepay(payloadActiveKey, api, owmData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`

        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={networks[rChainId].scanTxPath(resp.hash)}
            onClose={() => {
              if (resp.loanExists) {
                updateFormValues(DEFAULT_FORM_VALUES, '', true)
              } else {
                navigate(getCollateralListPathname(params))
              }
            }}
          />
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepRepay, navigate, notifyNotification, params, rChainId, updateFormValues]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      owmData: OWMData,
      healthMode: HealthMode,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      maxSlippage: string,
      steps: Step[],
      priceImpact: string
    ) => {
      const { signerAddress } = api
      const { owm } = owmData
      const { borrowed_token, collateral_token } = owm
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
        const tokensMessage = getStepTokensStr(formValues, owmData.owm).symbolAndAmountList
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
              userState={state}
              userWallet={userBalances}
              borrowed_token={owm.borrowed_token}
              collateral_token={owm.collateral_token}
              type={detailInfoLeverage?.repayIsFull || isFullRepay ? 'full' : 'partial'}
            />
          </AlertBox>
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
            const tokensMessage = getStepTokensStr(formValues, owmData.owm).symbolList
            const notifyMessage = t`Please approve spending your ${tokensMessage}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, owmData, formValues, maxSlippage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
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
                    onClick: () => handleBtnClickPay(payloadActiveKey, api, owmData, formValues, maxSlippage),
                    disabled: !confirmedWarning,
                  },
                  primaryBtnLabel: t`Repay anyway`,
                },
              }
            : {
                onClick: async () => handleBtnClickPay(payloadActiveKey, api, owmData, formValues, maxSlippage),
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
      notifyNotification,
      state,
      userBalances,
    ]
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
      const { swapRequired } = _parseValues(formValues)
      if (
        isLoaded &&
        isPageVisible &&
        swapRequired &&
        !formStatus.isComplete &&
        !formStatus.step &&
        !formStatus.error &&
        !isConfirming
      ) {
        updateFormValues({})
      }
    },
    REFRESH_INTERVAL['10s'],
    isPageVisible
  )

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
    if (isLoaded && api && owmData) {
      const updatedSteps = getSteps(
        activeKey,
        api,
        owmData,
        healthMode,
        formEstGas,
        formStatus,
        formValues,
        maxSlippage,
        steps,
        detailInfoLeverage?.isHighPriceImpact ? detailInfoLeverage.priceImpact : ''
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
    state,
    userBalances,
  ])

  const hasLeverage = owmDataCachedOrApi?.hasLeverage
  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disable = formStatus.isInProgress
  const isFullRepay = formValues.isFullRepay || (detailInfoLeverage?.repayIsFull ?? false)

  const disableCheckbox = useMemo(() => {
    if (state && userBalances && borrowedTokenDecimals) {
      const { borrowed: stateBorrowed, debt: stateDebt } = state
      const { borrowed: userBorrowed } = userBalances

      const isPayableWithStateBorrowed = _biIsGreaterThanOrEqualTo(stateBorrowed, stateDebt, borrowedTokenDecimals)
      const isPayableWithWalletBorrowed = _biIsGreaterThanOrEqualTo(userBorrowed, stateDebt, borrowedTokenDecimals)

      return (
        !signerAddress || disable || !!expectedBorrowed || !(isPayableWithWalletBorrowed || isPayableWithStateBorrowed)
      )
    }

    return true
  }, [borrowedTokenDecimals, disable, expectedBorrowed, signerAddress, state, userBalances])

  return (
    <>
      <Box grid gridGap={1}>
        <FieldsWrapper $showBorder={hasLeverage}>
          {hasLeverage && (
            <>
              <InpToken
                id="stateCollateral"
                inpTopLabel={t`Repay from collateral:`}
                inpError={formValues.stateCollateralError}
                inpDisabled={disable}
                inpLabelLoading={loanExists && !!signerAddress && typeof state?.collateral === 'undefined'}
                inpLabelDescription={formatNumber(state?.collateral, { defaultValue: '-' })}
                inpValue={formValues.stateCollateral}
                tokenAddress={collateral_token?.address}
                tokenSymbol={collateral_token?.symbol}
                tokenBalance={formatNumber(state?.collateral, { defaultValue: '-' })}
                handleInpChange={(stateCollateral) => updateFormValues({ stateCollateral, isFullRepay: false })}
                handleMaxClick={() =>
                  updateFormValues({ stateCollateral: state?.collateral ?? '', isFullRepay: false })
                }
              />

              <InpToken
                id="userCollateral"
                inpStyles={{ padding: 'var(--spacing-2) 0 0 0' }}
                inpTopLabel={t`Repay from wallet:`}
                inpError={formValues.userCollateralError}
                inpDisabled={disable}
                inpLabelLoading={!!signerAddress && typeof userBalances?.collateral === 'undefined'}
                inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
                inpValue={formValues.userCollateral}
                tokenAddress={collateral_token?.address}
                tokenSymbol={collateral_token?.symbol}
                tokenBalance={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
                handleInpChange={(userCollateral) => updateFormValues({ userCollateral, isFullRepay: false })}
                handleMaxClick={() =>
                  updateFormValues({ userCollateral: userBalances?.collateral ?? '', isFullRepay: false })
                }
              />
            </>
          )}

          <InpToken
            id="userBorrowed"
            inpError={formValues.userBorrowedError}
            inpDisabled={disable || (!hasLeverage && !state)}
            inpLabelLoading={!!signerAddress && typeof userBalances?.borrowed === 'undefined'}
            inpLabelDescription={formatNumber(userBalances?.borrowed, { defaultValue: '-' })}
            inpValue={formValues.userBorrowed}
            tokenAddress={borrowed_token?.address}
            tokenSymbol={borrowed_token?.symbol}
            tokenBalance={userBalances?.borrowed}
            debt={state?.debt ?? '0'}
            handleInpChange={(userBorrowed) => {
              if (expectedBorrowed) {
                updateFormValues({ userBorrowed, isFullRepay: false })
                return
              }

              if (!expectedBorrowed && state && borrowedTokenDecimals) {
                const { borrowed: stateBorrowed, debt: stateDebt } = state
                const totalRepay = _biSum([stateBorrowed, userBorrowed], borrowedTokenDecimals)
                const isFullRepay = _biIsGreaterThanOrEqualTo(totalRepay, stateDebt, borrowedTokenDecimals)
                updateFormValues({ userBorrowed, isFullRepay })
                return
              }

              updateFormValues({ userBorrowed, isFullRepay: false })
            }}
            handleMaxClick={async () => {
              if (+userBalances.borrowed === 0) {
                updateFormValues({ userBorrowed: '', isFullRepay: false })
                return
              }

              if (expectedBorrowed) {
                updateFormValues({ userBorrowed: userBalances.borrowed, isFullRepay: false })
                return
              }

              if (api && owmData && userBalances && state?.debt && borrowedTokenDecimals) {
                const { userLoanDetailsResp } = await fetchAllUserDetails(api, owmData, true)
                const { borrowed: stateBorrowed = '0', debt: stateDebt = '0' } =
                  userLoanDetailsResp?.details?.state ?? {}

                const amountNeeded = _biSum([stateDebt, stateBorrowed], borrowedTokenDecimals)
                const amountNeededWithInterestRate = amountNeeded + _biCalculatePercentage(amountNeeded, 1n)

                if (_biIsGreaterThan(amountNeededWithInterestRate, userBalances.borrowed, borrowedTokenDecimals)) {
                  updateFormValues({ userBorrowed: userBalances.borrowed, isFullRepay: false })
                  return
                }

                updateFormValues({ userBorrowed: '', isFullRepay: true })
                return
              }
              updateFormValues({ userBorrowed: '', isFullRepay: false })
            }}
          />
        </FieldsWrapper>
        <StyledInpChip size="xs">
          {t`Debt balance`} {formatNumber(state?.debt, { defaultValue: '-' })} {borrowed_token?.symbol}
        </StyledInpChip>
      </Box>

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
          borrowed_token={borrowed_token}
          collateral_token={collateral_token}
          setHealthMode={setHealthMode}
        />
      </StyledDetailInfoWrapper>

      {/* actions */}
      {_showNoLoanFound(signerAddress, formStatus.isComplete, loanExists) ? (
        <AlertNoLoanFound owmId={rOwmId} />
      ) : (
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
      )}
    </>
  )
}

export default LoanRepay
