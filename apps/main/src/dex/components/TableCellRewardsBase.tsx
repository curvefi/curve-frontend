import { LARGE_RATE } from '@/dex/constants'
import { RewardBase, PoolData } from '@/dex/types/main.types'
import { Chip } from '@legacy-ui/Typography'
import { formatNumber } from '@primitives/number.utils'
import { amount } from '@ui/lib/decimal'
import { ChipVolatileBaseApy } from './ChipVolatileBaseApy'
import { LegacyTooltipBaseApy } from './LegacyTooltipBaseApy'

type Props = { base: RewardBase | undefined; isHighlight: boolean; poolData: PoolData | undefined }

export const TableCellRewardsBase = ({ base, isHighlight, poolData }: Props) =>
  typeof base !== 'undefined' &&
  (+base.day > LARGE_RATE ? (
    <ChipVolatileBaseApy isBold={isHighlight} />
  ) : (
    <Chip
      isBold={isHighlight}
      size="md"
      tooltip={base ? <LegacyTooltipBaseApy poolData={poolData} baseApy={base} /> : null}
      tooltipProps={{
        placement: 'bottom-end',
        textAlign: 'left',
        ...(base && Number(base.day) < 0 ? { minWidth: '200px' } : {}),
      }}
    >
      {formatNumber(amount(base.day), 'percent.value')}
    </Chip>
  ))
