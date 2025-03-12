import ChipVolatileBaseApy from '@/dex/components/PagePoolList/components/ChipVolatileBaseApy'
import TooltipBaseApy from '@/dex/components/PagePoolList/components/TooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import { RewardBase, PoolData, PoolDataCache } from '@/dex/types/main.types'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Props = {
  base: RewardBase | undefined
  isHighlight: boolean
  poolData: (PoolData | PoolDataCache) | undefined
}

const TableCellRewardsBase = ({ base, isHighlight, poolData }: Props) => {
  const failedFetching24hOldVprice =
    poolData && 'failedFetching24hOldVprice' in poolData && poolData.failedFetching24hOldVprice

  return (
    <>
      {failedFetching24hOldVprice ? (
        <span>
          -<IconTooltip>Not available currently</IconTooltip>
        </span>
      ) : (
        typeof base !== 'undefined' && (
          <>
            {+base.day > LARGE_APY ? (
              <ChipVolatileBaseApy isBold={isHighlight} />
            ) : (
              <Chip
                isBold={isHighlight}
                size="md"
                tooltip={!!base ? <TooltipBaseApy poolData={poolData} baseApy={base} /> : null}
                tooltipProps={{
                  placement: 'bottom end',
                  textAlign: 'left',
                  ...(base && Number(base.day) < 0 ? { minWidth: '200px' } : {}),
                }}
              >
                {formatNumber(base.day, FORMAT_OPTIONS.PERCENT)}
              </Chip>
            )}
          </>
        )
      )}
    </>
  )
}

export default TableCellRewardsBase
