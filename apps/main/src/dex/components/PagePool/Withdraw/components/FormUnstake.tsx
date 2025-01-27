import type { FormStatus, FormValues } from '@main/components/PagePool/Withdraw/types'
import type { Step } from '@ui/Stepper/types'
import type { TransferProps } from '@main/components/PagePool/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { DEFAULT_ESTIMATED_GAS } from '@main/components/PagePool'
import { getStepStatus } from '@ui/Stepper/helpers'
import { formatNumber } from '@ui/utils'
import useStore from '@main/store/useStore'
import AlertFormError from '@main/components/AlertFormError'
import DetailInfoEstGas from '@main/components/DetailInfoEstGas'
import FieldLpToken from '@main/components/PagePool/components/FieldLpToken'
import TransferActions from '@main/components/PagePool/components/TransferActions'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { CurveApi, PoolData } from '@main/types/main.types'
import { useWallet } from '@ui-kit/features/connect-wallet'

const FormUnstake = ({ curve, poolData, poolDataCacheOrApi, routerParams, seed, userPoolBalances }: TransferProps) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const { rChainId } = routerParams
  const activeKey = useStore((state) => state.poolWithdraw.activeKey)
  const formEstGas = useStore((state) => state.poolWithdraw.formEstGas[activeKey] ?? DEFAULT_ESTIMATED_GAS)
  const formStatus = useStore((state) => state.poolWithdraw.formStatus)
  const formValues = useStore((state) => state.poolWithdraw.formValues)
  const fetchStepUnstake = useStore((state) => state.poolWithdraw.fetchStepUnstake)
  const notifyNotification = useWallet.notify
  const setFormValues = useStore((state) => state.poolWithdraw.setFormValues)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const network = useStore((state) => (chainId ? state.networks.networks[chainId] : null))

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setTxInfoBar(null)
      setFormValues('UNSTAKE', curve, poolDataCacheOrApi.pool.id, poolData, updatedFormValues, null, seed.isSeed, '')
    },
    [curve, poolData, poolDataCacheOrApi.pool.id, seed.isSeed, setFormValues],
  )

  const handleUnstakeClick = useCallback(
    async (activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues) => {
      const notifyMessage = t`Please confirm unstaking of ${formValues.stakedLpToken} LP Tokens`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepUnstake(activeKey, curve, poolData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        const TxDescription = t`Unstaked ${formValues.stakedLpToken} LP Tokens`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={network.scanTxPath(resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepUnstake, notifyNotification, network],
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
  const balGauge = userPoolBalances?.gauge as string

  return (
    <>
      {/* input fields */}
      <FieldLpToken
        amount={formValues.stakedLpToken}
        balanceLoading={haveSigner && typeof userPoolBalances === 'undefined'}
        balance={haveSigner ? formatNumber(balGauge) : ''}
        hasError={+formValues.stakedLpToken > +balGauge}
        haveSigner={haveSigner}
        handleAmountChange={(stakedLpToken) => {
          updateFormValues({ stakedLpToken })
        }}
        disabledMaxButton={isDisabled}
        disableInput={isDisabled}
        handleMaxClick={() => {
          updateFormValues({ stakedLpToken: (userPoolBalances?.gauge as string) ?? '0' })
        }}
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
        userPoolBalances={userPoolBalances}
      >
        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({})} />}
        {txInfoBar}
        <Stepper steps={steps} />
      </TransferActions>
    </>
  )
}

export default FormUnstake
