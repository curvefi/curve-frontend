import { SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { maybe, objectKeys } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { formatNumber } from '@evm-ui/utils'

const SOLVENCY_COLORS: Record<keyof typeof SOLVENCY_THRESHOLDS, TypographyProps['color']> = {
  solvent: 'textPrimary',
  low: 'warning',
  insolvent: 'error',
}

const getSolvencyColor = (value: number | undefined | null): TypographyProps['color'] =>
  SOLVENCY_COLORS[
    maybe(value, v => objectKeys(SOLVENCY_THRESHOLDS).find(t => v >= SOLVENCY_THRESHOLDS[t])) ?? 'solvent'
  ]

export const SolvencyCell = ({ getValue, row }: CellContext<LlamaMarketRow, number | null | undefined>) => {
  const value = getValue()
  return (
    <Tooltip title={t`Solvency`} body={<SolvencyTooltip type={row.original.type} />}>
      <Typography variant="tableCellMBold" color={getSolvencyColor(value)}>
        {formatNumber(value, 'percent.value')}
      </Typography>
    </Tooltip>
  )
}
