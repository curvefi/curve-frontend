import type { FormEstGas, FormStatus, FormValues, StepKey } from '@/components/PageLoanCreate/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_CONFIRM_WARNING, DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { NOFITY_MESSAGE, REFRESH_INTERVAL } from '@/constants'
import { formatNumber } from '@/ui/utils'
import { getLoanManagePathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import { _parseValue, DEFAULT_FORM_VALUES } from '@/components/PageLoanCreate/utils'
import { useNavigate, useParams } from 'react-router-dom'
import networks from '@/networks'
import useMarketAlert from '@/hooks/useMarketAlert'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

import { FieldsWrapper } from '@/components/SharedFormStyles/FieldsWrapper'
import Accordion from '@/ui/Accordion'
import AlertBox from '@/ui/AlertBox'
import AlertLoanSummary from '@/components/AlertLoanSummary'
import AlertFormError from '@/components/AlertFormError'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import DetailInfo from '@/components/PageLoanCreate/LoanFormCreate/components/DetailInfo'
import DialogFormWarning from '@/components/DialogFormWarning'
import InpToken from '@/components/InpToken'
import InpTokenBorrow from '@/components/InpTokenBorrow'
import LinkButton from '@/ui/LinkButton'
import LoanFormConnect from '@/components/LoanFormConnect'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'
import Stepper from '@/ui/Stepper'
import TextCaption from '@/ui/TextCaption'
import TxInfoBar from '@/ui/TxInfoBar'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

const LoanCreate = ({ isLeverage = false, ...pageProps }: PageContentProps & { isLeverage?: boolean }) => {
  const { rChainId, rOwmId, isLoaded, api, market, userActiveKey } = pageProps
  const isSubscribed = useRef(false)
  const params = useParams()
  const navigate = useNavigate()
  const marketAlert = useMarketAlert(rChainId, rOwmId)

  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const activeKeyMax = useStore((state) => state.loanCreate.activeKeyMax)
  const detailInfoLeverage = useStore((state) => state.loanCreate.detailInfoLeverage[activeKey])
  const maxLeverage = useStore((state) => state.markets.maxLeverageMapper[rChainId]?.[rOwmId]?.maxLeverage)
  const formEstGas = useStore((state) => state.loanCreate.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCreate.formStatus)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const maxRecv = useStore((state) => state.loanCreate.maxRecv[activeKeyMax])
  const maxSlippage = useStore((state) => state.maxSlippage)
  const userDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const refetchMaxRecv = useStore((state) => state.loanCreate.refetchMaxRecv)
  const fetchStepApprove = useStore((state) => state.loanCreate.fetchStepApprove)
  const fetchStepCreate = useStore((state) => state.loanCreate.fetchStepCreate)
  const setStateByKeyMarkets = useStore((state) => state.markets.setStateByKey)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const resetState = useStore((state) => state.loanCreate.resetState)

  const [{ isConfirming, confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}
  const { expectedCollateral } = detailInfoLeverage ?? {}
  const { borrowed_token, collateral_token } = market ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean, shouldRefetch?: boolean) => {
      setConfirmWarning(DEFAULT_CONFIRM_WARNING)
      setFormValues(
        isLoaded ? api : null,
        market,
        isFullReset ? DEFAULT_FORM_VALUES : updatedFormValues,
        maxSlippage,
        isLeverage,
        shouldRefetch,
      )

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [setFormValues, isLoaded, api, market, maxSlippage, isLeverage],
  )

  const handleClickCreate = useCallback(
    async (
      payloadActiveKey: string,
      api: Api,
      formValues: FormValues,
      market: OneWayMarketTemplate,
      maxSlippage: string,
      isLeverage: boolean,
    ) => {
      const notify = notifyNotification(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepCreate(payloadActiveKey, api, market, maxSlippage, formValues, isLeverage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction complete.`
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={networks[rChainId].scanTxPath(resp.hash)} />)
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepCreate, notifyNotification, rChainId],
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
      steps: Step[],
      isLeverage: boolean,
      priceImpact: string,
    ) => {
      const { signerAddress } = api
      const { collateral_token, borrowed_token } = market
      const { n, debt, userCollateral } = formValues
      const { isApproved, isApprovedCompleted, isComplete, isInProgress, error, step } = formStatus
      const { swapRequired, haveValues, haveDebt, haveFormErrors, getStepTokensStr } = _parseValue(formValues)

      if (haveDebt) {
        const debtStr = `${debt} ${borrowed_token.symbol}`
        const tokensMessage = getStepTokensStr(formValues, market).symbolAndAmountList
        const notifyMessage = swapRequired
          ? t`Deposit ${tokensMessage}, borrowing ${debtStr} at max slippage ${maxSlippage}%.`
          : t`Deposit ${tokensMessage}, borrowing ${debtStr}.`

        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertLoanSummary
              pendingMessage={notifyMessage}
              market={market}
              receive={expectedCollateral?.totalCollateral ?? userCollateral}
              formValueStateDebt={debt}
              userState={userDetails?.state}
              userWallet={userBalances}
              type="create"
            />
          </AlertBox>,
        )
      } else if (!isComplete) {
        setTxInfoBar(null)
      }

      const isValid =
        !!signerAddress && n !== null && !haveFormErrors && !formEstGas?.loading && !error && !!healthMode.percent

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid && haveValues),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const tokensMessage = getStepTokensStr(formValues, market).symbolList
            const notifyMessage = t`Please approve spending your ${tokensMessage}.`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, market, maxSlippage, formValues, isLeverage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        CREATE: {
          key: 'CREATE',
          status: helpers.getStepStatus(isComplete, step === 'CREATE', isValid && haveDebt && isApproved),
          type: 'action',
          content: isComplete ? t`Loan Received` : t`Get Loan`,
          ...(healthMode.message || priceImpact
            ? {
                modal: {
                  title: t`Warning!`,
                  initFn: () => setConfirmWarning({ isConfirming: true, confirmedWarning: false }),
                  content: (
                    <DialogFormWarning
                      health={healthMode.message ? healthMode : null}
                      priceImpact={
                        priceImpact
                          ? { priceImpact, swapFrom: borrowed_token.symbol, swapTo: collateral_token.symbol }
                          : null
                      }
                      confirmed={confirmedWarning}
                      setConfirmed={(val) =>
                        setConfirmWarning({ isConfirming: false, confirmedWarning: val as boolean })
                      }
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmWarning(DEFAULT_CONFIRM_WARNING),
                  },
                  primaryBtnProps: {
                    onClick: () =>
                      handleClickCreate(payloadActiveKey, api, formValues, market, maxSlippage, isLeverage),
                    disabled: !confirmedWarning,
                    testId: 'createAnyway',
                  },
                  primaryBtnLabel: 'Create anyway',
                  testId: 'warning',
                },
              }
            : {
                onClick: async () =>
                  handleClickCreate(payloadActiveKey, api, formValues, market, maxSlippage, isLeverage),
              }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved && !isApprovedCompleted ? ['CREATE'] : ['APPROVAL', 'CREATE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [
      expectedCollateral?.totalCollateral,
      fetchStepApprove,
      handleClickCreate,
      notifyNotification,
      userBalances,
      userDetails?.state,
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

  // steps
  useEffect(() => {
    if (isLoaded && api && market) {
      let updatedSteps = getSteps(
        activeKey,
        api,
        market,
        healthMode,
        confirmedWarning,
        formEstGas,
        formStatus,
        formValues,
        maxSlippage,
        steps,
        isLeverage,
        detailInfoLeverage?.isHighPriceImpact ? detailInfoLeverage.priceImpact : '',
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    confirmedWarning,
    detailInfoLeverage?.isHighPriceImpact,
    expectedCollateral?.totalCollateral,
    formEstGas?.loading,
    formStatus,
    formValues,
    healthMode?.percent,
    isLeverage,
    maxRecv,
    maxSlippage,
    market?.id,
    signerAddress,
    userBalances,
    userDetails?.state,
  ])

  // signerAddress, maxSlippage state change
  useEffect(() => {
    if (isLoaded) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage, isAdvanceMode])

  useEffect(() => {
    if (isLoaded) {
      resetState()
      updateFormValues({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  const disabled = !!formStatus.step

  return (
    <>
      <FieldsWrapper $showBorder={isLeverage}>
        <InpToken
          id="userCollateral"
          {...(isLeverage ? { inpTopLabel: t`Add from wallet:` } : {})}
          inpError={formValues.userCollateralError}
          inpDisabled={disabled}
          inpLabelLoading={!!signerAddress && typeof userBalances === 'undefined'}
          inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
          inpValue={formValues.userCollateral}
          tokenAddress={collateral_token?.address}
          tokenSymbol={collateral_token?.symbol}
          tokenBalance={userBalances?.collateral}
          handleInpChange={(userCollateral) => updateFormValues({ userCollateral })}
          handleMaxClick={() => updateFormValues({ userCollateral: userBalances?.collateral ?? '' })}
        />

        {isLeverage && (
          <InpToken
            id="userBorrowed"
            inpError={formValues.userBorrowedError}
            inpDisabled={disabled}
            inpLabelLoading={!!signerAddress && typeof userBalances === 'undefined'}
            inpLabelDescription={formatNumber(userBalances?.borrowed, { defaultValue: '-' })}
            inpValue={formValues.userBorrowed}
            tokenAddress={borrowed_token?.address}
            tokenSymbol={borrowed_token?.symbol}
            tokenBalance={userBalances?.borrowed}
            handleInpChange={(userBorrowed) => updateFormValues({ userBorrowed })}
            handleMaxClick={() => updateFormValues({ userBorrowed: userBalances?.borrowed ?? '' })}
          />
        )}
      </FieldsWrapper>

      <InpTokenBorrow
        id="debt"
        {...(isLeverage ? { inpTopLabel: t`Borrow amount:` } : {})}
        inpError={formValues.debtError}
        inpDisabled={disabled}
        inpValue={formValues.debt}
        tokenAddress={borrowed_token?.address}
        tokenSymbol={borrowed_token?.symbol}
        maxRecv={maxRecv}
        handleInpChange={(debt) => updateFormValues({ debt })}
        handleMaxClick={async () => {
          const debt = await refetchMaxRecv(market, isLeverage)
          updateFormValues({ debt })
        }}
      />

      {/* detail info */}
      <DetailInfo
        {...pageProps}
        healthMode={healthMode}
        isLeverage={isLeverage}
        market={market!}
        steps={steps}
        setHealthMode={setHealthMode}
        updateFormValues={updateFormValues}
      />

      {isLeverage && (
        <AlertBox alertType="info">
          <Box grid gridRowGap={2}>
            <p>{t`You can leverage your collateral up to x${formatNumber(maxLeverage, {
              maximumSignificantDigits: 2,
              defaultValue: '-',
            })}. This has the effect of repeat trading ${
              borrowed_token?.symbol
            } to collateral and depositing to maximize your collateral position. Essentially, all borrowed ${
              borrowed_token?.symbol
            } is utilized to purchase more collateral.`}</p>
            <p>{t`Be careful, if the collateral price dips, you would need to repay the entire amount to reclaim your initial position.`}</p>
          </Box>
        </AlertBox>
      )}

      {marketAlert && <AlertBox alertType={marketAlert.alertType}>{marketAlert.message}</AlertBox>}

      {/* actions */}
      {signerAddress && typeof loanExistsResp !== 'undefined' && loanExistsResp.loanExists && !formStatus.isComplete ? (
        <>
          <AlertBox alertType="info">{t`A loan has been found for this market.`}</AlertBox>
          <Button
            variant="filled"
            size="large"
            onClick={() => {
              setStateByKeyMarkets('marketDetailsView', 'user')
              navigate(getLoanManagePathname(params, rOwmId, 'loan'))
            }}
          >
            Manage loan
          </Button>
        </>
      ) : (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
          {txInfoBar}
          {!!healthMode.message && <AlertBox alertType="warning">{healthMode.message}</AlertBox>}
          {(formStatus.error || formStatus.stepError) && (
            <AlertFormError
              limitHeight
              errorKey={formStatus.error || formStatus.stepError}
              handleBtnClose={() => updateFormValues({}, true)}
            />
          )}
          {steps && <Stepper steps={steps} />}
          {formStatus.isComplete && market && (
            <LinkButton variant="filled" size="large" to={getLoanManagePathname(params, market.id, 'loan')}>
              Manage loan
            </LinkButton>
          )}
        </LoanFormConnect>
      )}

      {!isAdvanceMode && (
        <Accordion btnLabel={<TextCaption isCaps isBold>{t`Market details`}</TextCaption>}>
          <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type="borrow" />
        </Accordion>
      )}
    </>
  )
}

export default LoanCreate
