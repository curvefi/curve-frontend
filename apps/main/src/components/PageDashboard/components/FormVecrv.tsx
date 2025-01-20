import type { Step } from '@ui/Stepper/types'
import type { FormStatus } from '@main/components/PageDashboard/types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t, Trans } from '@lingui/macro'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ROUTE } from '@main/constants'
import { breakpoints } from '@ui/utils/responsive'
import { DEFAULT_FORM_STATUS, getIsLockExpired } from '@main/components/PageDashboard/utils'
import { getPath } from '@main/utils/utilsRouter'
import { getStepStatus } from '@ui/Stepper/helpers'
import { formatNumber } from '@ui/utils'
import dayjs from '@ui-kit/lib/dayjs'
import { useDashboardContext } from '@main/components/PageDashboard/dashboardContext'
import useStore from '@main/store/useStore'
import { Chip } from '@ui/Typography'
import { InternalLink } from '@ui/Link'
import { Items } from '@ui/Items'
import { SummaryInnerContent } from '@main/components/PageDashboard/components/Summary'
import { Title } from '@main/components/PageDashboard/styles'
import AlertBox from '@ui/AlertBox'
import Button from '@ui/Button'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { CurveApi } from '@main/types/main.types'

// TODO uncomment locker link code once it is ready
const FormVecrv = () => {
  const {
    activeKey,
    curve,
    formValues: { walletAddress },
  } = useDashboardContext()

  const params = useParams()
  const isSubscribed = useRef(false)

  const activeKeyVecrv = useStore((state) => state.lockedCrv.activeKeyVecrvInfo)
  const signerVecrvInfo = useStore((state) => state.lockedCrv.vecrvInfo[activeKeyVecrv])
  const dashboardVecrvInfo = useStore((state) => state.dashboard.vecrvInfo[activeKey])
  const formStatus = useStore((state) => state.dashboard.formStatus)
  const setFormStatusVecrv = useStore((state) => state.dashboard.setFormStatusVecrv)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const fetchStepWithdraw = useStore((state) => state.dashboard.fetchStepWithdrawVecrv)
  const network = useStore((state) => curve && state.networks.networks[curve.chainId])

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const parsedFormStatus = formStatus.formType === 'VECRV' ? formStatus : DEFAULT_FORM_STATUS
  const { veCrv, veCrvPct } = dashboardVecrvInfo ?? {}
  const { lockedAmount = '', unlockTime = 0 } = dashboardVecrvInfo?.lockedAmountAndUnlockTime ?? {}
  const lookupAddressIsSameAsSignerAddress =
    walletAddress && walletAddress.toLowerCase() === curve?.signerAddress.toLowerCase()
  const isLockExpired =
    (lookupAddressIsSameAsSignerAddress && getIsLockExpired(lockedAmount, unlockTime)) ||
    parsedFormStatus.formTypeCompleted
  const lockedAmountDisplay = <strong>{formatNumber(lockedAmount, { defaultValue: '-' })}</strong>
  const lockedLocalUtcDate = unlockTime ? <strong>{dayjs.utc(unlockTime).format('l')}</strong> : '-'

  const handleBtnClickWithdraw = useCallback(
    async (activeKey: string, curve: CurveApi, lockedAmount: string) => {
      const notifyMessage = t`Please confirm withdraw of ${lockedAmount} CRV.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepWithdraw(activeKey, curve, walletAddress)

      if (isSubscribed.current && resp && resp.hash && resp.walletAddress === walletAddress && network) {
        const txDescription = t`Withdraw Complete`
        setTxInfoBar(
          <TxInfoBar
            description={txDescription}
            txHash={network.scanTxPath(resp.hash)}
            onClose={() => {
              setTxInfoBar(null)
              setFormStatusVecrv(DEFAULT_FORM_STATUS)
            }}
          />,
        )
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [fetchStepWithdraw, notifyNotification, setFormStatusVecrv, walletAddress, network],
  )

  const getSteps = useCallback(
    (activeKey: string, curve: CurveApi, lockedAmount: string, formStatus: FormStatus) => {
      const stepsObj: { [key: string]: Step } = {
        WITHDRAW: {
          key: 'WITHDRAW',
          status: getStepStatus(
            formStatus.formTypeCompleted === 'WITHDRAW',
            formStatus.step === 'WITHDRAW',
            !formStatus.error && +lockedAmount > 0,
          ),
          type: 'action',
          content: !!formStatus.formTypeCompleted ? t`Withdraw CRV Complete` : t`Withdraw CRV`,
          onClick: () => {
            if (curve) handleBtnClickWithdraw(activeKey, curve, lockedAmount)
          },
        },
      }
      return ['WITHDRAW'].map((key) => stepsObj[key])
    },
    [handleBtnClickWithdraw],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  // steps
  useEffect(() => {
    if (curve) {
      const updatedSteps = getSteps(activeKey, curve, lockedAmount, parsedFormStatus)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress, lockedAmount, parsedFormStatus])

  const adjustVecrvUrl = `${ROUTE.PAGE_LOCKER}${
    +signerVecrvInfo?.lockedAmountAndUnlockTime.lockedAmount > 0
      ? ROUTE.PAGE_LOCKER_ADJUST_CRV
      : ROUTE.PAGE_LOCKER_CREATE
  }`

  return (
    <>
      <StyledTitle>veCRV</StyledTitle>{' '}
      {params && <AdjustVecrvLink href={getPath(params, adjustVecrvUrl)}>{t`Adjust veCrv`}</AdjustVecrvLink>}
      {isLockExpired ? (
        <Wrapper>
          <div>
            <Trans>
              Your lock has expired, claim your <strong>{lockedAmountDisplay}</strong> CRV
            </Trans>
          </div>
          {parsedFormStatus.error && (
            <AlertBox alertType="error" handleBtnClose={() => setFormStatusVecrv(DEFAULT_FORM_STATUS)}>
              {parsedFormStatus.error}
            </AlertBox>
          )}
          {txInfoBar}
          {steps?.[0]?.status !== 'current' ? (
            <Stepper steps={steps} />
          ) : (
            <Button
              loading={typeof dashboardVecrvInfo === 'undefined'}
              disabled={!curve}
              variant="filled"
              onClick={() => {
                if (curve) handleBtnClickWithdraw(activeKey, curve, lockedAmount)
              }}
              size="medium"
            >
              {t`Withdraw CRV`}
            </Button>
          )}
        </Wrapper>
      ) : (
        <SummaryInnerContent grid gridRowGap={3}>
          <Items listItemMargin="0 0 0.2rem 0">
            <li>
              {t`Balance in voting escrow:`} <strong>{formatNumber(veCrv, { defaultValue: '-' })}</strong> veCRV <br />
              <Chip size="sm">
                <strong>
                  {formatNumber(veCrvPct, {
                    style: 'percent',
                    trailingZeroDisplay: 'stripIfInteger',
                    defaultValue: '-',
                  })}
                </strong>{' '}
                {t`share of total`}
              </Chip>
            </li>
          </Items>

          <Items listItemMargin="0 0 0.2rem 0">
            <li>
              {t`CRV locked:`} {lockedAmountDisplay}
            </li>
            <li>
              {t`Locked until:`} {lockedLocalUtcDate}
            </li>
          </Items>
        </SummaryInnerContent>
      )}
    </>
  )
}

const AdjustVecrvLink = styled(InternalLink)`
  color: inherit;
  font-weight: bold;
  text-transform: initial;
`

const StyledTitle = styled(Title)`
  display: inline-block;
`

const Wrapper = styled.div`
  display: grid;
  grid-row-gap: 0.5rem;
  padding-bottom: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    max-width: 18.75rem;
  }
`

export default FormVecrv
