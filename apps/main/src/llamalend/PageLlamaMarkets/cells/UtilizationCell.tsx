import { ReactElement } from 'react'
import { TooltipItem, TooltipItems } from '@/llamalend/components/TooltipItem'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { PercentageCell } from '@/llamalend/PageLlamaMarkets/cells/PercentageCell'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const isUsd = (symbol: string) => symbol === 'USD' || symbol === 'crvUSD' // show crvUSD as USD

const Currency = ({
  balance,
  symbol,
  address,
  chain,
}: {
  symbol: string
  address: string
  balance: number | null
  chain: Chain
}) => (
  <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1} component="span" display="inline-flex">
    <TokenIcon blockchainId={chain} address={address} tooltip={symbol} size="mui-sm" />
    <span>
      {balance ? formatNumber(balance, { ...(isUsd(symbol) && { currency: 'USD' }), notation: 'compact' }) : '-'}
      {!isUsd(symbol) && ` ${symbol}`}
    </span>
  </Stack>
)

const UtilizationTooltipContent = ({
  market: {
    debtCeiling,
    liquidityUsd,
    assets: { collateral, borrowed },
  },
}: {
  market: LlamaMarket
}) => (
  <Stack gap={Spacing.sm}>
    <Typography color="textSecondary">
      {t`LlamaLend offers 2 types of markets: Mint and Lend Markets. `}
      {t`Mint markets have a fixed cap determined by the DAO, while lend markets are capped by the amount of liquidity provided.`}
    </Typography>
    <Stack>
      <TooltipItems secondary>
        <TooltipItem primary title={t`Utilization breakdown`} />
        <TooltipItem title={t`Total supplied`}>
          <Currency {...collateral} />
        </TooltipItem>
        <TooltipItem title={t`Total borrowed`}>
          <Currency {...borrowed} />
        </TooltipItem>
        <TooltipItem title={t`Available to borrow`}>
          <Currency {...borrowed} balance={liquidityUsd} />
        </TooltipItem>
        {debtCeiling != null && (
          <TooltipItem title={t`Borrow cap`}>
            <Currency {...borrowed} balance={debtCeiling} />
          </TooltipItem>
        )}
      </TooltipItems>
    </Stack>
  </Stack>
)

const UtilizationTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip
    clickable
    title={t`Utilization information`}
    body={<UtilizationTooltipContent market={market} />}
    placement="top"
  >
    {children}
  </Tooltip>
)

export const UtilizationCell = (context: CellContext<LlamaMarket, number>) => (
  <UtilizationTooltip market={context.row.original}>
    {/* Tooltip won't open without an extra stack. Don't ask me why 😭 */}
    <Stack>
      <PercentageCell {...context} />
    </Stack>
  </UtilizationTooltip>
)
