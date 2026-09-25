import { LARGE_RATE } from '@/dex/constants'
import { RewardBase } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { Chip } from '@legacy-ui/Typography'
import { formatNumber } from '@primitives/number.utils'
import { amount } from '@ui/lib/decimal'
import { ChipVolatileBaseApy } from './ChipVolatileBaseApy'
import { LegacyTooltipBaseApy } from './LegacyTooltipBaseApy'

type Props = { base: RewardBase | undefined; isHighlight: boolean; pool: PoolTemplate | undefined }

export const TableCellRewardsBase = ({ base, isHighlight, pool }: Props) =>
  typeof base !== 'undefined' &&
  (+base.day > LARGE_RATE ? (
    <ChipVolatileBaseApy isBold={isHighlight} />
  ) : (
    <Chip
      isBold={isHighlight}
      size="md"
      tooltip={base ? <LegacyTooltipBaseApy pool={pool} baseApy={base} /> : null}
      tooltipProps={{
        placement: 'bottom-end',
        textAlign: 'left',
        ...(base && Number(base.day) < 0 ? { minWidth: '200px' } : {}),
      }}
    >
      {formatNumber(amount(base.day), 'percent.value')}
    </Chip>
  ))
