import { LendingVault } from '@/entities/vaults'
import Stack from '@mui/material/Stack'
import TokenIcons from 'main/src/components/TokenIcons'
import React, { useMemo } from 'react'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import { PoolBadges } from '@/components/PageLlamaMarkets/cells/PoolTitleCell/PoolBadges'
import { PoolWarnings } from '@/components/PageLlamaMarkets/cells/PoolTitleCell/PoolWarnings'
import { getImageBaseUrl } from '@/ui/utils'

const { Spacing } = SizesAndSpaces

export const PoolTitleCell = ({ getValue, row }: CellContext<LendingVault, LendingVault['assets']>) => {
  const coins = useMemo(() => Object.values(getValue()), [getValue])
  const { blockchainId } = row.original
  const imageBaseUrl = getImageBaseUrl(blockchainId)
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center">
      <TokenIcons
        imageBaseUrl={imageBaseUrl}
        tokens={coins.map((c) => c.symbol)}
        tokenAddresses={coins.map((c) => c.address)}
      />
      <Stack direction="column" gap={Spacing.xs}>
        <PoolBadges blockchainId={blockchainId} />
        <Typography variant="tableCellL">{coins.map((coin) => coin.symbol).join(' - ')}</Typography>
        <PoolWarnings />
      </Stack>
    </Stack>
  )
}
