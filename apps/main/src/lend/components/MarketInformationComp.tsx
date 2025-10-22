import { BandsComp } from '@/lend/components/BandsComp'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import DetailsContracts from '@/lend/components/DetailsMarket/components/DetailsContracts'
import MarketParameters from '@/lend/components/DetailsMarket/components/MarketParameters'
import { SubTitle } from '@/lend/components/DetailsMarket/styles'
import { useBandsData } from '@/lend/hooks/useBandsData'
import networks from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { Stack, useTheme } from '@mui/material'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  pageProps: PageContentProps
  chartExpanded: boolean
  loanExists?: boolean
  userActiveKey: string
  type: 'borrow' | 'supply'
  page?: 'create' | 'manage'
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters. For /create, /manage, /vault pages.
 */
export const MarketInformationComp = ({
  pageProps,
  chartExpanded,
  loanExists = false,
  userActiveKey,
  type,
  page = 'manage',
}: MarketInformationCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const theme = useTheme()
  const [releaseChannel] = useReleaseChannel()
  const isBeta = releaseChannel === ReleaseChannel.Beta
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const { chartData, userBandsBalances, liquidationBand, oraclePrice, oraclePriceBand } = useBandsData({
    rChainId,
    rOwmId,
    api: pageProps.api,
  })
  const collateralToken = market && {
    symbol: market?.collateral_token.symbol,
    address: market?.collateral_token.address,
    chain: networks[rChainId].id,
  }
  const borrowToken = market && {
    symbol: market?.borrowed_token.symbol,
    address: market?.borrowed_token.address,
    chain: networks[rChainId].id,
  }

  return (
    <>
      {networks[rChainId]?.pricesData && !chartExpanded && (
        <Stack
          display={isBeta ? 'grid' : undefined}
          gridTemplateColumns={isBeta ? '1fr 0.5fr' : undefined}
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}
        >
          <ChartOhlcWrapper
            rChainId={rChainId}
            rOwmId={rOwmId}
            userActiveKey={userActiveKey}
            betaBackgroundColor={theme.design.Layer[1].Fill}
          />
          <BandsChart
            collateralToken={collateralToken}
            borrowToken={borrowToken}
            chartData={chartData}
            userBandsBalances={userBandsBalances ?? []}
            liquidationBand={liquidationBand}
            oraclePrice={oraclePrice}
            oraclePriceBand={oraclePriceBand}
          />
        </Stack>
      )}
      {type === 'borrow' && isAdvancedMode && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp pageProps={pageProps} page={page} loanExists={loanExists} />
        </Stack>
      )}
      {market && isAdvancedMode && (
        <Stack
          sx={{
            backgroundColor: (t) => t.design.Layer[1].Fill,
            flexDirection: 'column',
            // 1100px
            '@media (min-width: 68.75rem)': {
              flexDirection: 'row',
            },
          }}
        >
          <Stack sx={{ flexGrow: 1, padding: Spacing.md }}>
            <DetailsContracts rChainId={rChainId} market={market} />
          </Stack>
          <Stack sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.md, minWidth: '18.75rem' }}>
            <SubTitle>{t`Parameters`}</SubTitle>
            <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type={type} />
          </Stack>
        </Stack>
      )}
    </>
  )
}
