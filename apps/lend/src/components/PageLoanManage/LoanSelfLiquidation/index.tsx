import type { FormStatus, StepKey } from '@/components/PageLoanManage/LoanSelfLiquidation/types'
import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t, Trans } from '@lingui/macro'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { NOFITY_MESSAGE } from '@/constants'
import { _showNoLoanFound } from '@/utils/helpers'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getCollateralListPathname } from '@/utils/utilsRouter'
import { formatNumber } from '@/ui/utils'
import { helpers } from '@/lib/apiLending'
import useStore from '@/store/useStore'
import networks from '@/networks'

import AlertBox from '@/ui/AlertBox'
import AlertFormWarning from '@/components/AlertFormWarning'
import AlertFormError from '@/components/AlertFormError'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import AlertSummary from 'components/AlertLoanSummary'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'
import DetailInfoRate from '@/components/DetailInfoRate'
import InputReadOnly from '@/ui/InputReadOnly'
import InternalLink from '@/ui/Link/InternalLink'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const LoanSelfLiquidation = ({ rChainId, rOwmId, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)
  const params = useParams()

  const formEstGas = useStore((state) => state.loanSelfLiquidation.formEstGas)
  const formStatus = useStore((state) => state.loanSelfLiquidation.formStatus)
  const futureRates = useStore((state) => state.loanSelfLiquidation.futureRates)
  const liquidationAmt = useStore((state) => state.loanSelfLiquidation.liquidationAmt)
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)
  const userDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchDetails = useStore((state) => state.loanSelfLiquidation.fetchDetails)
  const fetchStepApprove = useStore((state) => state.loanSelfLiquidation.fetchStepApprove)
  const fetchStepLiquidate = useStore((state) => state.loanSelfLiquidation.fetchStepLiquidate)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const resetState = useStore((state) => state.loanSelfLiquidation.resetState)

  const {
    maxSlippage: { global: maxSlippage },
  } = useUserProfileStore()

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}
  const { state } = userDetails ?? {}

  const reset = useCallback(() => {
    setTxInfoBar(null)

    if (isLoaded && api && market) {
      fetchDetails(api, market, maxSlippage)
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
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(api, market, maxSlippage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        SELF_LIQUIDATE: {
          key: 'SELF_LIQUIDATE',
          status: helpers.getStepStatus(isComplete, step === 'SELF_LIQUIDATE', isApproved && isValid),
          type: 'action',
          content: isComplete ? t`Self-liquidated` : t`Self-liquidate`,
          onClick: async () => {
            const notify = notifyNotification(NOFITY_MESSAGE.pendingConfirm, 'pending')
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
                  txHash={networks[chainId].scanTxPath(resp.hash)}
                  onClose={reset}
                />,
              )
            }
            if (resp?.error) setTxInfoBar(null)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
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
    [fetchStepApprove, fetchStepLiquidate, notifyNotification, params, reset, userBalances],
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
    if (isLoaded && api && market && maxSlippage) fetchDetails(api, market, maxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  // init
  useEffect(() => {
    if (isLoaded && api && market && maxSlippage) {
      resetState()
      fetchDetails(api, market, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && market && state) {
      const updatedSteps = getSteps(api, market, formEstGas, formStatus, liquidationAmt, maxSlippage, steps, state)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, liquidationAmt, formStatus, maxSlippage, userBalances, state])

  const activeStep = signerAddress ? getActiveStep(steps) : null

  return (
    <>
      <InputReadOnly title={t`Self-liquidation amount`}>
        {formatNumber(liquidationAmt, { showAllFractionDigits: true, defaultValue: '-' })}
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
        <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
      </div>

      {/* actions */}
      {_showNoLoanFound(signerAddress, formStatus.isComplete, loanExists) ? (
        <AlertNoLoanFound owmId={rOwmId} />
      ) : (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!isLoaded}>
          {txInfoBar}
          {!formStatus.loading && !!formStatus.warning && <AlertFormWarning errorKey={formStatus.warning} />}
          {(formStatus.error || formStatus.stepError) && (
            <AlertFormError limitHeight errorKey={formStatus.error || formStatus.stepError} handleBtnClose={reset} />
          )}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </>
  )
}

const StyledInternalLink = styled(InternalLink)`
  color: inherit;
  text-transform: inherit;

  :hover {
    color: var(--link_light--hover--color);
    text-decoration-color: var(--link_light--hover--color);
  }
`

export default LoanSelfLiquidation
