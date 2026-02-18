import { BandsComp } from '@/lend/components/BandsComp'
import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { DetailsContracts } from '@/lend/components/DetailsMarket/components/DetailsContracts'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails } from '@/llamalend/features/market-details'
import { MarketParameters } from '@/llamalend/features/market-parameters/MarketParameters'
import Stack from '@mui/material/Stack'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNewBandsChart, useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  pageProps: PageContentProps
  loanExists: boolean | undefined
  type: 'borrow' | 'supply'
  previewPrices?: string[] | undefined
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComp = ({ pageProps, loanExists, type, previewPrices }: MarketInformationCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const api = getLib('llamaApi')
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const newBandsChartEnabled = useNewBandsChart()
  const showPageHeader = useIntegratedLlamaHeader()
  const marketDetails = useMarketDetails({ chainId: rChainId, market, marketId: rOwmId })

  return (
    <>
      <ChartAndActivityComp rChainId={rChainId} rOwmId={rOwmId} api={api} previewPrices={previewPrices} />
      {type === 'borrow' && !newBandsChartEnabled && isAdvancedMode && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp pageProps={pageProps} loanExists={loanExists} />
        </Stack>
      )}
      {market && isAdvancedMode && (
        <Stack
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, ...(showPageHeader && { marginTop: Spacing.md }) }}
        >
          {showPageHeader && <AdvancedDetails {...marketDetails} />}
          <Stack
            sx={{
              flexDirection: 'column',
              [`@media (min-width: ${SizesAndSpaces.MaxWidth.candleAndBandChart})`]: {
                flexDirection: 'row',
              },
            }}
          >
            <Stack sx={{ flexGrow: 1, padding: Spacing.md }}>
              <DetailsContracts rChainId={rChainId} market={market} />
            </Stack>

            <MarketParameters chainId={rChainId} marketId={rOwmId} marketType="lend" action={type} />
          </Stack>
        </Stack>
      )}
    </>
  )
}
