import { ReactElement } from 'react'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TooltipItem, TooltipItems } from '@/llamalend/widgets/tooltips/TooltipComponents'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'
import { t, Trans } from '@ui-kit/lib/i18n'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'

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
      {balance != null
        ? formatNumber(balance, { ...(isUsd(symbol) && { currency: 'USD' }), notation: 'compact' })
        : '-'}
      {!isUsd(symbol) && ` ${symbol}`}
    </span>
  </Stack>
)

const Primary = ({ children }: { children: string }) => (
  <Typography color="primary" component="span" display="inline">
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
  <Stack gap={Spacing.sm}>
    <Typography color="textSecondary">
      <Trans>
        LlamaLend offers 2 types of markets: <Primary>Mint</Primary> and <Primary>Lend</Primary> Markets. Mint markets
        have a fixed cap determined by the DAO, while lend markets are capped by the amount of liquidity provided.
      </Trans>
    </Typography>
    <Stack>
      <TooltipItems secondary>
        <TooltipItem variant="primary" title={t`Utilization breakdown`} />
        {type === LlamaMarketType.Lend && (
          <TooltipItem title={t`Total supplied`}>
            {/* as we are displaying the utilization breakdown, display everything as borrowed token */}
            <Currency {...borrowed} balance={collateral.balanceUsd} />
          </TooltipItem>
        )}
        <TooltipItem title={t`Total borrowed`}>
          <Currency {...borrowed} />
        </TooltipItem>
        <TooltipItem title={t`Available to borrow`}>
          <Currency {...borrowed} balance={liquidityUsd} />
        </TooltipItem>
        {debtCeiling != null && (
          <TooltipItem title={t`Debt ceiling`}>
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

export const UtilizationCell = ({ row, getValue }: CellContext<LlamaMarket, number>) => (
  <UtilizationTooltip market={row.original}>
    <Stack gap={Spacing.xs}>
      {formatPercent(getValue())}
      <LinearProgress percent={getValue()} size="medium" />
    </Stack>
  </UtilizationTooltip>
)
