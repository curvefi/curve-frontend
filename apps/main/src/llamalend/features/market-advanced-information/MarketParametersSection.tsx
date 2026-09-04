import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketType } from '@evm-ui/types/market'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { QueryProp } from '@ui/features/queries/util'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketIdRow, MarketPricesRows } from './MarketParameterRows'

const { Spacing } = SizesAndSpaces

type MarketParametersProps = {
  chainId: IChainId
  marketId: string | undefined
  marketType: MarketType
  apiMarket: QueryProp<LlamaMarket>
}

export const MarketParametersSection = ({ chainId, marketId, marketType, apiMarket }: MarketParametersProps) => (
  <Stack>
    {!useNewLlamaMarketDetailPage() && (
      <Card size="inline" data-testid="market-prices-section">
        <CardHeader title={t`Prices`} />
        <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
          <MarketPricesRows
            chainId={chainId}
            marketId={marketId}
            enablePricePerShare={marketType === MarketType.Lend}
            apiMarket={apiMarket}
          />
        </CardContent>
      </Card>
    )}

    <Card size="inline" data-testid="market-parameters-section">
      <CardHeader title={t`Parameters`} />
      <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
        <MarketLoanParameters chainId={chainId} marketId={marketId} apiMarket={apiMarket} />
      </CardContent>
    </Card>

    <Card size="inline" data-testid="market-id-section">
      <CardHeader title={t`Market`} />
      <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
        <MarketIdRow marketId={marketId ?? apiMarket.data?.controllerAddress} />
      </CardContent>
    </Card>
  </Stack>
)
