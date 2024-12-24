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
      <Box sx={(t) => ({ border: `1px solid ${t.design.Color.Primary[600]}`, height: 16 })}>
        <Box sx={(t) => ({ backgroundColor: `${t.design.Color.Primary[500]}`, width: `${value}%`, height: '100%' })} />
      </Box>
    </>
  )
}
