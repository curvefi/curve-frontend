import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import AlertFormError from '@/lend/components/AlertFormError'
import AlertSummary from '@/lend/components/AlertLoanSummary'
import AlertNoLoanFound from '@/lend/components/AlertNoLoanFound'
import DetailInfoEstimateGas from '@/lend/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/lend/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/lend/components/DetailInfoLiqRange'
import InpToken from '@/lend/components/InpToken'
import LoanFormConnect from '@/lend/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageLoanManage/LoanCollateralAdd/types'
import { StyledDetailInfoWrapper } from '@/lend/components/PageLoanManage/styles'
import type { FormEstGas } from '@/lend/components/PageLoanManage/types'
import { DEFAULT_HEALTH_MODE } from '@/lend/components/PageLoanManage/utils'
import { NOFITY_MESSAGE } from '@/lend/constants'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import { DEFAULT_FORM_VALUES } from '@/lend/store/createLoanCollateralAddSlice'
import useStore from '@/lend/store/useStore'
import { LlamalendApi, PageContentProps } from '@/lend/types/lend.types'
import { _showNoLoanFound } from '@/lend/utils/helpers'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import AlertBox from '@ui/AlertBox'
import Stepper from '@ui/Stepper'
import { getActiveStep } from '@ui/Stepper/helpers'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

const LoanCollateralAdd = ({ rChainId, rOwmId, api, isLoaded, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralAdd.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralAdd.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanCollateralAdd.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCollateralAdd.formStatus)
  const formValues = useStore((state) => state.loanCollateralAdd.formValues)
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const userDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const fetchStepApprove = useStore((state) => state.loanCollateralAdd.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanCollateralAdd.fetchStepIncrease)
  const setFormValues = useStore((state) => state.loanCollateralAdd.setFormValues)
  const resetState = useStore((state) => state.loanCollateralAdd.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      void setFormValues(isLoaded ? api : null, market, isFullReset ? DEFAULT_FORM_VALUES : updatedFormValues)
    },
    [api, isLoaded, market, setFormValues],
  )

  const handleBtnClickAdd = useCallback(
    async (payloadActiveKey: string, api: LlamalendApi, market: LendMarketTemplate, formValues: FormValues) => {
      const { chainId } = api

      const notification = notify(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepIncrease(payloadActiveKey, api, market, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = networks[chainId].scanTxPath(resp.hash)
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={txHash} onClose={() => updateFormValues({}, true)} />)
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [activeKey, fetchStepIncrease, updateFormValues],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: LlamalendApi,
      market: LendMarketTemplate,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { signerAddress } = api
      const { collateral, collateralError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && !formEstGas?.loading && +collateral > 0 && !collateralError && !error

      if (+collateral > 0) {
        const notifyMessage = t`deposit ${formValues.collateral} ${market.collateral_token.symbol}.`
        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertSummary
              pendingMessage={notifyMessage}
              market={market}
              receive={formValues.collateral}
              userState={userDetails?.state}
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
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${market.collateral_token.symbol}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, market, formValues)
            notification?.dismiss()
          },
        },
        ADD: {
          key: 'ADD',
          status: helpers.getStepStatus(isComplete, step === 'ADD', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Collateral Added` : t`Add Collateral`,
          onClick: async () => handleBtnClickAdd(payloadActiveKey, api, market, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['ADD'] : ['APPROVAL', 'ADD']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickAdd, userBalances, userDetails?.state],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      resetState()
      updateFormValues({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && market) {
      const updatedSteps = getSteps(activeKey, api, market, formEstGas, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, activeKey, formEstGas?.loading, formStatus, formValues, userBalances, userDetails?.state])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  return (
    <>
      <div>
        <InpToken
          id="collateral"
          inpError={formValues.collateralError}
          inpDisabled={disabled}
          inpLabelLoading={!!signerAddress && typeof userBalances === 'undefined'}
          inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
          inpValue={formValues.collateral}
          tokenAddress={market?.collateral_token?.address}
          tokenSymbol={market?.collateral_token?.symbol}
          tokenBalance={userBalances?.collateral}
          handleInpChange={(collateral) => updateFormValues({ collateral })}
          handleMaxClick={() => updateFormValues({ collateral: userBalances?.collateral ?? '' })}
        />
      </div>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isAdvancedMode && (
          <DetailInfoLiqRange
            isManage
            rChainId={rChainId}
            rOwmId={rOwmId}
            {...detailInfo}
            healthMode={healthMode}
            userActiveKey={userActiveKey}
          />
        )}
        <DetailInfoHealth
          isManage
          rChainId={rChainId}
          rOwmId={rOwmId}
          {...detailInfo}
          amount={formValues.collateral}
          formType=""
          healthMode={healthMode}
          userActiveKey={userActiveKey}
          setHealthMode={setHealthMode}
        />

        {signerAddress && (
          <DetailInfoEstimateGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </StyledDetailInfoWrapper>

      {/* actions */}
      {_showNoLoanFound(signerAddress, formStatus.isComplete, loanExists) ? (
        <AlertNoLoanFound owmId={rOwmId} />
      ) : (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
          {txInfoBar}
          {(formStatus.error || formStatus.stepError) && (
            <AlertFormError
              limitHeight
              errorKey={formStatus.error || formStatus.stepError}
              handleBtnClose={() => updateFormValues({}, true)}
            />
          )}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </>
  )
}

export default LoanCollateralAdd
