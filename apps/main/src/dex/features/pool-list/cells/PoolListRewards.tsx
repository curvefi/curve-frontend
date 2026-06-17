import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { ChipInactive } from '@/dex/components/ChipInactive'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'
import { normalizeAddress } from '../poolList.utils'

type CrvRewards = Pick<PoolListItem, 'crvApr' | 'crvAprBoosted'>

const MIN_VISIBLE_CRV_APR = 0.01
const MAX_CRV_BOOST = '2.50'
const REWARD_BADGE_SIZE = 'small'
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

export const PoolListRewards = ({ pool, mobile }: { pool: PoolListItem; mobile?: boolean }) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: pool.network as Chain,
    address: normalizeAddress(pool.address) as typeof pool.address,
  })
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
          <Badge size={REWARD_BADGE_SIZE} label={crvRewardsLabel} />
        </Tooltip>
      )}
      {extraRewards.map(({ apr, symbol }, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Extra rewards are display-only API rows without a required stable id.
        <Badge key={index} size={REWARD_BADGE_SIZE} label={`${formatNumber(apr, 'percent.value')} ${symbol ?? ''}`} />
      ))}
      {hasCampaignRewards && <CampaignRewardsRow rewardItems={campaigns} mobile={mobile} />}
    </Stack>
  )
}
