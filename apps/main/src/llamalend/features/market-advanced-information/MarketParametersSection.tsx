import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MaxReturnOnEquity } from '@/llamalend/widgets/tooltips/MaxReturnOnEquityTooltipContent'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MarketType } from '@evm-ui/types/market'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketPricesRows } from './MarketParameterRows'

type MarketParametersProps = {
  chainId: IChainId
  marketId: string | undefined
  marketType: MarketType
  apiMarket: QueryProp<LlamaMarket>
  tokens: MarketTokensOrEmpty
  maxLeverage?: QueryProp<{ value: Decimal } | { value: number }>
  maxReturnOnEquity?: QueryProp<MaxReturnOnEquity>
}

export const MarketParametersSection = ({
  chainId,
  marketId,
  marketType,
  apiMarket,
  tokens,
  maxLeverage,
  maxReturnOnEquity,
}: MarketParametersProps) => (
  <Stack>
    <Card size="extraSmall" variant="inline" data-testid="market-prices-section">
      <CardHeader title={t`Prices`} />
      <CardContent component={SectionContentCard}>
        <MarketPricesRows
          chainId={chainId}
          marketId={marketId}
          enablePricePerShare={marketType === MarketType.Lend}
          apiMarket={apiMarket}
          tokens={tokens}
        />
      </CardContent>
    </Card>

    <Card size="extraSmall" variant="inline" data-testid="market-parameters-section">
      <CardHeader title={t`Parameters`} />
      <CardContent component={SectionContentCard}>
        <MarketLoanParameters
          chainId={chainId}
          marketId={marketId}
          apiMarket={apiMarket}
          maxLeverage={maxLeverage}
          maxReturnOnEquity={maxReturnOnEquity}
        />
      </CardContent>
    </Card>
  </Stack>
)
