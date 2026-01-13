import { useMemo } from 'react'
import { styled } from 'styled-components'
import { StyledInactiveChip as ChipInactive } from '@/dex/components/ChipInactive'
import { RewardsApy, PoolData, PoolDataCache } from '@/dex/types/main.types'
import { Icon } from '@ui/Icon'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t, Trans } from '@ui-kit/lib/i18n'

export const PoolRewardsCrv = ({
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
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gauge.status || {}

  const rewardsCrvLabel = useMemo(() => {
    if (isLoading || typeof poolData === 'undefined') {
      return ''
    } else if (rewardsNeedNudging || areCrvRewardsStuckInBridge) {
      return `${formatNumber(0, { style: 'percent', maximumFractionDigits: 0 })} CRV`
    } else if (rewardsApy?.crv && (rewardsApy?.crv[0] !== 0 || rewardsApy?.crv[1] !== 0)) {
      const [base, boosted] = rewardsApy.crv
      if (!base && !boosted) return null
      const formattedBase = formatNumber(base, FORMAT_OPTIONS.PERCENT)

      if (boosted) {
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
    return ''
  }, [areCrvRewardsStuckInBridge, isLoading, poolData, rewardsApy?.crv, rewardsNeedNudging])

  return poolData?.gauge.isKilled ? (
    <ChipInactive>Inactive gauge</ChipInactive>
  ) : (
    <>
      {rewardsCrvLabel ? (
        <Chip
          isBold={isHighlight}
          size="md"
          {...(rewardsApy && {
            tooltip: t`CRV LP reward annualized (max tAPR can be reached with max boost of 2.50)`,
            tooltipProps: { placement: 'bottom-end' },
          })}
        >
          {rewardsCrvLabel}
        </Chip>
      ) : null}
      {rewardsApy && areCrvRewardsStuckInBridge && (
        <IconTooltip minWidth="330px" customIcon={<StuckInBridgeIcon name="Close" size={16} />}>
          <Trans>
            This pool has CRV rewards that aren’t currently being distributed.
            <br />
            This pool has a very small amount of rewards waiting to be distributed to it; but since the amount of
            rewards is very small, the bridge used to send these CRV tokens over is holding onto those tokens until they
            grow to an amount big enough to be bridged. If this pool continues receiving votes, the amount of tokens to
            be distributed will grow every Thursday, and eventually unlock and be distributed then.
          </Trans>
        </IconTooltip>
      )}
      {rewardsApy && rewardsNeedNudging && (
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
      )}
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
