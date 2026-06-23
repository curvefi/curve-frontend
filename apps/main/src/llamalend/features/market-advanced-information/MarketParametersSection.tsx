import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { MarketLoanParameters } from './MarketLoanParameters'
import { MarketPricesRows } from './MarketParameterRows'

const { Spacing } = SizesAndSpaces

type MarketParametersProps = {
  chainId: IChainId
  marketId: string | undefined
  marketType: LlamaMarketType
}

export const MarketParametersSection = ({ chainId, marketId, marketType }: MarketParametersProps) => (
  <Stack>
    <Card size="inline">
      <CardHeader title={t`Prices`} />
      <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
        <MarketPricesRows
          chainId={chainId}
          marketId={marketId}
          enablePricePerShare={marketType === LlamaMarketType.Lend}
        />
      </CardContent>
    </Card>

    <Card size="inline">
      <CardHeader title={t`Parameters`} />
      <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
        <MarketLoanParameters chainId={chainId} marketId={marketId} />
      </CardContent>
    </Card>
  </Stack>
)
