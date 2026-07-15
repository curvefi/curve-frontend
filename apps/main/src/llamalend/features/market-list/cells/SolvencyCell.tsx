import { SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { maybe, objectKeys } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'

const SOLVENCY_COLORS: Record<keyof typeof SOLVENCY_THRESHOLDS, TypographyProps['color']> = {
  solvent: 'textPrimary',
  low: 'warning',
  insolvent: 'error',
}

const getSolvencyColor = (value: number | undefined | null): TypographyProps['color'] =>
  SOLVENCY_COLORS[
    maybe(value, v => objectKeys(SOLVENCY_THRESHOLDS).find(t => v >= SOLVENCY_THRESHOLDS[t])) ?? 'solvent'
  ]

export const SolvencyCell = ({ getValue, row }: CellContext<LlamaMarket, number | null | undefined>) => {
  const value = getValue()
  return (
    <Tooltip title={t`Solvency`} body={<SolvencyTooltip type={row.original.type} />}>
      <Typography variant="tableCellMBold" color={getSolvencyColor(value)}>
        {formatNumber(value, 'percent.value')}
      </Typography>
    </Tooltip>
  )
}
