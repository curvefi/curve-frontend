import { LendingVault } from '@/entities/vaults'
import Box from '@mui/material/Box'
import TokenIcons from 'main/src/components/TokenIcons'
import React, { useMemo } from 'react'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PoolTitleCell = ({ getValue, row }: CellContext<LendingVault, LendingVault['assets']>) => {
  const coins = useMemo(() => Object.values(getValue()), [getValue])
  const { blockchainId } = row.original
  const urlPath = `curve-assets/images/assets${blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`
  return (
    <Box display="flex">
      <TokenIcons
        imageBaseUrl={`https://cdn.jsdelivr.net/gh/curvefi/${urlPath}`}
        tokens={coins.map((c) => c.symbol)}
        tokenAddresses={coins.map((c) => c.address)}
      />
      <Typography variant="tableCellL" sx={{ paddingInlineStart: Spacing.sm }}>
        {coins.map((coin) => coin.symbol).join(' - ')}
      </Typography>
    </Box>
  )
}
