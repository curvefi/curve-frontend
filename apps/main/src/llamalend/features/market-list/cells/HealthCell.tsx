import { HealthBar } from '@/llamalend/features/market-position-details'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { Stack } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { CellContext } from '@tanstack/react-table'
import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { TooltipDescription } from '@evm-ui/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { formatNumber } from '@evm-ui/utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const HealthCell = ({ getValue, row }: CellContext<LlamaMarketRow, number | undefined>) => {
  const { assets } = row.original
  const { data: { status } = {}, error } = row.original.positionQueries.stats
  const health = getValue()
  const content = status ? getPositionStatusContent(assets.collateral.symbol, assets.borrowed.symbol)[status] : null

  if (error) return <ErrorCell error={error} />

  return maybe(health, health => (
    <Tooltip
      title={content?.title ?? t`Position active`}
      body={<TooltipDescription text={content?.description ?? t`You have an active position in this market.`} />}
      placement="top"
    >
      <Stack sx={{ gap: Spacing.xs }}>
        {formatNumber(health, 'percent.value')}
        <HealthBar small health={health} softLiquidation={status === 'softLiquidation'} />
      </Stack>
    </Tooltip>
  ))
}
