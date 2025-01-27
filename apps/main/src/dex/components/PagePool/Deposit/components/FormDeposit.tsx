import type { FormStatus, FormValues, LoadMaxAmount, StepKey } from '@main/components/PagePool/Deposit/types'
import type { Slippage, TransferProps } from '@main/components/PagePool/types'
import type { Step } from '@ui/Stepper/types'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_ESTIMATED_GAS, DEFAULT_SLIPPAGE } from '@main/components/PagePool'
import { DEFAULT_FORM_LP_TOKEN_EXPECTED } from '@main/components/PagePool/Deposit/utils'
import { amountsDescription, tokensDescription } from '@main/components/PagePool/utils'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import useStore from '@main/store/useStore'
import AlertBox from '@ui/AlertBox'
import AlertFormError from '@main/components/AlertFormError'
import AlertSlippage from '@main/components/AlertSlippage'
import FieldsDeposit from '@main/components/PagePool/Deposit/components/FieldsDeposit'
import DetailInfoSlippage from '@main/components/PagePool/components/DetailInfoSlippage'
import DetailInfoEstGas from '@main/components/DetailInfoEstGas'
import DetailInfoEstLpTokens from '@main/components/PagePool/components/DetailInfoEstLpTokens'
import DetailInfoSlippageTolerance from '@main/components/PagePool/components/DetailInfoSlippageTolerance'
import HighSlippagePriceImpactModal from '@main/components/PagePool/components/WarningModal'
import Stepper from '@ui/Stepper'
import TransferActions from '@main/components/PagePool/components/TransferActions'
import TxInfoBar from '@ui/TxInfoBar'
import { CurveApi, PoolData } from '@main/types/main.types'
import { notify as notifyNotification } from '@ui-kit/features/connect-wallet'

