import type { ReactNode } from 'react'
import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { ChipInactive } from '@/dex/components/ChipInactive'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { Chip } from '@ui/Typography'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'
import { normalizeAddress } from '../poolList.utils'
import { Placeholder } from './Placeholder'

type CrvRewards = Pick<PoolListItem, 'crvApr' | 'crvAprBoosted'>
type ExtraRewards = Pick<PoolListItem, 'address' | 'extraRewardsApr'>

const getCrvRewardsLabel = ({ crvApr, crvAprBoosted }: CrvRewards): ReactNode => {
  const baseApr = crvApr ?? 0
  const boostedApr = crvAprBoosted ?? 0

  if (!baseApr && !boostedApr) return null
  if (baseApr < 0.01) return '< 0.01% CRV'

  return (
    <>
      {formatNumber(baseApr, 'percent.value')}
      {boostedApr ? ' \u2192 ' : null}
      {boostedApr ? <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(boostedApr, 'percent.value')}</span> : null}
      {' CRV'}
    </>
  )
}

const getExtraRewards = ({ address: poolAddress, extraRewardsApr }: ExtraRewards) =>
  extraRewardsApr
    .filter(({ apr }) => apr > 0)
    .map(({ apr, address, symbol }, index) => ({
      apr,
      id: address ?? `${poolAddress}-${index}`,
      symbol: symbol ?? '',
    }))

export const PoolListRewards = ({ pool, mobile }: { pool: PoolListItem; mobile?: boolean }) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: pool.network as Chain,
    address: normalizeAddress(pool.address) as typeof pool.address,
  })
  const crvRewardsLabel = getCrvRewardsLabel(pool)
  const extraRewards = getExtraRewards(pool)
  const hasRewards = crvRewardsLabel || extraRewards.length > 0 || campaigns.length > 0

  return pool.gauge?.isKilled ? (
    <ChipInactive>Inactive gauge</ChipInactive>
  ) : hasRewards ? (
    <Stack sx={{ alignItems: 'end' }}>
      {crvRewardsLabel && (
        <Chip
          size="md"
          tooltip={t`CRV LP reward annualized (max tAPR can be reached with max boost of 2.50)`}
          tooltipProps={{ placement: 'bottom-end' }}
        >
          {crvRewardsLabel}
        </Chip>
      )}
      {extraRewards.map(({ apr, id, symbol }) => (
        <Chip key={id} size="md">
          {formatNumber(apr, 'percent.value')} {symbol}
        </Chip>
      ))}
      {campaigns.length > 0 && <CampaignRewardsRow rewardItems={campaigns} mobile={mobile} />}
    </Stack>
  ) : (
    <Placeholder />
  )
}
