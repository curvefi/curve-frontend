import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'

const formatMaxLeverage = (value: number | null) => (value == null ? '-' : `${value.toPrecision(2)}x`)

export const MaxLeverageCell = ({ getValue }: CellContext<LlamaMarket, number | null>) => (
  <Typography variant="tableCellMBold">{formatMaxLeverage(getValue())}</Typography>
)
