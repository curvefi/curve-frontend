import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useConnection, useConfig } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { FieldLpToken } from '@/dex/components/PagePool/components/FieldLpToken'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { DEFAULT_ESTIMATED_GAS } from '@/dex/components/PagePool/utils'
import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'
import { useNetworks } from '@/dex/entities/networks'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, PoolData } from '@/dex/types/main.types'
import { getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const FormUnstake = ({ curve, poolData, poolDataCacheOrApi, routerParams, seed }: TransferProps) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const { rChainId } = routerParams
  const activeKey = useStore((state) => state.poolWithdraw.activeKey)
  const formEstGas = useStore((state) => state.poolWithdraw.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formStatus = useStore((state) => state.poolWithdraw.formStatus)
  const formValues = useStore((state) => state.poolWithdraw.formValues)
  const fetchStepUnstake = useStore((state) => state.poolWithdraw.fetchStepUnstake)
  const setFormValues = useStore((state) => state.poolWithdraw.setFormValues)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const { data: networks } = useNetworks()
  const network = (chainId && networks[chainId]) || null

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const config = useConfig()

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setTxInfoBar(null)
      void setFormValues(
        'UNSTAKE',
        config,
        curve,
        poolDataCacheOrApi.pool.id,
        poolData,
        updatedFormValues,
        null,
        seed.isSeed,
        '',
      )
    },
    [config, curve, poolData, poolDataCacheOrApi.pool.id, seed.isSeed, setFormValues],
  )

  const handleUnstakeClick = useCallback(
    async (activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues) => {
      const notifyMessage = t`Please confirm unstaking of ${formValues.stakedLpToken} LP Tokens`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepUnstake(activeKey, curve, poolData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        const TxDescription = t`Unstaked ${formValues.stakedLpToken} LP Tokens`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(network, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepUnstake, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      formStatus: FormStatus,
      isSeed: boolean,
    ) => {
      const { step } = formStatus
      const isValid = !isSeed && !formStatus.error && +formValues.stakedLpToken > 0
      const isComplete = formStatus.formTypeCompleted === 'UNSTAKE'

      const stepsObj: { [key: string]: Step } = {
        UNSTAKE: {
          key: 'UNSTAKE',
          status: getStepStatus(isComplete, step === 'UNSTAKE', isValid),
          type: 'action',
          content: isComplete ? t`Unstake Complete` : t`Unstake`,
          onClick: () => handleUnstakeClick(activeKey, curve, poolData, formValues),
        },
      }

      return ['UNSTAKE'].map((key) => stepsObj[key])
    },
    [handleUnstakeClick],
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
      resetState(poolData, 'UNSTAKE')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, seed.isSeed, signerAddress])

  // steps
  useEffect(() => {
    if (curve && poolData && seed.isSeed !== null) {
      const updatedSteps = getSteps(activeKey, curve, poolData, formValues, formStatus, seed.isSeed)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress, formValues, formStatus])

  const isDisabled = seed.isSeed === null || seed.isSeed || formStatus.formProcessing

  const { address: userAddress } = useConnection()
  const { gaugeTokenBalance, isLoading: gaugeTokenLoading } = usePoolTokenDepositBalances({
    chainId,
    userAddress,
    poolId,
  })

  return (
    <>
      {/* input fields */}
      <FieldLpToken
        amount={formValues.stakedLpToken}
        balanceLoading={gaugeTokenLoading}
        balance={gaugeTokenBalance ?? ''}
        hasError={+formValues.stakedLpToken > +(gaugeTokenBalance ?? '')}
        haveSigner={haveSigner}
        handleAmountChange={useCallback((stakedLpToken) => updateFormValues({ stakedLpToken }), [updateFormValues])}
        disabled={isDisabled}
      />

      {haveSigner && (
        <div>
          <DetailInfoEstGas chainId={rChainId} {...formEstGas} />
        </div>
      )}

      <TransferActions
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        loading={!chainId || !steps.length || !seed.loaded}
        routerParams={routerParams}
        seed={seed}
      >
        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({})} />}
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </>
  )
}
