import type { FormStatus, StepKey } from '@loan/components/PageLoanManage/LoanLiquidate/types'
import type { FormEstGas, PageLoanManageProps } from '@loan/components/PageLoanManage/types'
import type { Step } from '@ui/Stepper/types'
import { t, Trans } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { DEFAULT_FORM_STATUS, haveEnoughCrvusdForLiquidation } from '@loan/store/createLoanLiquidate'
import { DEFAULT_FORM_EST_GAS } from '@loan/components/PageLoanManage/utils'
import { curveProps } from '@loan/utils/helpers'
import { getActiveStep } from '@ui/Stepper/helpers'
import { getCollateralListPathname } from '@loan/utils/utilsRouter'
import { getStepStatus, getTokenName } from '@loan/utils/utilsLoan'
import { formatNumber } from '@ui/utils'
import useStore from '@loan/store/useStore'
import networks from '@loan/networks'
import AlertFormWarning from '@loan/components/AlertFormWarning'
import AlertFormError from '@loan/components/AlertFormError'
import AlertInfoSelfLiquidation from '@ui/AlertBox/AlertInfoSelfLiquidation'
import DetailInfoEstimateGas from '@loan/components/DetailInfoEstimateGas'
import DetailInfoSlippageTolerance from '@loan/components/DetailInfoSlippageTolerance'
import InputReadOnly from '@ui/InputReadOnly'
import InternalLink from '@ui/Link/InternalLink'
import LoanFormConnect from '@loan/components/LoanFormConnect'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Curve, Llamma, UserWalletBalances } from '@loan/types/loan.types'
import { notify as notifyNotification } from '@ui-kit/features/connect-wallet'

interface Props extends Pick<PageLoanManageProps, 'curve' | 'llamma' | 'llammaId' | 'params' | 'rChainId'> {}

const LoanLiquidate = ({ curve, llamma, llammaId, params, rChainId }: Props) => {
  const { chainId, haveSigner } = curveProps(curve)
  const isSubscribed = useRef(false)

  const formEstGas = useStore((state) => state.loanLiquidate.formEstGas ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanLiquidate.formStatus)
  const liquidationAmt = useStore((state) => state.loanLiquidate.liquidationAmt)
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalances = useStore((state) => state.loans.userWalletBalancesMapper[llammaId])

  const fetchTokensToLiquidate = useStore((state) => state.loanLiquidate.fetchTokensToLiquidate)
  const fetchStepApprove = useStore((state) => state.loanLiquidate.fetchStepApprove)
  const fetchStepLiquidate = useStore((state) => state.loanLiquidate.fetchStepLiquidate)
  const setStateByKey = useStore((state) => state.loanLiquidate.setStateByKey)
  const resetState = useStore((state) => state.loanLiquidate.resetState)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { stablecoin = '', collateral = '' } = getTokenName(llamma) ?? {}

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setTxInfoBar(null)

      if (chainId && llamma && (isErrorReset || isFullReset)) {
        setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved })
        fetchTokensToLiquidate(rChainId, llamma, llammaId, maxSlippage, userWalletBalances)
      }
    },
    [
      chainId,
      fetchTokensToLiquidate,
      formStatus.isApproved,
      llamma,
      llammaId,
      maxSlippage,
      rChainId,
      setStateByKey,
      userWalletBalances,
    ],
  )

  const getSteps = useCallback(
    (
      curve: Curve,
      llamma: Llamma,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      liquidationAmt: string,
      maxSlippage: string,
      userWalletBalances: UserWalletBalances,
      steps: Step[],
    ) => {
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const isValid =
        !!curve.signerAddress &&
        !formEstGas.loading &&
        !error &&
        haveEnoughCrvusdForLiquidation(userWalletBalances?.stablecoin, liquidationAmt)
      const chainId = curve.chainId

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${getTokenName(llamma).stablecoin}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(curve, llamma, maxSlippage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        LIQUIDATE: {
          key: 'LIQUIDATE',
          status: getStepStatus(isComplete, step === 'LIQUIDATE', isApproved && isValid),
          type: 'action',
          content: isComplete ? t`Self-liquidated` : t`Self-liquidate`,
          onClick: async () => {
            const stablecoinName = getTokenName(llamma).stablecoin
            const notifyMessage = t`Please confirm ${stablecoinName} self-liquidation at max ${maxSlippage}% slippage.`
            const notify = notifyNotification(notifyMessage, 'pending')

            const resp = await fetchStepLiquidate(curve, llamma, liquidationAmt, maxSlippage)

            if (isSubscribed.current && resp && resp.hash && !resp.loanExists) {
              const TxDescription = (
                <>
                  <Trans>
                    Transaction complete. This loan will no longer exist. Click{' '}
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
                />,
              )
            }
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['LIQUIDATE'] : ['APPROVAL', 'LIQUIDATE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, fetchStepLiquidate, params, reset],
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
    if (chainId && llamma && llammaId && typeof userWalletBalances?.stablecoin !== 'undefined') {
      fetchTokensToLiquidate(chainId, llamma, llammaId, maxSlippage, userWalletBalances)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.signerAddress, chainId, llamma, llammaId, maxSlippage, userWalletBalances?.stablecoin])

  // steps
  useEffect(() => {
    if (curve && llamma) {
      const updatedSteps = getSteps(
        curve,
        llamma,
        formEstGas,
        formStatus,
        liquidationAmt,
        maxSlippage,
        userWalletBalances,
        steps,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    llamma?.id,
    haveSigner,
    formEstGas.loading,
    liquidationAmt,
    formStatus,
    maxSlippage,
    userWalletBalances?.stablecoin,
  ])

  const activeStep = haveSigner ? getActiveStep(steps) : null

  return (
    <>
      <InputReadOnly title={t`Self-liquidation amount`}>
        {formatNumber(liquidationAmt, { maximumFractionDigits: 2, defaultValue: '-' })}
      </InputReadOnly>

      {/* detail info */}
      <div>
        <DetailInfoEstimateGas
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
        <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
      </div>

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {+liquidationAmt > 0 && typeof userLoanDetails !== 'undefined' && (
          <AlertInfoSelfLiquidation
            liquidationAmt={liquidationAmt}
            titleSelfLiquidation={t`Self-liquidation amount:`}
            titleReceive={t`Receive:`}
            borrowedAmount={userLoanDetails?.userState?.stablecoin ?? '0'}
            borrowedSymbol={stablecoin}
            collateralAmount={userLoanDetails?.userState?.collateral ?? '0'}
            collateralSymbol={collateral}
            debtAmount={userLoanDetails?.userState?.debt ?? '0'}
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

export default LoanLiquidate
