import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatUsd } from '@ui-kit/utils'
import type { PoolListItem } from '../types'

export const UsdCell = ({ getValue }: CellContext<PoolListItem, number | undefined>) => {
  const value = getValue()
  return (
    <Tooltip title={value && formatUsd(value, { abbreviate: false })}>
      <Stack>{value == null ? '-' : formatUsd(value)}</Stack>
    </Tooltip>
  )
}
