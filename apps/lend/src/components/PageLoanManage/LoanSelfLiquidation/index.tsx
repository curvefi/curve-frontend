import type { FormStatus, StepKey } from '@/components/PageLoanManage/LoanSelfLiquidation/types'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t, Trans } from '@lingui/macro'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { _haveEnoughCrvusdForLiquidation } from '@/store/createLoanSelfLiquidationSlice'
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
import AlertInfoSelfLiquidation from '@/ui/AlertBox/AlertInfoSelfLiquidation'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'
import DetailInfoRate from '@/components/DetailInfoRate'
import InputReadOnly from '@/ui/InputReadOnly'
import InternalLink from '@/ui/Link/InternalLink'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanSelfLiquidation = ({ rChainId, rOwmId, isLoaded, api, owmData, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)
  const params = useParams()

  const formEstGas = useStore((state) => state.loanSelfLiquidation.formEstGas)
  const formStatus = useStore((state) => state.loanSelfLiquidation.formStatus)
  const futureRates = useStore((state) => state.loanSelfLiquidation.futureRates)
  const liquidationAmt = useStore((state) => state.loanSelfLiquidation.liquidationAmt)
  const maxSlippage = useStore((state) => state.maxSlippage)
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const userWalletBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchDetails = useStore((state) => state.loanSelfLiquidation.fetchDetails)
  const fetchStepApprove = useStore((state) => state.loanSelfLiquidation.fetchStepApprove)
  const fetchStepLiquidate = useStore((state) => state.loanSelfLiquidation.fetchStepLiquidate)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const resetState = useStore((state) => state.loanSelfLiquidation.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { owm } = owmData ?? {}
  const { details, error } = userLoanDetailsResp ?? {}
  const { signerAddress } = api ?? {}

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setTxInfoBar(null)

      if (api && owmData && (isErrorReset || isFullReset)) {
        fetchDetails(api, owmData, maxSlippage)
      }
    },
    [api, owmData, fetchDetails, maxSlippage]
  )

  const getSteps = useCallback(
    (
      api: Api,
      owmData: OWMData,
      formStatus: FormStatus,
      liquidationAmt: string,
      maxSlippage: string,
      userWalletBalances: UserMarketBalances,
      steps: Step[]
    ) => {
      const { chainId, signerAddress } = api
      const { owm } = owmData
      const { error, warning, isApproved, isComplete, isInProgress, step } = formStatus
      const isValid =
        !!signerAddress &&
        +liquidationAmt > 0 &&
        !error &&
        _haveEnoughCrvusdForLiquidation(userWalletBalances?.borrowed, liquidationAmt) &&
        warning !== 'warning-not-in-liquidation-mode'

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${owm.borrowed_token.symbol}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(api, owmData, maxSlippage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        SELF_LIQUIDATE: {
          key: 'SELF_LIQUIDATE',
          status: helpers.getStepStatus(isComplete, step === 'SELF_LIQUIDATE', isApproved && isValid),
          type: 'action',
          content: isComplete ? t`Self-liquidated` : t`Self-liquidate`,
          onClick: async () => {
            const notifyMessage = t`Self-liquidate ${owm.borrowed_token.symbol} at ${maxSlippage}% max slippage.`
            const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
            setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

            const resp = await fetchStepLiquidate(api, owmData, liquidationAmt, maxSlippage)

            if (isSubscribed.current && resp && resp.hash && !resp.loanExists && !resp.error) {
              const TxDescription = (
                <>
                  <Trans>
                    Transaction completed. This loan will no longer exist. Click{' '}
                    <StyledInternalLink href={getCollateralListPathname(params)}>here</StyledInternalLink> to go back to
                    collateral list.
                  </Trans>
                </>
              )

              setTxInfoBar(
                <TxInfoBar
                  description={TxDescription}
                  txHash={networks[chainId].scanTxPath(resp.hash)}
                  onClose={() => reset(false, true)}
                />
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
    [fetchStepApprove, fetchStepLiquidate, notifyNotification, params, reset]
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
  useEffect(() => {
    if (isLoaded && api && owmData && maxSlippage) fetchDetails(api, owmData, maxSlippage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, maxSlippage])

  // steps
  useEffect(() => {
    if (isLoaded && api && owmData) {
      const updatedSteps = getSteps(api, owmData, formStatus, liquidationAmt, maxSlippage, userWalletBalances, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, liquidationAmt, formStatus, maxSlippage, userWalletBalances?.collateral])

  const activeStep = signerAddress ? getActiveStep(steps) : null

  return (
    <>
      <InputReadOnly title={t`Self-liquidation amount`}>
        {formatNumber(liquidationAmt, { maximumFractionDigits: 2, defaultValue: '-' })}
      </InputReadOnly>

      {/* detail info */}
      <div>
        <DetailInfoRate rChainId={rChainId} rOwmId={rOwmId} isBorrow futureRates={futureRates} />
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
        <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
      </div>

      {signerAddress && !formStatus.isComplete && (
        <AlertNoLoanFound alertType="info" owmId={rOwmId} userActiveKey={userActiveKey} />
      )}

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!isLoaded}>
        {+liquidationAmt > 0 && typeof userLoanDetailsResp !== 'undefined' && typeof owm !== 'undefined' && (
          <AlertInfoSelfLiquidation
            liquidationAmt={liquidationAmt}
            errorMessage={error ? t`Unable to get self-liquidation details.` : ''}
            titleSelfLiquidation={t`Self-liquidation amount:`}
            titleReceive={t`Receive:`}
            borrowedAmount={details?.state?.borrowed ?? '0'}
            borrowedSymbol={owm?.borrowed_token?.symbol ?? ''}
            collateralAmount={details?.state.collateral ?? '0'}
            collateralSymbol={owm?.collateral_token?.symbol ?? ''}
            debtAmount={details?.state?.debt ?? '0'}
          />
        )}
        <AlertFormWarning errorKey={formStatus.warning} />
        <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(false, true)} />
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
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
