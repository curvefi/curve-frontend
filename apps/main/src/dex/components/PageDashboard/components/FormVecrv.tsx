import { useParams } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { SummaryInnerContent } from '@/dex/components/PageDashboard/components/Summary'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { Title } from '@/dex/components/PageDashboard/styles'
import type { FormStatus } from '@/dex/components/PageDashboard/types'
import { DEFAULT_FORM_STATUS, getIsLockExpired } from '@/dex/components/PageDashboard/utils'
import { ROUTE } from '@/dex/constants'
import useStore from '@/dex/store/useStore'
import { CurveApi, type NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { toDate } from '@curvefi/prices-api/timestamp'
import AlertBox from '@ui/AlertBox'
import Button from '@ui/Button'
import { Items } from '@ui/Items'
import { InternalLink } from '@ui/Link'
import Stepper from '@ui/Stepper'
import { getStepStatus } from '@ui/Stepper/helpers'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { Chip } from '@ui/Typography'
import { formatDate } from '@ui/utils'
import { formatNumber } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { notify } from '@ui-kit/features/connect-wallet'
import { t, Trans } from '@ui-kit/lib/i18n'

// TODO uncomment locker link code once it is ready
const FormVecrv = () => {
  const {
    activeKey,
    curve,
    formValues: { walletAddress },
  } = useDashboardContext()

  const params = useParams() as NetworkUrlParams
  const isSubscribed = useRef(false)

  const activeKeyVecrv = useStore((state) => state.lockedCrv.activeKeyVecrvInfo)
  const signerVecrvInfo = useStore((state) => state.lockedCrv.vecrvInfo[activeKeyVecrv])
  const dashboardVecrvInfo = useStore((state) => state.dashboard.vecrvInfo[activeKey])
  const formStatus = useStore((state) => state.dashboard.formStatus)
  const setFormStatusVecrv = useStore((state) => state.dashboard.setFormStatusVecrv)
  const fetchStepWithdraw = useStore((state) => state.dashboard.fetchStepWithdrawVecrv)
  const network = useStore((state) => curve && state.networks.networks[curve.chainId])

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const parsedFormStatus = formStatus.formType === 'VECRV' ? formStatus : DEFAULT_FORM_STATUS
  const { veCrv, veCrvPct } = dashboardVecrvInfo ?? {}
  const { lockedAmount = '', unlockTime = 0 } = dashboardVecrvInfo?.lockedAmountAndUnlockTime ?? {}
  const lookupAddressIsSameAsSignerAddress =
    walletAddress && walletAddress.toLowerCase() === curve?.signerAddress.toLowerCase()
  const isLockExpired =
    (lookupAddressIsSameAsSignerAddress && getIsLockExpired(lockedAmount, unlockTime)) ||
    parsedFormStatus.formTypeCompleted
  const lockedAmountDisplay = <strong>{formatNumber(lockedAmount, { defaultValue: '-' })}</strong>
  const lockedLocalUtcDate = unlockTime ? <strong>{formatDate(toDate(unlockTime / 1000), 'long')}</strong> : '-' //

  const handleBtnClickWithdraw = useCallback(
    async (activeKey: string, curve: CurveApi, lockedAmount: string) => {
      const notifyMessage = t`Please confirm withdraw of ${lockedAmount} CRV.`
      const { dismiss } = notify(notifyMessage, 'pending')
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
    [fetchStepWithdraw, setFormStatusVecrv, walletAddress, network],
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
            if (curve) void handleBtnClickWithdraw(activeKey, curve, lockedAmount)
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

  const adjustVecrvUrl = getPath(
    params,
    `${ROUTE.PAGE_LOCKER}${
      +signerVecrvInfo?.lockedAmountAndUnlockTime.lockedAmount > 0
        ? ROUTE.PAGE_LOCKER_ADJUST_CRV
        : ROUTE.PAGE_LOCKER_CREATE
    }`,
  )

  return (
    <>
      <StyledTitle>veCRV</StyledTitle> <AdjustVecrvLink href={adjustVecrvUrl}>{t`Adjust veCrv`}</AdjustVecrvLink>
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
                if (curve) void handleBtnClickWithdraw(activeKey, curve, lockedAmount)
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
