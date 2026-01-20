import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { MarketParameters } from '@/llamalend/features/market-parameters/MarketParameters'
import { BandsComp } from '@/loan/components/BandsComp'
import { ChartOhlcWrapper } from '@/loan/components/ChartOhlcWrapper'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import { useTheme } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { networks } from '../networks'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  llamma: Llamma | null
  marketId: string
  chainId: ChainId
  page?: 'create' | 'manage'
}

const EMPTY_BANDS_BALANCES: never[] = []

/**
 * Reusable component for OHLC charts, Bands, and market parameters. For /create and /manage pages.
 */
export const MarketInformationComp = ({ llamma, marketId, chainId, page = 'manage' }: MarketInformationCompProps) => {
  const { llamaApi: api } = useCurve()
  const theme = useTheme()
  const newBandsChartEnabled = useNewBandsChart()
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const collateralTokenAddress = llamma?.coinAddresses[1]
  const borrowedTokenAddress = llamma?.coinAddresses[0]
  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    isError: isBandsError,
  } = useBandsData({
    chainId,
    marketId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })
  const collateralToken = getBandsChartToken(collateralTokenAddress, llamma?.collateralSymbol)
  const borrowToken = getBandsChartToken(borrowedTokenAddress, llamma?.coins[0])

  return (
    <>
      <Stack
        display={{ mobile: 'block', tablet: newBandsChartEnabled ? 'grid' : undefined }}
        gridTemplateColumns={{ tablet: newBandsChartEnabled ? '1fr 0.5fr' : undefined }}
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}
      >
        <ChartOhlcWrapper
          rChainId={chainId}
          llammaId={marketId}
          llamma={llamma}
          betaBackgroundColor={theme.design.Layer[1].Fill}
        />
        {newBandsChartEnabled && (
          <BandsChart
            isLoading={isBandsLoading}
            isError={isBandsError}
            collateralToken={collateralToken}
            borrowToken={borrowToken}
            chartData={chartData}
            userBandsBalances={userBandsBalances ?? EMPTY_BANDS_BALANCES}
            oraclePrice={oraclePrice}
          />
        )}
      </Stack>
      {isAdvancedMode && !newBandsChartEnabled && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp llamma={llamma} llammaId={marketId} page={page} />
        </Stack>
      )}
      {llamma && isAdvancedMode && (
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
          <Stack gap={Spacing.xs} sx={{ flexGrow: 1, padding: Spacing.md }}>
            <Typography variant="headingXsBold">{t`Contracts`}</Typography>

            <AddressActionInfo
              isBorderBottom
              network={networks[chainId]}
              title={t`AMM`}
              address={llamma?.address ?? ''}
            />
            <AddressActionInfo
              isBorderBottom
              network={networks[chainId]}
              title={t`Controller`}
              address={llamma?.controller ?? ''}
            />
            <AddressActionInfo
              network={networks[chainId]}
              title={t`Monetary Policy`}
              address={llamma?.monetaryPolicy ?? ''}
            />
          </Stack>

          <MarketParameters chainId={chainId} marketId={marketId} marketType="mint" action="borrow" />
        </Stack>
      )}
    </>
  )
}
