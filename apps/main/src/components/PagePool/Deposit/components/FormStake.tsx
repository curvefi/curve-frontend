import type { Step } from '@/ui/Stepper/types'
import type { StakeFormValues } from '@/entities/stake'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'

import { useStakeApproval, useStakeEstGas, useApproveStake, useStake } from '@/entities/stake'
import { StakeContextProvider } from '@/components/PagePool/Deposit/contextStake'
import { calcNewCrvApr } from '@/components/PagePool/Deposit/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getMutationStepLabel, getMutationStepStatus, showStepApprove } from '@/components/PagePool/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import usePoolTotalStaked from '@/hooks/usePoolTotalStaked'
import useStore from '@/store/useStore'

import { FieldsWrapper } from '@/components/PagePool/styles'
import { TxInfoBars } from '@/ui/TxInfoBar'
import AlertFormError from '@/components/AlertFormError'
import DetailInfoExpectedApy from '@/components/PagePool/components/DetailInfoExpectedApy'
import DetailsInfoEstGas from '@/components/PagePool/components/DetailsInfoEstGas'
import FieldLpToken from '@/components/PagePool/Deposit/components/FieldLpToken'
import Stepper from '@/ui/Stepper'
import TransferActions from '@/components/PagePool/components/TransferActions'

const FormStake = () => {
  const { rChainId, chainId, signerAddress, poolId, poolBaseSignerKeys, pool, signerPoolBalances, isSeed, scanTxPath } =
    usePoolContext()
  const { gaugeTotalSupply } = usePoolTotalStaked(pool) ?? {}

  const crvApr = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[poolId ?? '']?.crv?.[0])

  const [steps, setSteps] = useState<Step[]>([])
  const [formValues, setFormValues] = useState<StakeFormValues>({
    lpToken: '',
    lpTokenError: '',
  })

  const { lpToken, lpTokenError } = formValues

  const lpTokenBalance = signerPoolBalances?.['lpToken']
  const newCrvApr = useMemo(() => calcNewCrvApr(crvApr, lpToken, gaugeTotalSupply), [crvApr, lpToken, gaugeTotalSupply])
  const showAprChange = Number(crvApr) > 0 && !!newCrvApr && newCrvApr.ratio > 1.25
  const isInProgress = useMemo(() => steps.some(({ status }) => status === 'in-progress'), [steps])

  const { data: isApproved = false, ...approvalState } = useStakeApproval({
    ...poolBaseSignerKeys,
    isInProgress,
    lpToken,
    lpTokenError,
  })

  const { data: estimatedGas = null, ...estGasState } = useStakeEstGas({
    ...poolBaseSignerKeys,
    isApproved,
    isInProgress,
    lpToken,
    lpTokenError,
  })

  const actionParams = useMemo(
    () => ({
      ...poolBaseSignerKeys,
      lpToken,
      lpTokenError,
      isLoadingDetails: approvalState.isFetching || estGasState.isFetching,
      isApproved: isApproved,
    }),
    [approvalState.isFetching, estGasState.isFetching, isApproved, lpToken, lpTokenError, poolBaseSignerKeys]
  )

  const {
    enabled: enabledApprove,
    mutation: { mutate: approve, data: approveData, error: approveError, reset: approveReset, ...approveState },
  } = useApproveStake(actionParams)

  const approveStatus = useMemo(
    () => ({
      isIdle: approveState.isIdle,
      isPending: approveState.isPending,
      isError: approveState.isError,
      isSuccess: approveState.isSuccess,
    }),
    [approveState.isError, approveState.isIdle, approveState.isPending, approveState.isSuccess]
  )

  const {
    enabled: enabledStake,
    mutation: { mutate: stake, data: stakeData, error: stakeError, reset: stakeReset, ...stakeState },
  } = useStake(actionParams)

  const stakeStatus = useMemo(
    () => ({
      isIdle: stakeState.isIdle,
      isPending: stakeState.isPending,
      isError: stakeState.isError,
      isSuccess: stakeState.isSuccess,
    }),
    [stakeState.isError, stakeState.isIdle, stakeState.isPending, stakeState.isSuccess]
  )

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<StakeFormValues>) => {
      approveReset()
      stakeReset()

      setFormValues((prevFormValues) => {
        const all = { ...prevFormValues, lpTokenError: '', ...updatedFormValues }

        // validation
        let lpTokenError: StakeFormValues['lpTokenError'] = ''
        if (signerAddress) lpTokenError = Number(all.lpToken) > Number(lpTokenBalance) ? 'too-much' : ''
        return { ...all, lpTokenError }
      })
    },
    [approveReset, lpTokenBalance, signerAddress, stakeReset]
  )

  const resetForm = useCallback(() => {
    setFormValues({ lpToken: '', lpTokenError: '' })
  }, [])

  // reset form if signerAddress changed
  useEffect(() => {
    resetForm()
  }, [resetForm, signerAddress])

  // reset form after stake
  useEffect(() => {
    if (stakeState.isSuccess) resetForm()
  }, [resetForm, stakeState.isSuccess])

  // steps
  useEffect(() => {
    if (!chainId || !poolId || !signerAddress || isSeed === null) {
      setSteps([])
      return
    }

    const actionParams = {
      chainId,
      poolId,
      signerAddress,
      lpToken,
      lpTokenError,
      isLoadingDetails: false,
    }

    const APPROVAL: Step = {
      key: 'APPROVAL',
      status: getMutationStepStatus(enabledApprove.enabled, approveStatus),
      type: 'action',
      content: getMutationStepLabel(true, approveStatus),
      onClick: () => {
        approveReset()
        approve({ ...actionParams, isApproved: false })
      },
    }

    const SUBMIT: Step = {
      key: 'STAKE',
      status: getMutationStepStatus(enabledStake.enabled, stakeStatus),
      type: 'action',
      content: `${t`Stake`} ${getMutationStepLabel(false, stakeStatus)}`,
      onClick: () => {
        stakeReset()
        stake({ ...actionParams, isApproved: true })
      },
    }

    const showApproveAction = showStepApprove(isApproved, approveData, stakeData)
    setSteps(showApproveAction ? [APPROVAL, SUBMIT] : [SUBMIT])
  }, [
    approve,
    approveData,
    approveReset,
    approveStatus,
    chainId,
    enabledApprove.enabled,
    enabledStake.enabled,
    isApproved,
    isSeed,
    lpToken,
    lpTokenError,
    poolId,
    signerAddress,
    stake,
    stakeData,
    stakeReset,
    stakeStatus,
  ])

  return (
    <StakeContextProvider
      value={{
        formValues,
        isDisabled: approveState.isPending || stakeState.isPending || isSeed === null,
        isLoading: isSeed === null,
        updateFormValues,
      }}
    >
      {isSeed !== null && (
        <>
          <FieldsWrapper>
            <FieldLpToken />
          </FieldsWrapper>

          <div>
            {showAprChange && <DetailInfoExpectedApy crvApr={crvApr} newCrvApr={newCrvApr} />}
            <DetailsInfoEstGas
              activeStep={!!signerAddress ? getActiveStep(steps) : null}
              isDivider={showAprChange}
              estimatedGas={estimatedGas}
              estimatedGasIsLoading={estGasState.isFetching}
              stepsLength={steps.length}
            />
          </div>
        </>
      )}

      <TransferActions>
        {isSeed !== null && (
          <>
            <Stepper steps={steps} />
            <AlertFormError
              errorKey={
                (enabledApprove.error || approvalState.error || estGasState.error || approveError || stakeError)
                  ?.message ?? ''
              }
            />
            {(!!approveData || !!stakeData) && (
              <div>
                <TxInfoBars data={approveData} error={approveError} scanTxPath={scanTxPath} />
                <TxInfoBars data={stakeData} error={stakeError} label={t`stake`} scanTxPath={scanTxPath} />
              </div>
            )}
          </>
        )}
      </TransferActions>
    </StakeContextProvider>
  )
}

export default FormStake
