import { BandsComp } from '@/lend/components/BandsComp'
import { ChartOhlcWrapper } from '@/lend/components/ChartOhlcWrapper'
import { DetailsContracts } from '@/lend/components/DetailsMarket/components/DetailsContracts'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { MarketParameters } from '@/llamalend/features/market-parameters/MarketParameters'
import { useTheme } from '@mui/material'
import Stack from '@mui/material/Stack'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  pageProps: PageContentProps
  loanExists: boolean | undefined
  userActiveKey: string
  type: 'borrow' | 'supply'
}

const EMPTY_ARRAY: never[] = []

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComp = ({ pageProps, loanExists, userActiveKey, type }: MarketInformationCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address
  const api = getLib('llamaApi')
  const theme = useTheme()
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const newBandsChartEnabled = useNewBandsChart()
  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    isError: isBandsError,
  } = useBandsData({
    chainId: rChainId,
    marketId: rOwmId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })
  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateral_token.symbol)
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.borrowed_token.symbol)

  return (
    <>
      {networks[rChainId]?.pricesData && (
        <Stack
          display={{ mobile: 'block', tablet: newBandsChartEnabled ? 'grid' : undefined }}
          gridTemplateColumns={{ tablet: newBandsChartEnabled ? '1fr 0.3fr' : undefined }}
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}
        >
          <ChartOhlcWrapper
            rChainId={rChainId}
            rOwmId={rOwmId}
            userActiveKey={userActiveKey}
            betaBackgroundColor={theme.design.Layer[1].Fill}
          />
          {newBandsChartEnabled && (
            <BandsChart
              isLoading={isBandsLoading}
              isError={isBandsError}
              collateralToken={collateralToken}
              borrowToken={borrowToken}
              chartData={chartData}
              userBandsBalances={userBandsBalances ?? EMPTY_ARRAY}
              oraclePrice={oraclePrice}
            />
          )}
        </Stack>
      )}
      {type === 'borrow' && !newBandsChartEnabled && isAdvancedMode && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp pageProps={pageProps} loanExists={loanExists} />
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

          <MarketParameters chainId={rChainId} marketId={rOwmId} marketType="lend" action={type} />
        </Stack>
      )}
    </>
  )
}
