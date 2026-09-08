import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useConnection, useConfig } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { FieldLpToken } from '@/dex/components/PagePool/components/FieldLpToken'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { DEFAULT_ESTIMATED_GAS } from '@/dex/components/PagePool/utils'
import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, PoolData } from '@/dex/types/main.types'
import { notify } from '@evm-ui/features/connect-wallet'
import { FormContent } from '@evm-ui/widgets/DetailPageLayout/FormContent'
import { getStepStatus } from '@legacy-ui/Stepper/helpers'
import { Stepper } from '@legacy-ui/Stepper/Stepper'
import type { Step } from '@legacy-ui/Stepper/types'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'
import { t } from '@ui/lib/i18n'

export const FormUnstake = ({ seed }: TransferProps) => {
  const { chainId, userAddress: signerAddress, poolId, poolData, api: curve } = usePoolContext()
  const isSubscribedRef = useRef(false)

  const activeKey = useStore(state => state.poolWithdraw.activeKey)
  const formEstGas = useStore(state => state.poolWithdraw.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formStatus = useStore(state => state.poolWithdraw.formStatus)
  const formValues = useStore(state => state.poolWithdraw.formValues)
  const fetchStepUnstake = useStore(state => state.poolWithdraw.fetchStepUnstake)
  const setFormValues = useStore(state => state.poolWithdraw.setFormValues)
  const resetState = useStore(state => state.poolWithdraw.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const haveSigner = !!signerAddress

  const config = useConfig()

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setTxInfoBar(null)
      void setFormValues('UNSTAKE', config, curve, poolId, poolData, updatedFormValues, null, seed.isSeed, '')
    },
    [config, curve, poolData, poolId, seed.isSeed, setFormValues],
  )

  const handleUnstakeClick = useCallback(
    async (activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues) => {
      const notifyMessage = t`Please confirm unstaking of ${formValues.stakedLpToken} LP Tokens`
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepUnstake(activeKey, curve, poolData, formValues)

      if (isSubscribedRef.current && resp?.hash && resp.activeKey === activeKey && chainId) {
        const TxDescription = t`Unstaked ${formValues.stakedLpToken} LP Tokens`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(chainId, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepUnstake, chainId],
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

      const stepsObj: Record<string, Step> = {
        UNSTAKE: {
          key: 'UNSTAKE',
          status: getStepStatus(isComplete, step === 'UNSTAKE', isValid),
          type: 'action',
          content: isComplete ? t`Unstake Complete` : t`Unstake`,
          onClick: () => void handleUnstakeClick(activeKey, curve, poolData, formValues),
        },
      }

      return ['UNSTAKE'].map(key => stepsObj[key])
    },
    [handleUnstakeClick],
  )

  // onMount
  useEffect(() => {
    isSubscribedRef.current = true

    return () => {
      isSubscribedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (poolId) {
      resetState(poolData)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [poolId])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues({})
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolId, seed.isSeed, signerAddress])

  // steps
  useEffect(() => {
    if (curve && poolData && seed.isSeed !== null) {
      const updatedSteps = getSteps(activeKey, curve, poolData, formValues, formStatus, seed.isSeed)
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolId, signerAddress, formValues, formStatus])

  const isDisabled = seed.isSeed === null || seed.isSeed || formStatus.formProcessing

  const { address: userAddress } = useConnection()
  const { gaugeTokenBalance } = usePoolTokenDepositBalances({ chainId, userAddress, poolId })

  return (
    <FormContent>
      {/* input fields */}
      <FieldLpToken
        amount={formValues.stakedLpToken}
        balance={gaugeTokenBalance}
        isNotEnough={+formValues.stakedLpToken > +(gaugeTokenBalance.data ?? '0')}
        handleAmountChange={useCallback(stakedLpToken => updateFormValues({ stakedLpToken }), [updateFormValues])}
        disabled={isDisabled}
      />

      {haveSigner && (
        <div>
          <DetailInfoEstGas chainId={chainId} {...formEstGas} />
        </div>
      )}

      <TransferActions loading={!chainId || !steps.length || !seed.loaded} seed={seed}>
        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({})} />}
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </FormContent>
  )
}
