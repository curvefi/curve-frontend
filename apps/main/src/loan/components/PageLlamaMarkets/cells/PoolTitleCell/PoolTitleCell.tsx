import { LendingVault } from '@/loan/entities/vaults'
import Stack from '@mui/material/Stack'
import TokenIcons from '@/loan/components/TokenIcons'
import React, { useMemo } from 'react'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import { PoolBadges } from '@/loan/components/PageLlamaMarkets/cells/PoolTitleCell/PoolBadges'
import { PoolWarnings } from '@/loan/components/PageLlamaMarkets/cells/PoolTitleCell/PoolWarnings'
import { getImageBaseUrl } from '@ui/utils'
import { cleanColumnId } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'

const { Spacing } = SizesAndSpaces

export const PoolTitleCell = ({ getValue, row, table }: CellContext<LendingVault, LendingVault['assets']>) => {
  const showCollateral = table.getColumn(cleanColumnId('assets.collateral.symbol'))!.getIsVisible()
  const coins = useMemo(() => {
    const { borrowed, collateral } = getValue()
    return showCollateral ? [collateral, borrowed] : [borrowed]
  }, [getValue, showCollateral])
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
