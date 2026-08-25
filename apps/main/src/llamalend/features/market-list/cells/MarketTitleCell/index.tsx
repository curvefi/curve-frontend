import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { CopyIconButton } from '@evm-ui/shared/ui/CopyIconButton'
import { CLICKABLE_IN_ROW_CLASS, DESKTOP_ONLY_HOVER_CLASS } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TableRowTitle } from '@evm-ui/shared/ui/DataTable/TableRowTitle'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import { CellContext } from '@tanstack/react-table'
import { MarketBadges } from './MarketBadges'
import { UserMarketPositionIndicator } from './UserMarketPositionIndicator'

const { Spacing, Height } = SizesAndSpaces

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarketRow, string>) => {
  const isMobile = useIsMobile()
  const { collateral, borrowed } = market.assets
  return (
    <Stack direction="row" sx={{ height: Height.row }}>
      {market.userHasPositions && <UserMarketPositionIndicator market={market} />}
      <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center' }}>
        <TokenIcons blockchainId={market.chain} tokens={[collateral, borrowed]} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <TableRowTitle
              id={market.controllerAddress}
              title={[collateral.symbol, borrowed.symbol].join(' • ')}
              url={market.url}
            />
            <CopyIconButton
              className={`${DESKTOP_ONLY_HOVER_CLASS} ${CLICKABLE_IN_ROW_CLASS}`}
              label={t`Copy market address`}
              copyText={market.controllerAddress}
              confirmationText={t`Market address copied`}
              data-testid={`copy-market-address-${market.controllerAddress}`}
            />
          </Stack>
          <MarketBadges market={market} isMobile={isMobile} />
        </Stack>
      </Stack>
    </Stack>
  )
}
