import { LendingVault } from '@/entities/vaults'
import { CellContext } from '@tanstack/react-table'
import Box from '@mui/material/Box'

export const UtilizationCell = ({ getValue }: CellContext<LendingVault, LendingVault['utilizationPercent']>) => {
  const value = getValue()
  if (value == null) {
    return '-'
  }
  return (
    <>
      {value.toFixed(2) + '%'}
      <Box
        sx={(t) => ({
          height: 16,
          border: `1px solid ${t.design.Color.Primary[600]}`,
          background: `linear-gradient(to right, ${t.design.Color.Primary[500]} ${value}%, transparent ${value / 2}%)`,
        })}
      />
    </>
  )
}
