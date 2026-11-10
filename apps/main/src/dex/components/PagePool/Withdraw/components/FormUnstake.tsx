'use no memo' // Legacy code excluded from React Compiler.

/* eslint-disable react-hooks/set-state-in-effect -- Legacy code will be deleted. */

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useConnection, useConfig } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { DetailInfoEstGas } from '@/dex/components/DetailInfoEstGas'
import { FieldLpToken } from '@/dex/components/PagePool/components/FieldLpToken'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { DEFAULT_ESTIMATED_GAS } from '@/dex/components/PagePool/utils'
import { handleWithdrawError } from '@/dex/components/PagePool/Withdraw/handleWithdrawError'
import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useStore } from '@/dex/store/useStore'
import { CurveApi } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { getStepStatus } from '@legacy-ui/Stepper/helpers'
import { Stepper } from '@legacy-ui/Stepper/Stepper'
import type { Step } from '@legacy-ui/Stepper/types'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'
import { FormContent } from '@ui/features/forms/components/FormContent'
import { notify } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'

export const FormUnstake = ({ seed }: TransferProps) => {
  const {
    chainId,
    userAddress: signerAddress,
    poolAddress,
    pool: { data: pool },
    api: curve,
    isWrapped,
  } = usePoolContext()
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
      if (!pool) return
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setTxInfoBar(null)
      void setFormValues(
        'UNSTAKE',
        config,
        curve,
        pool.id,
        pool,
        { isWrapped, ...updatedFormValues },
        null,
        seed.data,
        '',
      )
    },
    [config, curve, isWrapped, pool, seed.data, setFormValues],
  )

  const handleUnstakeClick = useCallback(
    async (activeKey: string, curve: CurveApi, pool: PoolTemplate, formValues: FormValues) => {
      const notifyMessage = t`Please confirm unstaking of ${formValues.stakedLpToken} LP Tokens`
      const { dismiss } = notify(notifyMessage, 'pending')
      try {
        const resp = await fetchStepUnstake(activeKey, curve, pool, formValues)

        if (isSubscribedRef.current && resp?.hash && resp.activeKey === activeKey && chainId) {
          const TxDescription = t`Unstaked ${formValues.stakedLpToken} LP Tokens`
          setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(chainId, resp.hash)} />)
        }
      } catch (error) {
        handleWithdrawError(activeKey, error)
      } finally {
        dismiss()
      }
    },
    [fetchStepUnstake, chainId],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      pool: PoolTemplate,
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
          onClick: () => void handleUnstakeClick(activeKey, curve, pool, formValues),
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
    if (pool) {
      resetState(pool, isWrapped)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [pool?.address])

  // curve state change
  useEffect(() => {
    if (chainId && poolAddress) {
      updateFormValues({})
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolAddress, seed.data, signerAddress])

  // steps
  useEffect(() => {
    if (curve && pool && seed.data != null) {
      const updatedSteps = getSteps(activeKey, curve, pool, formValues, formStatus, seed.data)
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolAddress, signerAddress, formValues, formStatus])

  const isDisabled = seed.data == null || seed.data || formStatus.formProcessing

  const { address: userAddress } = useConnection()
  const { gaugeTokenBalance } = usePoolTokenDepositBalances({ chainId, userAddress, poolAddress })

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

      <TransferActions loading={!chainId || !steps.length} seed={seed}>
        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({})} />}
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </FormContent>
  )
}
