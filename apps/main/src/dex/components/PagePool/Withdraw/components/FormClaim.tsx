import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { useConfig } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import type { TransferProps } from '@/dex/components/PagePool/types'
import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'
import { DEFAULT_FORM_STATUS, getClaimText } from '@/dex/components/PagePool/Withdraw/utils'
import { useNetworks } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, PoolData } from '@/dex/types/main.types'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Stats } from '@ui/Stats'
import { getStepStatus } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t, Trans } from '@ui-kit/lib/i18n'

export const FormClaim = ({ curve, poolData, poolDataCacheOrApi, routerParams, seed }: TransferProps) => {
  const isSubscribed = useRef(false)

  const { chainId, signerAddress } = curve || {}
  const activeKey = useStore((state) => state.poolWithdraw.activeKey)
  const formStatus = useStore((state) => state.poolWithdraw.formStatus)
  const formValues = useStore((state) => state.poolWithdraw.formValues)
  const fetchClaimable = useStore((state) => state.poolWithdraw.fetchClaimable)
  const fetchStepClaim = useStore((state) => state.poolWithdraw.fetchStepClaim)
  const setStateByKey = useStore((state) => state.poolWithdraw.setStateByKey)
  const setFormValues = useStore((state) => state.poolWithdraw.setFormValues)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const { data: networks } = useNetworks()
  const network = (chainId && networks[chainId]) || null

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const poolId = poolData?.pool?.id
  const haveSigner = !!signerAddress
  const { rewardsNeedNudging } = poolData?.gauge.status || {}
  const haveClaimableCrv = +formValues.claimableCrv > 0
  const haveClaimableRewards = +formValues.claimableRewards.length > 0

  const config = useConfig()

  const updateFormValues = useCallback(() => {
    setTxInfoBar(null)
    setSlippageConfirmed(false)
    void setFormValues('CLAIM', config, curve, poolDataCacheOrApi.pool.id, poolData, {}, null, seed.isSeed, '')
  }, [config, curve, poolData, poolDataCacheOrApi.pool.id, seed.isSeed, setFormValues])

  const handleClaimClick = useCallback(
    async (
      activeKey: string,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      formStatus: FormStatus,
      rewardsNeedNudging: boolean | undefined,
    ) => {
      const notifyMessage = getClaimText(formValues, formStatus, 'notify', rewardsNeedNudging)
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepClaim(activeKey, curve, poolData)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && network) {
        const claimedLabel = formStatus.isClaimCrv
          ? 'CRV'
          : `${formValues.claimableRewards.map((r) => r.symbol).join(', ')} rewards`
        const TxDescription = `Claimed ${claimedLabel}`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(network, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepClaim, network],
  )

  const getSteps = useCallback(
    (
      activeKey: string,
      curve: CurveApi,
      poolData: PoolData,
      formValues: FormValues,
      formStatus: FormStatus,
      rewardsNeedNudging: boolean | undefined,
      isSeed: boolean,
    ) => {
      const { isClaimCrv, step } = formStatus
      const isValid =
        !isSeed &&
        !formStatus.error &&
        (+formValues.claimableCrv > 0 || formValues.claimableRewards.some((r) => +r.amount > 0))
      const isClaimedCRV = formStatus.formTypeCompleted === 'CLAIM_CRV'
      const isClaimedRewards = formStatus.formTypeCompleted === 'CLAIM_REWARDS'
      const isComplete = isClaimedCRV || isClaimedRewards

      const stepsObj: { [key: string]: Step } = {
        CLAIM: {
          key: 'CLAIM',
          status: getStepStatus(isComplete, step === 'CLAIM', isValid),
          type: 'action',
          content: isComplete
            ? isClaimedCRV
              ? getClaimText({ ...formValues, claimableCrv: '1' }, formStatus, 'success', rewardsNeedNudging)
              : t`Claim Rewards Complete`
            : isClaimCrv
              ? getClaimText(formValues, formStatus, 'claimCrvButton', rewardsNeedNudging)
              : t`Claim Rewards`,
          onClick: () => {
            void handleClaimClick(activeKey, curve, poolData, formValues, formStatus, rewardsNeedNudging)
          },
        },
      }

      return ['CLAIM'].map((key) => stepsObj[key])
    },
    [handleClaimClick],
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
      resetState(poolData, 'CLAIM')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId])

  // curve state change
  useEffect(() => {
    if (chainId && poolId) {
      updateFormValues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress, seed.isSeed])

  // fetch claimable
  useEffect(() => {
    if (chainId && poolData && haveSigner) {
      void fetchClaimable(activeKey, chainId, poolData.pool)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress])

  // steps
  useEffect(() => {
    if (curve && poolData && seed.isSeed !== null) {
      const updatedSteps = getSteps(activeKey, curve, poolData, formValues, formStatus, rewardsNeedNudging, seed.isSeed)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolData, slippageConfirmed, signerAddress, formValues, formStatus, rewardsNeedNudging, seed.isSeed])

  const handleBtnClick = (isClaimCrv: boolean, isClaimRewards: boolean) => {
    setTxInfoBar(null)
    setSlippageConfirmed(false)

    if (curve && poolData) {
      const cFormStatus = lodash.cloneDeep(DEFAULT_FORM_STATUS)
      cFormStatus.isApproved = formStatus.isApproved
      cFormStatus.isClaimCrv = isClaimCrv
      cFormStatus.isClaimRewards = isClaimRewards

      setStateByKey('formStatus', cFormStatus)
      void handleClaimClick(activeKey, curve, poolData, formValues, cFormStatus, rewardsNeedNudging)
    }
  }

  const rewardsNeedNudgingAndHaveGauge = rewardsNeedNudging && !poolData?.gauge.isKilled

  return (
    <TransferActions
      poolData={poolData}
      poolDataCacheOrApi={poolDataCacheOrApi}
      loading={!chainId || !steps.length || seed.isSeed === null}
      routerParams={routerParams}
      seed={seed}
    >
      <ClaimableTokensWrapper>
        {haveClaimableCrv || haveClaimableRewards ? (
          <>
            {haveClaimableCrv && (
              <Stats isOneLine isBorderBottom={formValues.claimableRewards.length > 0} label="CRV">
                {formatNumber(formValues.claimableCrv)}
              </Stats>
            )}

            {formValues.claimableRewards.map(({ token, symbol, amount }, idx) => (
              <Stats
                isOneLine
                isBorderBottom={idx !== formValues.claimableRewards.length - 1}
                key={token}
                label={symbol}
              >
                {formatNumber(amount)}
              </Stats>
            ))}
          </>
        ) : (
          <p>{t`No claimable rewards`}</p>
        )}
      </ClaimableTokensWrapper>

      {rewardsNeedNudgingAndHaveGauge && (
        <AlertBox alertType="info">
          <Trans>
            This pool has CRV rewards that aren&rsquo;t streaming yet. Click &lsquo;Claim CRV&rsquo; to resume reward
            streaming for you and everyone else!
          </Trans>
        </AlertBox>
      )}

      {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={updateFormValues} />}
      {txInfoBar}
      {!formStatus.isClaimRewards && !formStatus.isClaimCrv && formStatus.formTypeCompleted === '' ? (
        <Box grid gridAutoFlow="column" gridColumnGap="3">
          {curve && poolData && (haveClaimableCrv || rewardsNeedNudgingAndHaveGauge) && (
            <Button
              disabled={!!formStatus.error}
              variant="filled"
              size="large"
              onClick={() => handleBtnClick(true, false)}
            >
              {getClaimText(formValues, formStatus, 'claimCrvButton', rewardsNeedNudgingAndHaveGauge)}
            </Button>
          )}
          {curve && poolData && haveClaimableRewards && (
            <Button
              disabled={!!formStatus.error}
              variant="filled"
              size="large"
              onClick={() => handleBtnClick(false, true)}
            >
              {t`Claim Rewards`}
            </Button>
          )}
        </Box>
      ) : (
        <Stepper steps={steps} />
      )}
    </TransferActions>
  )
}

const ClaimableTokensWrapper = styled.div`
  padding: 0.5rem 0.7rem;
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--box--primary--content--shadow-color);
  background-color: var(--box--primary--content--background-color);
`
