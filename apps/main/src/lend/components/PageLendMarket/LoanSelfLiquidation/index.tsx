import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { AlertFormWarning } from '@/lend/components/AlertFormWarning'
import { AlertLoanSummary as AlertSummary } from '@/lend/components/AlertLoanSummary'
import { DetailInfoEstimateGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoRate } from '@/lend/components/DetailInfoRate'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import type { FormStatus, StepKey } from '@/lend/components/PageLendMarket/LoanSelfLiquidation/types'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import { NOFITY_MESSAGE } from '@/lend/constants'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import {
  Api,
  type MarketUrlParams,
  OneWayMarketTemplate,
  PageContentProps,
  UserLoanState,
} from '@/lend/types/lend.types'
import { getCollateralListPathname } from '@/lend/utils/utilsRouter'
import { AlertBox } from '@ui/AlertBox'
import { InputReadyOnly as InputReadOnly } from '@ui/InputReadOnly'
import { InternalLink } from '@ui/Link/InternalLink'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t, Trans } from '@ui-kit/lib/i18n'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

export const LoanSelfLiquidation = ({
  rChainId,
  rOwmId,
  isLoaded,
  api,
  market,
  userActiveKey,
  params,
}: PageContentProps<MarketUrlParams>) => {
  const isSubscribed = useRef(false)
  const formEstGas = useStore((state) => state.loanSelfLiquidation.formEstGas)
  const formStatus = useStore((state) => state.loanSelfLiquidation.formStatus)
  const futureRates = useStore((state) => state.loanSelfLiquidation.futureRates)
  const liquidationAmt = useStore((state) => state.loanSelfLiquidation.liquidationAmt)
  const { state: userState } = useUserLoanDetails(userActiveKey)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchDetails = useStore((state) => state.loanSelfLiquidation.fetchDetails)
  const fetchStepApprove = useStore((state) => state.loanSelfLiquidation.fetchStepApprove)
  const fetchStepLiquidate = useStore((state) => state.loanSelfLiquidation.fetchStepLiquidate)
  const resetState = useStore((state) => state.loanSelfLiquidation.resetState)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}

  const reset = useCallback(() => {
    setTxInfoBar(null)

    if (isLoaded && api && market) {
      void fetchDetails(api, market, maxSlippage)
    }
  }, [isLoaded, api, market, fetchDetails, maxSlippage])

  const getSteps = useCallback(
    (
      api: Api,
      market: OneWayMarketTemplate,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      liquidationAmt: string,
      maxSlippage: string,
      steps: Step[],
      state: Omit<UserLoanState, 'error'>,
    ) => {
      const { chainId, signerAddress } = api
      const { error, loading, warning, isApproved, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && !formEstGas?.loading && !loading && !error && !warning

      if (isValid) {
        const notifyMessage = t`Self-liquidate ${market.borrowed_token.symbol} at ${maxSlippage}% max slippage.`
        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertSummary
              pendingMessage={notifyMessage}
              market={market}
              receive=""
              formValueStateCollateral=""
              userState={state}
              userWallet={userBalances}
              type="self"
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
            const notifyMessage = t`Please approve spending of ${market.borrowed_token.symbol}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(api, market, maxSlippage)
            notification?.dismiss()
          },
        },
        SELF_LIQUIDATE: {
          key: 'SELF_LIQUIDATE',
          status: helpers.getStepStatus(isComplete, step === 'SELF_LIQUIDATE', isApproved && isValid),
          type: 'action',
          content: isComplete ? t`Self-liquidated` : t`Self-liquidate`,
          onClick: async () => {
            const notification = notify(NOFITY_MESSAGE.pendingConfirm, 'pending')
            const resp = await fetchStepLiquidate(api, market, liquidationAmt, maxSlippage)

            if (isSubscribed.current && resp && resp.hash && !resp.loanExists && !resp.error) {
              const TxDescription = (
                <Trans>
                  Transaction completed. This loan will no longer exist. Click{' '}
                  <StyledInternalLink href={getCollateralListPathname(params)}>here</StyledInternalLink> to go back to
                  collateral list.
                </Trans>
              )

              setTxInfoBar(
                <TxInfoBar
                  description={TxDescription}
                  txHash={scanTxPath(networks[chainId], resp.hash)}
                  onClose={reset}
                />,
              )
            }
            if (resp?.error) setTxInfoBar(null)
            notification?.dismiss()
          },
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['SELF_LIQUIDATE'] : ['APPROVAL', 'SELF_LIQUIDATE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, fetchStepLiquidate, params, reset, userBalances],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  // max slippage
  useEffect(() => {
    if (isLoaded && api && market && maxSlippage) void fetchDetails(api, market, maxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  // init
  useEffect(() => {
    if (isLoaded && api && market && maxSlippage) {
      resetState()
      void fetchDetails(api, market, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && market && userState) {
      const updatedSteps = getSteps(api, market, formEstGas, formStatus, liquidationAmt, maxSlippage, steps, userState)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, liquidationAmt, formStatus, maxSlippage, userBalances, userState])

  const activeStep = signerAddress ? getActiveStep(steps) : null

  return (
    <>
      <InputReadOnly title={t`Self-liquidation amount`}>
        {formatNumber(liquidationAmt, { decimals: 5, defaultValue: '-' })}
      </InputReadOnly>

      {/* detail info */}
      <div>
        <DetailInfoRate rChainId={rChainId} rOwmId={rOwmId} isBorrow={true} futureRates={futureRates} />
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
        <SlippageToleranceActionInfo maxSlippage={maxSlippage} />
      </div>

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!isLoaded}>
        {txInfoBar}
        {!formStatus.loading && !!formStatus.warning && <AlertFormWarning errorKey={formStatus.warning} />}
        {(formStatus.error || formStatus.stepError) && (
          <AlertFormError limitHeight errorKey={formStatus.error || formStatus.stepError} handleBtnClose={reset} />
        )}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

const StyledInternalLink = styled(InternalLink)`
  color: inherit;

  &:hover {
    color: var(--link_light--hover--color);
    text-decoration-color: var(--link_light--hover--color);
  }
`
