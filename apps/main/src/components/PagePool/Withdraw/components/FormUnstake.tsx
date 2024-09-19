import type { UnstakeFormValues } from '@/entities/withdraw'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'

import { useUnstake, useUnstakeEstGas } from '@/entities/withdraw'
import { UnstakeContext } from '@/components/PagePool/Withdraw/contextUnstake'
import { getMutationStepLabel, getMutationStepStatus } from '@/components/PagePool/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'

import { TxInfoBars } from '@/ui/TxInfoBar'
import AlertFormError from '@/components/AlertFormError'
import DetailsInfoEstGas from '@/components/PagePool/components/DetailsInfoEstGas'
import FieldGauge from '@/components/PagePool/Withdraw/components/FieldGauge'
import Stepper from '@/ui/Stepper'
import TransferActions from '@/components/PagePool/components/TransferActions'

const FormUnstake = () => {
  const { chainId, signerAddress, poolId, poolBaseSignerKeys, signerPoolBalances, isSeed, scanTxPath } =
    usePoolContext()

  const [formValues, setFormValues] = useState<UnstakeFormValues>({ gauge: '', gaugeError: '' })
  const [steps, setSteps] = useState<Step[]>([])

  const { gauge, gaugeError } = formValues

  const gaugeBalance = signerPoolBalances?.['gauge'] ?? ''
  const isInProgress = useMemo(() => steps.some(({ status }) => status === 'in-progress'), [steps])

  const actionParams = {
    ...poolBaseSignerKeys,
    isLoadingDetails: false,
    isApproved: true,
    gauge,
    gaugeError,
  }

  const { data: { estimatedGas = null } = {}, ...estGasApprovalState } = useUnstakeEstGas({
    ...actionParams,
    isInProgress,
  })

  const {
    enabled: enabledUnstake,
    mutation: {
      mutate: unstake,
      data: unstakeData,
      status: unstakeStatus,
      error: unstakeError,
      reset: unstakeReset,
      ...unstakeState
    },
  } = useUnstake(actionParams)

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<UnstakeFormValues>) => {
      unstakeReset()

      setFormValues((prevFormValues) => {
        const all = { ...prevFormValues, gaugeError: '', ...updatedFormValues }
        let gaugeError: UnstakeFormValues['gaugeError'] = ''
        if (signerAddress) gaugeError = Number(all.gauge) > Number(gaugeBalance) ? 'too-much' : ''
        return { ...all, gaugeError }
      })
    },
    [gaugeBalance, signerAddress, unstakeReset]
  )

  const resetForm = useCallback(() => {
    setFormValues({ gauge: '', gaugeError: '' })
  }, [])

  // reset form if signerAddress changed
  useEffect(() => {
    resetForm()
  }, [resetForm, signerAddress])

  // reset form after unstake
  useEffect(() => {
    if (unstakeState.isSuccess) resetForm()
  }, [resetForm, unstakeState.isSuccess])

  // steps
  useEffect(() => {
    if (!chainId || !poolId || !signerAddress || isSeed === null) {
      setSteps([])
      return
    }

    const SUBMIT: Step = {
      key: 'SUBMIT',
      status: getMutationStepStatus(enabledUnstake.enabled, unstakeStatus),
      type: 'action',
      content: `${t`Unstake`} ${getMutationStepLabel(false, unstakeStatus)}`,
      onClick: () => {
        unstakeReset()
        unstake({
          chainId,
          poolId,
          signerAddress,
          isLoadingDetails: false,
          isApproved: true,
          gauge,
          gaugeError,
        })
      },
    }

    setSteps([SUBMIT])
  }, [
    chainId,
    enabledUnstake.enabled,
    gauge,
    gaugeError,
    isSeed,
    poolId,
    signerAddress,
    unstake,
    unstakeReset,
    unstakeStatus,
  ])

  return (
    <UnstakeContext.Provider
      value={{
        formValues,
        isLoading: isSeed === null,
        isDisabled: unstakeState.isPending || isSeed === null || isSeed,
        updateFormValues,
      }}
    >
      <FieldGauge />
      <DetailsInfoEstGas
        activeStep={1}
        estimatedGas={estimatedGas}
        estimatedGasIsLoading={estGasApprovalState.isFetching}
        stepsLength={steps.length}
      />

      <TransferActions>
        <Stepper steps={steps} />
        <AlertFormError errorKey={(enabledUnstake.error || estGasApprovalState.error || unstakeError)?.message ?? ''} />
        <TxInfoBars data={unstakeData} error={unstakeError} label={t`unstake`} scanTxPath={scanTxPath} />
      </TransferActions>
    </UnstakeContext.Provider>
  )
}

export default FormUnstake
