import { ReactElement } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { MarketType } from '@evm-ui/types/market'
import { CRVUSD, formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { LinearProgress } from '@ui/components/LinearProgress'
import { TokenIcon } from '@ui/components/TokenIcon'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipItem, TooltipItems } from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t, Trans } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

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
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    {formatNumber(balance, 'token.compact')}
    <TokenIcon blockchainId={chain} address={address} tooltip={symbol} size="mui-sm" />
  </Stack>
)

const Primary = ({ children }: { children: string }) => (
  <Typography color="primary" component="span" sx={{ display: 'inline' }}>
    {children}
  </Typography>
)

const UtilizationTooltipContent = ({
  market: {
    debtCeiling,
    liquidityUsd,
    assets: { collateral, borrowed },
    type,
  },
}: {
  market: LlamaMarket
}) => (
  <Stack sx={{ gap: Spacing.sm }}>
    <Typography color="textSecondary">
      <Trans>
        LlamaLend offers 2 types of markets: <Primary>Mint</Primary> and <Primary>Lend</Primary> Markets. Mint markets
        have a fixed cap determined by the DAO, while lend markets are capped by the amount of liquidity provided.
      </Trans>
    </Typography>
    <Stack>
      <TooltipItems secondary>
        <TooltipItem variant="primary" title={t`Utilization breakdown`} />
        {type === MarketType.Lend && (
          <TooltipItem title={t`Total supplied`}>
            {/* The supplied token is the same as the token people borrow, even though we use the collateral balance in this case */}
            <Currency {...borrowed} balance={collateral.balance} />
          </TooltipItem>
        )}
        <TooltipItem title={t`Total borrowed`}>
          <Currency {...borrowed} />
        </TooltipItem>
        {/** liquidityUsd is as the name says, in usd, but we want it denominated in the borrow token, and we have enough info to deduce the borrow token price directly (if both are > 0) */}
        {borrowed.balance && borrowed.balanceUsd && (
          <TooltipItem title={t`Available to borrow`}>
            <Currency {...borrowed} balance={liquidityUsd * (borrowed.balance / borrowed.balanceUsd)} />
          </TooltipItem>
        )}
        {debtCeiling != null && (
          <TooltipItem title={t`Debt ceiling`}>
            {/** Only mint markets have a debt ceiling which is in crvUSD */}
            <Currency {...CRVUSD} balance={debtCeiling} />
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

export const UtilizationCell = ({ row, getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number>) => (
  <UtilizationTooltip market={row.original}>
    <Stack sx={{ gap: Spacing.xs }}>
      {formatNumber(getValue(), 'percent.rate')}
      <LinearProgress percent={getValue()} size="medium" />
    </Stack>
  </UtilizationTooltip>
)
