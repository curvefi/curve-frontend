import type { ClaimType, ClaimableDetailsResp } from '@/entities/withdraw'
import type { Step } from '@/ui/Stepper/types'

import React, { useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { useClaim, useClaimableDetails, useClaimableEstGas } from '@/entities/withdraw'
import { ClaimContextProvider } from '@/components/PagePool/Claim/contextClaim'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getClaimText } from '@/components/PagePool/Withdraw/utils'
import { getMutationStepStatus } from '@/components/PagePool/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'

import { TxInfoBars } from '@/ui/TxInfoBar'
import AlertFormError from '@/components/AlertFormError'
import AlertRewardsNeedNudging from '@/components/PagePool/Claim/components/AlertRewardsNeedNudging'
import Box from '@/ui/Box'
import BtnClaim from '@/components/PagePool/Claim/components/BtnClaim'
import BtnClaimCrv from '@/components/PagePool/Claim/components/BtnClaimCrv'
import BtnClaimRewards from '@/components/PagePool/Claim/components/BtnClaimRewards'
import DetailsClaimableCrv from '@/components/PagePool/Claim/components/DetailsClaimableCrv'
import DetailsClaimableRewards from '@/components/PagePool/Claim/components/DetailsClaimableRewards'
import DetailsInfoEstGas from '@/components/PagePool/components/DetailsInfoEstGas'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import TransferActions from '@/components/PagePool/components/TransferActions'