const FormDeposit = ({
  chainIdPoolId,
  curve,
  imageBaseUrl,
  maxSlippage,
  poolAlert,
  poolData,
  poolDataCacheOrApi,
  routerParams,
  seed,
  tokensMapper,
  userPoolBalances,
}: TransferProps) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const { rChainId } = routerParams
  const activeKey = useStore((state) => state.poolDeposit.activeKey)
  const formEstGas = useStore((state) => state.poolDeposit.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formLpTokenExpected = useStore(
    (state) => state.poolDeposit.formLpTokenExpected[activeKey] ?? DEFAULT_FORM_LP_TOKEN_EXPECTED,
  )
  const formStatus = useStore((state) => state.poolDeposit.formStatus)
  const formValues = useStore((state) => state.poolDeposit.formValues)
  const slippage = useStore((state) => state.poolDeposit.slippage[activeKey] ?? DEFAULT_SLIPPAGE)
  const fetchStepApprove = useStore((state) => state.poolDeposit.fetchStepApprove)
  const fetchStepDeposit = useStore((state) => state.poolDeposit.fetchStepDeposit)
  const setFormValues = useStore((state) => state.poolDeposit.setFormValues)
  const resetState = useStore((state) => state.poolDeposit.resetState)
  const network = useStore((state) => (chainId ? state.networks.networks[chainId] : null))

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const updateFormValues = useCallback(
    (
      updatedFormValues: Partial<FormValues>,
      loadMaxAmount: LoadMaxAmount | null,
      updatedMaxSlippage: string | null,
    ) => {
      setTxInfoBar(null)
      setSlippageConfirmed(false)
      setFormValues(
        'DEPOSIT',
        curve,
        poolDataCacheOrApi.pool.id,
        poolData,
        updatedFormValues,
        loadMaxAmount,
        seed.isSeed,
        updatedMaxSlippage || maxSlippage,
      )
    },
    [curve, maxSlippage, poolData, poolDataCacheOrApi.pool.id, seed.isSeed, setFormValues],
  )

  const handleApproveClick = useCallback(
    async (activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your ${tokensDescription(formValues.amounts)}.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, curve, 'DEPOSIT', poolData.pool, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove],
  )

  const handleDepositClick = useCallback(
    async (activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues, maxSlippage: string) => {
      const tokenText = amountsDescription(formValues.amounts)
      const notifyMessage = t`Please confirm deposit of ${tokenText} at max ${maxSlippage}% slippage.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepDeposit(activeKey, curve, poolData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        const txDescription = t`Deposited ${tokenText}.`
        setTxInfoBar(<TxInfoBar description={txDescription} txHash={network.scanTxPath(resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepDeposit, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      formStatus: FormStatus,
      slippageConfirmed: boolean,
      slippage: Slippage,
      steps: Step[],
      maxSlippage: string,
    ) => {
      const haveFormValues = formValues.amounts.some((a) => Number(a.value) > 0)
      const isValid = haveFormValues && !formStatus.error
      const isApproved = formStatus.isApproved || formStatus.formTypeCompleted === 'APPROVE'
      const isComplete = formStatus.formTypeCompleted === 'DEPOSIT'

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => handleApproveClick(activeKey, curve, poolData, formValues),
        },
        ['DEPOSIT']: {
          key: 'DEPOSIT',
          status: getStepStatus(isComplete, formStatus.step === 'DEPOSIT', isValid && formStatus.isApproved),
          type: 'action',
          content: isComplete ? t`Deposit Complete` : t`Deposit`,
          ...(slippage.isHighSlippage
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    <HighSlippagePriceImpactModal
                      slippage
                      confirmed={slippageConfirmed}
                      value={slippage.slippage || 0}
                      transferType="Deposit"
                      setConfirmed={setSlippageConfirmed}
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setSlippageConfirmed(false),
                  },
                  primaryBtnProps: {
                    onClick: () => handleDepositClick(activeKey, curve, poolData, formValues, maxSlippage),
                    disabled: !slippageConfirmed,
                  },
                  primaryBtnLabel: 'Deposit anyway',
                },
              }
            : { onClick: () => handleDepositClick(activeKey, curve, poolData, formValues, maxSlippage) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['DEPOSIT'] : ['APPROVAL', 'DEPOSIT']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [handleApproveClick, handleDepositClick],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  useEffect(() => {
    if (poolId) {
      resetState(poolData, 'DEPOSIT')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues({}, null, null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress, seed.isSeed])

  // max Slippage
  useEffect(() => {
    if (maxSlippage) {
      updateFormValues({}, null, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  // steps
  useEffect(() => {
    if (curve && poolData) {
      const updatedSteps = getSteps(
        activeKey,
        curve,
        poolData,
        formValues,
        formStatus,
        slippageConfirmed,
        slippage,
        steps,
        maxSlippage,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    curve?.chainId,
    poolData?.pool.id,
    signerAddress,
    formValues,
    formStatus,
    slippage.isHighSlippage,
    slippageConfirmed,
    maxSlippage,
  ])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disableForm = !seed.loaded || formStatus.formProcessing

  const estLpTokenReceivedUsdAmount = useMemo(() => {
    if (formLpTokenExpected.expected && formLpTokenExpected.virtualPrice) {
      const usdAmount = Number(formLpTokenExpected.expected) * Number(formLpTokenExpected.virtualPrice)
      return usdAmount.toString()
    }
    return ''
  }, [formLpTokenExpected.expected, formLpTokenExpected.virtualPrice])

  return (
    <>
      <FieldsDeposit
        formProcessing={disableForm}
        formValues={formValues}
        haveSigner={haveSigner}
        imageBaseUrl={imageBaseUrl}
        isSeed={seed.isSeed}
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        routerParams={routerParams}
        tokensMapper={tokensMapper}
        userPoolBalances={userPoolBalances}
        updateFormValues={updateFormValues}
      />

      <div>
        <DetailInfoEstLpTokens
          formLpTokenExpected={formLpTokenExpected}
          maxSlippage={maxSlippage}
          poolDataCacheOrApi={poolDataCacheOrApi}
        />

        <DetailInfoSlippage {...slippage} />

        {haveSigner && (
          <DetailInfoEstGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
        <DetailInfoSlippageTolerance
          customLabel={t`Additional slippage tolerance:`}
          maxSlippage={maxSlippage}
          stateKey={chainIdPoolId}
        />
      </div>

      {poolAlert && poolAlert?.isInformationOnlyAndShowInForm && (
        <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
      )}

      <TransferActions
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        loading={!chainId || !steps.length || !seed.loaded}
        routerParams={routerParams}
        seed={seed}
        userPoolBalances={userPoolBalances}
      >
        <AlertSlippage maxSlippage={maxSlippage} usdAmount={estLpTokenReceivedUsdAmount} />
        {formStatus.error && (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, null, null)} />
        )}
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </>
  )
}

export default FormDeposit
