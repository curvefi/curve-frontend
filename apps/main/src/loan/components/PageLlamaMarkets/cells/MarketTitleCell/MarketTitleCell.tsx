import { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import TokenIcons from '@/loan/components/TokenIcons'
import React, { useMemo } from 'react'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import { MarketBadges } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketBadges'
import { MarketWarnings } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketWarnings'
import { getImageBaseUrl } from '@ui/utils'
import { cleanColumnId } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'

const { Spacing } = SizesAndSpaces

export const MarketTitleCell = ({ getValue, row, table }: CellContext<LlamaMarket, LlamaMarket['assets']>) => {
  const showCollateral = table.getColumn(cleanColumnId('assets.collateral.symbol'))!.getIsVisible()
  const coins = useMemo(() => {
    const { borrowed, collateral } = getValue()
    return showCollateral ? [collateral, borrowed] : [borrowed]
  }, [getValue, showCollateral])
  const { blockchainId, type } = row.original
  const imageBaseUrl = getImageBaseUrl(blockchainId)
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center">
      <TokenIcons
        imageBaseUrl={imageBaseUrl}
        tokens={coins.map((c) => c.symbol)}
        tokenAddresses={coins.map((c) => c.address)}
      />
      <Stack direction="column" gap={Spacing.xs}>
        <MarketBadges blockchainId={blockchainId} type={type} />
        <Typography variant="tableCellL">{coins.map((coin) => coin.symbol).join(' - ')}</Typography>
        <MarketWarnings />
      </Stack>
    </Stack>
  )
}