const FormClaim = () => {
  const { chainId, poolId, signerAddress, isSeed, poolBaseSignerKeys, poolData, scanTxPath } = usePoolContext()

  const [claimType, setClaimType] = useState<ClaimType>('')
  const [steps, setSteps] = useState<Step[]>([])

  const { rewardsNeedNudging } = poolData?.gauge.status || {}

  const { data: { claimableCrv = '', claimableRewards = [] } = {}, ...claimableState } =
    useClaimableDetails(poolBaseSignerKeys)

  const haveClaimableCrv = Number(claimableCrv) > 0
  const haveClaimableRewards = claimableRewards.length > 0
  const haveClaimables = haveClaimableCrv || haveClaimableRewards
  const claimableRewardsTotal = useMemo(
    () => claimableRewards.reduce((prev, { amount }) => prev + Number(amount), 0),
    [claimableRewards]
  )

  const actionParams = useMemo(
    () => ({
      ...poolBaseSignerKeys,
      isLoadingDetails: claimableState.isFetching,
      isApproved: true,
      claimType,
      claimableCrv,
      claimableRewards,
    }),
    [claimType, claimableCrv, claimableRewards, claimableState.isFetching, poolBaseSignerKeys]
  )

  const { data: estimatedGas = null, ...estGasState } = useClaimableEstGas(actionParams)

  const {
    enabled: enabledClaim,
    mutation: { mutate: claim, data: claimData, error: claimError, reset: claimReset, ...claimState },
  } = useClaim(actionParams)

  const claimStatus = useMemo(
    () => ({
      isIdle: claimState.isIdle,
      isPending: claimState.isPending,
      isError: claimState.isError,
      isSuccess: claimState.isSuccess,
    }),
    [claimState.isError, claimState.isIdle, claimState.isPending, claimState.isSuccess]
  )

  // steps
  useEffect(() => {
    if (!chainId || !poolId || !signerAddress || isSeed === null) {
      setSteps([])
      return
    }

    const SUBMIT: Step = {
      key: 'CLAIM',
      status: getMutationStepStatus(enabledClaim.enabled, claimStatus),
      type: 'action',
      content: getContent(claimType, claimableState.isSuccess, claimableCrv, claimableRewards, rewardsNeedNudging),
      onClick: () => {
        claimReset()
        claim({
          chainId,
          poolId,
          signerAddress,
          isLoadingDetails: false,
          isApproved: true,
          claimType,
          claimableCrv,
          claimableRewards,
        })
      },
    }

    setSteps([SUBMIT])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainId,
    claim,
    claimReset,
    claimableState.isSuccess,
    claimStatus,
    claimType,
    claimableCrv,
    claimableRewardsTotal,
    enabledClaim.enabled,
    isSeed,
    poolId,
    rewardsNeedNudging,
    signerAddress,
  ])

  const rewardsNeedNudgingAndHaveGauge = rewardsNeedNudging && !poolData?.gauge.isKilled

  return (
    <ClaimContextProvider
      value={{
        claimType,
        claimableCrv,
        claimableRewards,
        haveClaimableCrv,
        haveClaimableRewards,
        haveClaimables,
        isLoading: isSeed == null,
        isDisabled: claimState.isPending,
        setClaimType,
      }}
    >
      {!isSeed && (
        <>
          <ClaimableTokensWrapper>
            {haveClaimables && (
              <>
                <DetailsClaimableCrv />
                <DetailsClaimableRewards />
              </>
            )}
            {!haveClaimables && !claimableState.isFetching && <p>{t`No claimable rewards`}</p>}
            {!haveClaimables && claimableState.isInitialLoading && (
              <SpinnerWrapper minHeight="40px">
                <Spinner />
              </SpinnerWrapper>
            )}
          </ClaimableTokensWrapper>

          <DetailsInfoEstGas
            activeStep={!!signerAddress ? getActiveStep(steps) : null}
            estimatedGas={estimatedGas}
            estimatedGasIsLoading={estGasState.isFetching}
            stepsLength={steps.length}
          />
        </>
      )}

      <TransferActions>
        {haveClaimables || rewardsNeedNudging ? (
          <>
            <Box grid gridAutoFlow="column" gridColumnGap="3">
              <BtnClaimCrv
                isDisabled={claimState.isPending}
                isPending={claimState.isPending && enabledClaim.enabled && claimType === 'CLAIM_CRV'}
                isSuccess={claimState.isSuccess && claimType === 'CLAIM_CRV'}
                claimableCrv={claimableCrv}
                claimableRewards={claimableRewards}
                rewardsNeedNudgingAndHaveGauge={rewardsNeedNudgingAndHaveGauge}
                handleClaimClick={() => {
                  setClaimType('CLAIM_CRV')
                  claim({ ...actionParams, claimType: 'CLAIM_CRV' })
                }}
              />
              <BtnClaimRewards
                isDisabled={claimState.isPending}
                isPending={claimState.isPending && enabledClaim.enabled && claimType === 'CLAIM_REWARDS'}
                isSuccess={claimState.isSuccess && claimType === 'CLAIM_REWARDS'}
                claimableRewards={claimableRewards}
                handleClaimClick={() => {
                  setClaimType('CLAIM_REWARDS')
                  claim({ ...actionParams, claimType: 'CLAIM_REWARDS' })
                }}
              />
            </Box>
          </>
        ) : (
          <BtnClaim />
        )}
        <AlertFormError
          errorKey={(enabledClaim.error || estGasState.error || claimError || claimableState.error)?.message ?? ''}
        />
        {rewardsNeedNudgingAndHaveGauge && <AlertRewardsNeedNudging />}
        <TxInfoBars data={claimData} error={claimError} label={t`claim`} scanTxPath={scanTxPath} />
      </TransferActions>
    </ClaimContextProvider>
  )
}

const ClaimableTokensWrapper = styled.div`
  padding: 0.5rem 0.7rem;
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--box--primary--content--shadow-color);
  background-color: var(--box--primary--content--background-color);
`

function getContent(
  claimType: ClaimType,
  isSuccess: boolean,
  claimableCrv: string,
  claimableRewards: ClaimableDetailsResp['claimableRewards'],
  rewardsNeedNudging: boolean | undefined
) {
  if (claimType === 'CLAIM_CRV' && !isSuccess) {
    return getClaimText(claimableCrv, claimableRewards, claimType, 'success', rewardsNeedNudging)
  }

  if (claimType === 'CLAIM_CRV' && isSuccess) {
    return t`Claim Rewards Complete`
  }

  if (claimType === 'CLAIM_REWARDS' && !isSuccess) {
    return getClaimText(claimableCrv, claimableRewards, claimType, 'claimCrvButton', rewardsNeedNudging)
  }

  if (claimType === 'CLAIM_REWARDS' && isSuccess) {
    return claimType === 'CLAIM_REWARDS'
  }

  return ''
}

export default FormClaim
