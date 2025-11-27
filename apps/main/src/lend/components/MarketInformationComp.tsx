import { BandsComp } from '@/lend/components/BandsComp'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import DetailsContracts from '@/lend/components/DetailsMarket/components/DetailsContracts'
import networks from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { MarketMisc } from '@/llamalend/features/market-parameters/MarketMisc'
import { MarketParameters } from '@/llamalend/features/market-parameters/MarketParameters'
import { MarketPrices } from '@/llamalend/features/market-parameters/MarketPrices'
import { Typography, useTheme } from '@mui/material'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@ui/utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useMarketPricePerShare } from '../entities/market-details'

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

  const {
    data: pricePerShare,
    isLoading: isLoadingPricePerShare,
    error: errorPricePerShare,
  } = useMarketPricePerShare({ chainId: rChainId, marketId: rOwmId })

  return (
    <>
      {networks[rChainId]?.pricesData && !chartExpanded && (
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

          <Stack
            gap={Spacing.md}
            sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.md, minWidth: '18.75rem' }}
          >
            {type === 'borrow' && (
              <Stack gap={Spacing.xs}>
                <Typography variant="headingXsBold">{t`Loan Parameters`}</Typography>
                <Stack>
                  <MarketParameters chainId={rChainId} marketId={rOwmId} />
                </Stack>
              </Stack>
            )}

            <Stack gap={Spacing.xs}>
              <Typography variant="headingXsBold">{t`Prices`}</Typography>
              <Stack>
                <MarketPrices chainId={rChainId} marketId={rOwmId} />
                {type === 'supply' && (
                  <ActionInfo
                    label={t`Price per share`}
                    value={formatNumber(pricePerShare, { decimals: 5 })}
                    loading={isLoadingPricePerShare}
                    error={errorPricePerShare}
                  />
                )}
              </Stack>
            </Stack>

            <Stack gap={Spacing.xs}>
              <Typography variant="headingXsBold">{t`Market`}</Typography>
              <Stack>
                <MarketMisc market={market} />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      )}
    </>
  )
}
