import { memo } from 'react'
import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { ChipInactive } from '@/dex/components/ChipInactive'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'

type CrvRewards = Pick<PoolListItem, 'crvApr' | 'crvAprBoosted'>
type PoolListRewardsProps = {
  campaigns: CampaignRewards[]
  isMobile?: boolean
  pool: PoolListItem
}

const MIN_VISIBLE_CRV_APR = 0.01
const MAX_CRV_BOOST = '2.50'
const CRV_SYMBOL = 'CRV'

const getCrvRewardsLabel = ({ crvApr, crvAprBoosted }: CrvRewards) => {
  const baseCrvApr = crvApr ?? 0
  const boostedCrvApr = crvAprBoosted ?? 0

  if (!baseCrvApr && !boostedCrvApr) return
  if (baseCrvApr < MIN_VISIBLE_CRV_APR) return `< ${formatNumber(MIN_VISIBLE_CRV_APR, 'percent.value')} ${CRV_SYMBOL}`
  if (!boostedCrvApr) return `${formatNumber(baseCrvApr, 'percent.value')} ${CRV_SYMBOL}`

  return (
    <>
      {formatNumber(baseCrvApr, 'percent.value')}
      {' → '}
      <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(boostedCrvApr, 'percent.value')}</span>
      {` ${CRV_SYMBOL}`}
    </>
  )
}

const EmptyRewards = () => (
  <Typography component="span" variant="tableCellMBold" sx={{ display: 'block', textAlign: 'end' }}>
    -
  </Typography>
)

// Rewards can be expensive to render once campaigns are present. Keep unchanged rows out of sort/filter-only renders.
export const PoolListRewards = memo(function PoolListRewards({ campaigns, pool, isMobile }: PoolListRewardsProps) {
  const crvRewardsLabel = getCrvRewardsLabel(pool)
  const extraRewards = pool.extraRewardsApr.filter(({ apr }) => apr > 0)
  const hasCampaignRewards = campaigns.length > 0

  if (pool.gauge?.isKilled) return <ChipInactive>{t`Inactive gauge`}</ChipInactive>
  if (!crvRewardsLabel && extraRewards.length === 0 && !hasCampaignRewards) return <EmptyRewards />

  return (
    <Stack sx={{ alignItems: 'end' }}>
      {crvRewardsLabel && (
        <Tooltip
          title={t`CRV LP reward annualized (max tAPR can be reached with max boost of ${MAX_CRV_BOOST})`}
          placement="bottom-end"
        >
          <Typography component="span" variant="tableCellMBold">
            {crvRewardsLabel}
          </Typography>
        </Tooltip>
      )}
      {extraRewards.map(({ apr, symbol }, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Extra rewards are display-only API rows without a required stable id.
        <Typography key={index} component="span" variant="tableCellMBold">
          {formatNumber(apr, 'percent.value')} {symbol ?? ''}
        </Typography>
      ))}
      {hasCampaignRewards && <CampaignRewardsRow rewardItems={campaigns} mobile={isMobile} />}
    </Stack>
  )
})
