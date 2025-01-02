import { LendingVault } from '@/entities/vaults'
import Stack from '@mui/material/Stack'
import TokenIcons from 'main/src/components/TokenIcons'
import React, { useMemo } from 'react'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PoolTitleCell = ({ getValue, row }: CellContext<LendingVault, LendingVault['assets']>) => {
  const coins = useMemo(() => Object.values(getValue()), [getValue])
  const { blockchainId } = row.original
  const urlPath = `curve-assets/images/assets${blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`
  return (
    <Stack direction="row" gap={Spacing.sm}>
      <TokenIcons
        imageBaseUrl={`https://cdn.jsdelivr.net/gh/curvefi/${urlPath}`}
        tokens={coins.map((c) => c.symbol)}
        tokenAddresses={coins.map((c) => c.address)}
      />
      {coins.map((coin) => coin.symbol).join(' - ')}
    </Stack>
  )
}
