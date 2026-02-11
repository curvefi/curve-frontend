import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import type { FormStatus, RewardType } from '@/lend/components/PageVault/VaultClaim/types'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { Api, MarketClaimable, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Spinner } from '@ui/Spinner'
import { SpinnerWrapper } from '@ui/Spinner/SpinnerWrapper'
import { Stats } from '@ui/Stats'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const VaultClaim = ({ isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)

  const formStatus = useStore((state) => state.vaultClaim.formStatus)
  const claimable = useStore((state) => state.vaultClaim.claimable[userActiveKey])
  const fetchStepClaim = useStore((state) => state.vaultClaim.fetchStepClaim)
  const setFormValues = useStore((state) => state.vaultClaim.setFormValues)
  const resetState = useStore((state) => state.vaultClaim.resetState)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}
  const { crv = '0', rewards = [] } = claimable?.claimable ?? {}

  const haveClaimableCrv = +crv > 0
  const haveClaimableRewards = rewards.some((r) => +r.amount > 0)

  const updateFormValues = useCallback(() => {
    setFormValues(userActiveKey, isLoaded ? api : null, market)
  }, [api, isLoaded, market, setFormValues, userActiveKey])

  const reset = useCallback(() => {
    setTxInfoBar(null)
    updateFormValues()
  }, [updateFormValues])

  const handleBtnClickClaim = useCallback(
    async (
      payloadActiveKey: string,
      claimable: MarketClaimable,
      api: Api,
      market: OneWayMarketTemplate,
      type: RewardType,
    ) => {
      const { chainId } = api
      const { crv, rewards } = claimable.claimable ?? {}

      const amount = type === 'crv' ? `${crv} CRV` : _getRewardsAmount(rewards)
      const notifyMessage = t`claim rewards ${amount}`
      const notification = notify(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepClaim(payloadActiveKey, api, market, type)

      if (isSubscribed.current && resp && resp.hash && resp.userActiveKey === userActiveKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={scanTxPath(networks[chainId], resp.hash)}
            onClose={() => reset()}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [fetchStepClaim, reset, userActiveKey],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      market: OneWayMarketTemplate,
      claimable: MarketClaimable,
      formStatus: FormStatus,
    ) => {
      const { signerAddress } = api
      const { isComplete, step } = formStatus
      const { crv, rewards } = claimable.claimable ?? {}
      const isCrv = formStatus.step === 'CLAIM_CRV'
      const haveCrv = +(crv ?? '0') > 0
      const haveRewards = (rewards ?? []).some(({ amount }) => +(amount ?? '0') > 0)
      const isValid = !!signerAddress && ((isCrv && haveCrv) || haveRewards)

      const stepKey = isCrv ? 'CLAIM_CRV' : 'CLAIM_REWARDS'

      const stepsObj: { [key: string]: Step } = {
        CLAIM_CRV: {
          key: 'CLAIM_CRV',
          status: helpers.getStepStatus(isComplete, step === stepKey, isValid),
          type: 'action',
          content: isComplete ? t`Claimed` : t`Claim CRV`,
          onClick: async () => handleBtnClickClaim(payloadActiveKey, claimable, api, market, 'crv'),
        },
        CLAIM_REWARDS: {
          key: 'CLAIM_REWARDS',
          status: helpers.getStepStatus(isComplete, step === stepKey, isValid),
          type: 'action',
          content: isComplete ? t`Claimed` : t`Claim Rewards`,
          onClick: async () => handleBtnClickClaim(payloadActiveKey, claimable, api, market, 'rewards'),
        },
      }

      const stepsKey = isCrv ? ['CLAIM_CRV'] : ['CLAIM_REWARDS']

      return stepsKey.map((k) => stepsObj[k])
    },
    [handleBtnClickClaim],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  useEffect(() => {
    if (isLoaded) updateFormValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && market && (haveClaimableCrv || haveClaimableRewards)) {
      const updatedSteps = getSteps(userActiveKey, api, market, claimable, formStatus)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formStatus, haveClaimableCrv, haveClaimableRewards])

  return (
    <>
      <div>
        {/* input amount */}
        <Box grid gridRowGap={1}>
          {!!signerAddress && typeof claimable === 'undefined' ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            <ClaimableWrapper>
              {haveClaimableCrv || haveClaimableRewards ? (
                <>
                  {haveClaimableCrv && (
                    <Stats isOneLine isBorderBottom={rewards.length > 0} label="CRV">
                      {formatNumber(crv)}
                    </Stats>
                  )}

                  {rewards.map(({ token, symbol, amount }, idx) => (
                    <Stats isOneLine isBorderBottom={idx !== rewards.length - 1} key={token} label={symbol}>
                      {formatNumber(amount)}
                    </Stats>
                  ))}
                </>
              ) : (
                <p>{t`No claimable rewards`}</p>
              )}
            </ClaimableWrapper>
          )}
        </Box>
      </div>

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {formStatus.error ? <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset()} /> : null}
        {txInfoBar}

        {api && market && (
          <Box grid gridGap={2}>
            {haveClaimableCrv && formStatus.step !== 'CLAIM_CRV' ? (
              <Button
                variant="filled"
                size="large"
                disabled={!!formStatus.step}
                onClick={() => handleBtnClickClaim(userActiveKey, claimable, api, market, 'crv')}
              >
                Claim CRV
              </Button>
            ) : steps && formStatus.step === 'CLAIM_CRV' ? (
              <Stepper steps={steps} />
            ) : null}

            {haveClaimableRewards && formStatus.step !== 'CLAIM_REWARDS' ? (
              <Button
                variant="filled"
                size="large"
                disabled={!!formStatus.step}
                onClick={() => handleBtnClickClaim(userActiveKey, claimable, api, market, 'rewards')}
              >
                Claim Rewards
              </Button>
            ) : steps && formStatus.step === 'CLAIM_REWARDS' ? (
              <Stepper steps={steps} />
            ) : null}
          </Box>
        )}
      </LoanFormConnect>
    </>
  )
}

const ClaimableWrapper = styled.div`
  padding: 0.5rem 0.7rem;
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--box--primary--content--shadow-color);
  background-color: var(--box--primary--content--background-color);
`

function _getRewardsAmount(rewards: { token: string; symbol: string; amount: string }[] | undefined) {
  return (rewards || []).map(({ symbol, amount }) => `${amount} ${symbol}`).join(', ')
}
