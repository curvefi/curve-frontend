'use no memo' // Legacy code excluded from React Compiler.

/* eslint-disable react-hooks/set-state-in-effect -- Legacy code will be deleted. */

import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { useConfig } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { TransferActions } from '@/dex/components/PagePool/components/TransferActions'
import type { TransferProps } from '@/dex/components/PagePool/types'
import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'
import { DEFAULT_FORM_STATUS } from '@/dex/components/PagePool/Withdraw/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useStore } from '@/dex/store/useStore'
import { CurveApi } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { Box } from '@legacy-ui/Box'
import { Button } from '@legacy-ui/Button'
import { Stats } from '@legacy-ui/Stats'
import { getStepStatus } from '@legacy-ui/Stepper/helpers'
import { Stepper } from '@legacy-ui/Stepper/Stepper'
import type { Step } from '@legacy-ui/Stepper/types'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'
import { formatNumber } from '@primitives/number.utils'
import { FormContent } from '@ui/features/forms/components/FormContent'
import { notify } from '@ui/features/toast/Toast/notify'
import { amount as toAmount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

const getTokensText = ({ claimableCrv, claimableRewards }: FormValues, { isClaimCrv, isClaimRewards }: FormStatus) =>
  isClaimCrv
    ? `CRV ${claimableCrv}`
    : isClaimRewards
      ? claimableRewards.map(({ symbol, amount }) => `${symbol} ${amount}`).join(', ')
      : ''

function getClaimText(
  formValues: FormValues,
  formStatus: FormStatus,
  comp: 'notify' | 'inProgress' | 'success' | 'successTxInfo' | 'claimCrvButton',
) {
  const tokensMessage = getTokensText(formValues, formStatus)
  const messages = {
    notify: t`Please confirm claim of ${tokensMessage}`,
    inProgress: t`Claiming`,
    success: t`Claim CRV Complete`,
    successTxInfo: t`Claimed ${tokensMessage}`,
    claimCrvButton: t`Claim CRV`,
  }

  return messages[comp]
}

export const FormClaim = ({ seed }: TransferProps) => {
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
  const formStatus = useStore(state => state.poolWithdraw.formStatus)
  const formValues = useStore(state => state.poolWithdraw.formValues)
  const fetchClaimable = useStore(state => state.poolWithdraw.fetchClaimable)
  const fetchStepClaim = useStore(state => state.poolWithdraw.fetchStepClaim)
  const setStateByKey = useStore(state => state.poolWithdraw.setStateByKey)
  const setFormValues = useStore(state => state.poolWithdraw.setFormValues)
  const resetState = useStore(state => state.poolWithdraw.resetState)

  const [slippageConfirmed, setSlippageConfirmed] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const haveSigner = !!signerAddress
  const haveClaimableCrv = +formValues.claimableCrv > 0
  const haveClaimableRewards = +formValues.claimableRewards.length > 0

  const config = useConfig()

  const updateFormValues = useCallback(() => {
    if (!pool) return
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setTxInfoBar(null)
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setSlippageConfirmed(false)
    void setFormValues('CLAIM', config, curve, pool.id, pool, { isWrapped }, null, seed.data, '')
  }, [config, curve, isWrapped, pool, seed.data, setFormValues])

  const handleClaimClick = useCallback(
    async (activeKey: string, curve: CurveApi, pool: PoolTemplate, formValues: FormValues, formStatus: FormStatus) => {
      const notifyMessage = getClaimText(formValues, formStatus, 'notify')
      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepClaim(activeKey, curve, pool)

      if (isSubscribedRef.current && resp?.hash && resp.activeKey === activeKey && chainId) {
        const claimedLabel = formStatus.isClaimCrv
          ? 'CRV'
          : `${formValues.claimableRewards.map(r => r.symbol).join(', ')} rewards`
        const TxDescription = `Claimed ${claimedLabel}`
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={scanTxPath(chainId, resp.hash)} />)
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepClaim, chainId],
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
      const { isClaimCrv, step } = formStatus
      const isValid =
        !isSeed &&
        !formStatus.error &&
        (+formValues.claimableCrv > 0 || formValues.claimableRewards.some(r => +r.amount > 0))
      const isClaimedCRV = formStatus.formTypeCompleted === 'CLAIM_CRV'
      const isClaimedRewards = formStatus.formTypeCompleted === 'CLAIM_REWARDS'
      const isComplete = isClaimedCRV || isClaimedRewards

      const stepsObj: Record<string, Step> = {
        CLAIM: {
          key: 'CLAIM',
          status: getStepStatus(isComplete, step === 'CLAIM', isValid),
          type: 'action',
          content: isComplete
            ? isClaimedCRV
              ? getClaimText({ ...formValues, claimableCrv: '1' }, formStatus, 'success')
              : t`Claim Rewards Complete`
            : isClaimCrv
              ? getClaimText(formValues, formStatus, 'claimCrvButton')
              : t`Claim Rewards`,
          onClick: () => {
            void handleClaimClick(activeKey, curve, pool, formValues, formStatus)
          },
        },
      }

      return ['CLAIM'].map(key => stepsObj[key])
    },
    [handleClaimClick],
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
      updateFormValues()
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolAddress, signerAddress, seed.data])

  // fetch claimable
  useEffect(() => {
    if (chainId && pool && haveSigner) {
      void fetchClaimable(activeKey, chainId, pool)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, poolAddress, signerAddress])

  // steps
  useEffect(() => {
    if (curve && pool && seed.data != null) {
      const updatedSteps = getSteps(activeKey, curve, pool, formValues, formStatus, seed.data)
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [chainId, pool, slippageConfirmed, signerAddress, formValues, formStatus, seed.data])

  const handleBtnClick = (isClaimCrv: boolean, isClaimRewards: boolean) => {
    setTxInfoBar(null)
    setSlippageConfirmed(false)

    if (curve && pool) {
      const cFormStatus = lodash.cloneDeep(DEFAULT_FORM_STATUS)
      cFormStatus.isApproved = formStatus.isApproved
      cFormStatus.isClaimCrv = isClaimCrv
      cFormStatus.isClaimRewards = isClaimRewards

      setStateByKey('formStatus', cFormStatus)
      void handleClaimClick(activeKey, curve, pool, formValues, cFormStatus)
    }
  }

  return (
    <FormContent>
      <TransferActions loading={!chainId || !steps.length} seed={seed}>
        <ClaimableTokensWrapper>
          {haveClaimableCrv || haveClaimableRewards ? (
            <>
              {haveClaimableCrv && (
                <Stats isOneLine isBorderBottom={formValues.claimableRewards.length > 0} label="CRV">
                  {formatNumber(toAmount(formValues.claimableCrv), { abbreviate: false, fallback: '-' })}
                </Stats>
              )}

              {formValues.claimableRewards.map(({ token, symbol, amount }, idx) => (
                <Stats
                  isOneLine
                  isBorderBottom={idx !== formValues.claimableRewards.length - 1}
                  key={token}
                  label={symbol}
                >
                  {formatNumber(toAmount(amount), { abbreviate: false, fallback: '-' })}
                </Stats>
              ))}
            </>
          ) : (
            <p>{t`No claimable rewards`}</p>
          )}
        </ClaimableTokensWrapper>

        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={updateFormValues} />}
        {txInfoBar}
        {!formStatus.isClaimRewards &&
        !formStatus.isClaimCrv &&
        typeof formStatus.formTypeCompleted === 'string' &&
        formStatus.formTypeCompleted.length === 0 ? (
          <Box grid gridAutoFlow="column" gridColumnGap="3">
            {curve && pool && haveClaimableCrv && (
              <Button
                disabled={!!formStatus.error}
                variant="filled"
                size="large"
                onClick={() => handleBtnClick(true, false)}
              >
                {getClaimText(formValues, formStatus, 'claimCrvButton')}
              </Button>
            )}
            {curve && pool && haveClaimableRewards && (
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
    </FormContent>
  )
}

const ClaimableTokensWrapper = styled.div`
  padding: 0.5rem 0.7rem;
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--box--primary--content--shadow-color);
  background-color: var(--box--primary--content--background-color);
`
