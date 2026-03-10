import { BandsComp } from '@/lend/components/BandsComp'
import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails, MarketInfoSections } from '@/llamalend/features/market-advanced-information'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useNewBandsChart, useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  pageProps: PageContentProps
  loanExists: boolean | undefined
  type: 'borrow' | 'supply'
  previewPrices?: Range<Decimal> | undefined
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComp = ({ pageProps, loanExists, type, previewPrices }: MarketInformationCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const api = getLib('llamaApi')
  const newBandsChartEnabled = useNewBandsChart()
  const showPageHeader = useIntegratedLlamaHeader()

  return (
    <>
      <ChartAndActivityComp rChainId={rChainId} rOwmId={rOwmId} api={api} previewPrices={previewPrices} />
      {type === 'borrow' && !newBandsChartEnabled && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp pageProps={pageProps} loanExists={loanExists} />
        </Stack>
      )}
      {market && showPageHeader && (
        <Stack
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, ...(showPageHeader && { marginTop: Spacing.md }) }}
        >
          {showPageHeader && (
            <AdvancedDetails chainId={rChainId} marketId={rOwmId} market={market} marketType={LlamaMarketType.Lend} />
          )}
          <MarketInfoSections
            chainId={rChainId}
            marketType={LlamaMarketType.Lend}
            market={market}
            network={networks[rChainId]}
          />
        </Stack>
      )}
    </>
  )
}
