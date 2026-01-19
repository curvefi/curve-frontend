import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConfig, type Config } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { AlertSlippage } from '@/dex/components/AlertSlippage'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { DetailInfoEstLpTokens } from '@/dex/components/PagePool/components/DetailInfoEstLpTokens'
import { DetailInfoExpectedApy } from '@/dex/components/PagePool/components/DetailInfoExpectedApy'
import { DetailInfoSlippage } from '@/dex/components/PagePool/components/DetailInfoSlippage'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import { WarningModal as HighSlippagePriceImpactModal } from '@/dex/components/PagePool/components/WarningModal'
import { FieldsDeposit } from '@/dex/components/PagePool/Deposit/components/FieldsDeposit'
import type { FormStatus, FormValues, LoadMaxAmount, StepKey } from '@/dex/components/PagePool/Deposit/types'
import { DEFAULT_FORM_LP_TOKEN_EXPECTED } from '@/dex/components/PagePool/Deposit/utils'
import type { Slippage, TransferProps } from '@/dex/components/PagePool/types'
import {
  amountsDescription,
  DEFAULT_ESTIMATED_GAS,
  DEFAULT_SLIPPAGE,
  tokensDescription,
} from '@/dex/components/PagePool/utils'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, Pool, PoolData } from '@/dex/types/main.types'
import { AlertBox } from '@ui/AlertBox'
import { getActiveStep, getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

export const FormDepositStake = ({
  chainIdPoolId,
  curve,
  blockchainId,
  poolAlert,
  poolData,
  poolDataCacheOrApi,
  maxSlippage,
  routerParams,
  seed,
  tokensMapper,
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
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[poolDataCacheOrApi.pool.id])
  const slippage = useStore((state) => state.poolDeposit.slippage[activeKey] ?? DEFAULT_SLIPPAGE)
  const fetchStepApprove = useStore((state) => state.poolDeposit.fetchStepApprove)
  const fetchStepDepositStake = useStore((state) => state.poolDeposit.fetchStepDepositStake)
  const setFormValues = useStore((state) => state.poolDeposit.setFormValues)
  const resetState = useStore((state) => state.poolDeposit.resetState)
  const { data: network } = useNetworkByChain({ chainId: rChainId })

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const config = useConfig()

  const updateFormValues = useCallback(
    (
      updatedFormValues: Partial<FormValues>,
      loadMaxAmount: LoadMaxAmount | null,
      updatedMaxSlippage: string | null,
    ) => {
      setTxInfoBar(null)
      setSlippageConfirmed(false)
      void setFormValues(
        'DEPOSIT_STAKE',
        config,
        curve,
        poolDataCacheOrApi.pool.id,
        poolData,
        updatedFormValues,
        loadMaxAmount,
        seed.isSeed,
        updatedMaxSlippage || maxSlippage,
      )
    },
    [config, curve, maxSlippage, poolData, poolDataCacheOrApi.pool.id, seed.isSeed, setFormValues],
  )

  const handleApproveClick = useCallback(
    async (activeKey: string, curve: CurveApi, pool: Pool, formValues: FormValues) => {
      const notifyMessage = t`Please approve spending your ${tokensDescription(formValues.amounts)}.`
      const { dismiss } = notify(notifyMessage, 'pending')
      await fetchStepApprove(activeKey, curve, 'DEPOSIT_STAKE', pool, formValues)
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepApprove],
  )

  const handleDepositStakeClick = useCallback(
    async (
      activeKey: string,
      config: Config,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const tokenText = amountsDescription(formValues.amounts)
      const notifyMessage = t`Please confirm deposit and staking of ${tokenText} LP Tokens at max ${maxSlippage}% slippage.`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepDepositStake(activeKey, config, curve, poolData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const TxDescription = t`Deposit and staked ${tokenText}`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(network, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepDepositStake, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      config: Config,
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
      const isComplete = formStatus.formTypeCompleted === 'DEPOSIT_STAKE'

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, formStatus.step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: () => handleApproveClick(activeKey, curve, poolData.pool, formValues),
        },
        DEPOSIT_STAKE: {
          key: 'DEPOSIT_STAKE',
          status: getStepStatus(isComplete, formStatus.step === 'DEPOSIT_STAKE', formStatus.isApproved && isValid),
          type: 'action',
          content: isComplete ? t`Deposit & Stake Complete` : t`Deposit & Stake`,
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
                    onClick: () => handleDepositStakeClick(activeKey, config, curve, poolData, formValues, maxSlippage),
                    disabled: !slippageConfirmed,
                  },
                  primaryBtnLabel: 'Deposit anyway',
                },
              }
            : { onClick: () => handleDepositStakeClick(activeKey, config, curve, poolData, formValues, maxSlippage) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.formProcessing || formStatus.formTypeCompleted) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['DEPOSIT_STAKE'] : ['APPROVAL', 'DEPOSIT_STAKE']
      }

      return stepsKey.map((key) => stepsObj[key])
    },
    [handleApproveClick, handleDepositStakeClick],
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
      resetState(poolData, 'DEPOSIT_STAKE')
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
        config,
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
    config,
    chainId,
    poolId,
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
        chainId={chainId}
        formProcessing={disableForm}
        formValues={formValues}
        haveSigner={haveSigner}
        blockchainId={blockchainId}
        isSeed={seed.isSeed}
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        routerParams={routerParams}
        tokensMapper={tokensMapper}
        updateFormValues={updateFormValues}
      />

      <div>
        <DetailInfoEstLpTokens
          formLpTokenExpected={formLpTokenExpected}
          maxSlippage={maxSlippage}
          poolDataCacheOrApi={poolDataCacheOrApi}
        />

        <DetailInfoExpectedApy
          lpTokenAmount={formLpTokenExpected.expected}
          poolDataCacheOrApi={poolDataCacheOrApi}
          crvApr={rewardsApy?.crv?.[0]}
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
        <SlippageToleranceActionInfo maxSlippage={maxSlippage} stateKey={chainIdPoolId} />
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
