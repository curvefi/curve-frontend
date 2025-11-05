import { BandsComp } from '@/lend/components/BandsComp'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import DetailsContracts from '@/lend/components/DetailsMarket/components/DetailsContracts'
import MarketParameters from '@/lend/components/DetailsMarket/components/MarketParameters'
import { SubTitle } from '@/lend/components/DetailsMarket/styles'
import networks from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { Stack, useTheme } from '@mui/material'
import { getLib } from '@ui-kit/features/connect-wallet'
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

const EMPTY_ARRAY: never[] = []

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
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address
  const api = getLib('llamaApi')
  const theme = useTheme()
  const [releaseChannel] = useReleaseChannel()
  const isBeta = releaseChannel === ReleaseChannel.Beta
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
  } = useBandsData({
    chainId: rChainId,
    llammaId: rOwmId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })
  const collateralToken =
    market && collateralTokenAddress
      ? {
          symbol: market.collateral_token.symbol,
          address: collateralTokenAddress,
          chain: networks[rChainId].id,
        }
      : undefined
  const borrowToken =
    market && borrowedTokenAddress
      ? {
          symbol: market.borrowed_token.symbol,
          address: borrowedTokenAddress,
          chain: networks[rChainId].id,
        }
      : undefined

  return (
    <>
      {networks[rChainId]?.pricesData && !chartExpanded && (
        <Stack
          display={{ mobile: 'block', tablet: isBeta ? 'grid' : undefined }}
          gridTemplateColumns={{ tablet: isBeta ? '1fr 0.3fr' : undefined }}
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}
        >
          <ChartOhlcWrapper
            rChainId={rChainId}
            rOwmId={rOwmId}
            userActiveKey={userActiveKey}
            betaBackgroundColor={theme.design.Layer[1].Fill}
          />
          {isBeta && (
            <BandsChart
              isLoading={isBandsLoading}
              collateralToken={collateralToken}
              borrowToken={borrowToken}
              chartData={chartData}
              userBandsBalances={userBandsBalances ?? EMPTY_ARRAY}
              oraclePrice={oraclePrice}
            />
          )}
        </Stack>
      )}
      {type === 'borrow' && !isBeta && isAdvancedMode && (
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
