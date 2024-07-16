import { t, Trans } from '@lingui/macro'
import { useMemo } from 'react'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import Icon from '@/ui/Icon'
import ChipInactive from '@/components/ChipInactive'

const PoolRewardsCrv = ({
  isHighlight,
  isLoading,
  poolData,
  rewardsApy,
}: {
  isLoading?: boolean
  isHighlight?: boolean
  rewardsApy: RewardsApy | undefined
  poolData: PoolDataCache | PoolData | undefined
}) => {
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gaugeStatus || {}

  const RewardsNudging = () => {
    if (!rewardsNeedNudging) return null
    return (
      <StyledRewardsNudge
        tooltip={
          <Trans>
            This pool has CRV rewards that aren’t streaming yet.
            <br />
            Head to this pool’s “Withdraw/Claim” page and click on the “Nudge CRV rewards” button to resume reward
            streaming for you and everyone else!
          </Trans>
        }
        tooltipProps={{ minWidth: '330px' }}
      >
        <RewardsNudgingIcon name="Hourglass" size={20} />
      </StyledRewardsNudge>
    )
  }

  const CrvRewardsStuckInBridge = () => {
    if (!areCrvRewardsStuckInBridge) return null
    return (
      <IconTooltip minWidth="330px" customIcon={<StuckInBridgeIcon name="Close" size={16} />}>
        <Trans>
          This pool has CRV rewards that aren’t currently being distributed.
          <br />
          This pool has a very small amount of rewards waiting to be distributed to it; but since the amount of rewards
          is very small, the bridge used to send these CRV tokens over is holding onto those tokens until they grow to
          an amount big enough to be bridged. If this pool continues receiving votes, the amount of tokens to be
          distributed will grow every Thursday, and eventually unlock and be distributed then.
        </Trans>
      </IconTooltip>
    )
  }

  const CrvRewardsText = ({ crv }: { crv: RewardsApy['crv'] }) => {
    const [base, boosted] = crv
    if (!base && !boosted) return null
    const formattedBase = formatNumber(base, FORMAT_OPTIONS.PERCENT)

    if (!!boosted) {
      return (
        <>
          {formattedBase} →{' '}
          <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(boosted, FORMAT_OPTIONS.PERCENT)} CRV</span>
        </>
      )
    } else {
      return <>{formattedBase} CRV</>
    }
  }

  const rewardsCrvLabel = useMemo(() => {
    if (isLoading || typeof poolData === 'undefined') {
      return ''
    } else if (rewardsNeedNudging || areCrvRewardsStuckInBridge) {
      return `${formatNumber(0, { style: 'percent', maximumFractionDigits: 0 })} CRV`
    } else if (rewardsApy?.crv && (rewardsApy?.crv[0] !== 0 || rewardsApy?.crv[1] !== 0)) {
      return <CrvRewardsText crv={rewardsApy?.crv ?? []} />
    }
    return ''
  }, [areCrvRewardsStuckInBridge, isLoading, poolData, rewardsApy?.crv, rewardsNeedNudging])

  return poolData?.isGaugeKilled ? (
    <ChipInactive>Inactive gauge</ChipInactive>
  ) : (
    <>
      {rewardsCrvLabel ? (
        <Chip
          isBold={isHighlight}
          size="md"
          tooltip={!!rewardsApy ? t`CRV LP reward annualized (max tAPR can be reached with max boost of 2.50)` : ''}
          tooltipProps={{ placement: 'bottom end' }}
        >
          {rewardsCrvLabel}
        </Chip>
      ) : null}
      {!!rewardsApy && areCrvRewardsStuckInBridge && <CrvRewardsStuckInBridge />}
      {!!rewardsApy && rewardsNeedNudging && <RewardsNudging />}
    </>
  )
}

const StuckInBridgeIcon = styled(Icon)`
  position: relative;
  top: 0.25em;
`

const RewardsNudgingIcon = styled(Icon)`
  position: relative;
  top: 0.2em;
`

const StyledRewardsNudge = styled(Chip)`
  vertical-align: text-bottom;
`

export default PoolRewardsCrv
