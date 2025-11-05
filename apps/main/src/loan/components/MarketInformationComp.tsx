import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { BandsComp } from '@/loan/components/BandsComp'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import DetailInfoAddressLookup from '@/loan/components/LoanInfoLlamma/components/DetailInfoAddressLookup'
import LoanInfoParameters from '@/loan/components/LoanInfoLlamma/LoanInfoParameters'
import { SubTitle } from '@/loan/components/LoanInfoLlamma/styles'
import networks from '@/loan/networks'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import { Stack, useTheme } from '@mui/material'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  llamma: Llamma
  llammaId: string
  chainId: ChainId
  chartExpanded: boolean
  page?: 'create' | 'manage'
}

const EMPTY_BANDS_BALANCES: never[] = []

/**
 * Reusable component for OHLC charts, Bands, and market parameters. For /create and /manage pages.
 */
export const MarketInformationComp = ({
  llamma,
  llammaId,
  chainId,
  chartExpanded,
  page = 'manage',
}: MarketInformationCompProps) => {
  const api = getLib('llamaApi')
  const theme = useTheme()
  const [releaseChannel] = useReleaseChannel()
  const isBeta = releaseChannel === ReleaseChannel.Beta
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
    llammaId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })
  const collateralToken =
    llamma && collateralTokenAddress
      ? {
          symbol: llamma.collateralSymbol,
          address: collateralTokenAddress,
          chain: networks[chainId].id,
        }
      : undefined
  const borrowToken =
    llamma && borrowedTokenAddress
      ? {
          symbol: llamma.coins[0],
          address: borrowedTokenAddress,
          chain: networks[chainId].id,
        }
      : undefined

  return (
    <>
      {!chartExpanded && (
        <Stack
          display={{ mobile: 'block', tablet: isBeta ? 'grid' : undefined }}
          gridTemplateColumns={{ tablet: isBeta ? '1fr 0.5fr' : undefined }}
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}
        >
          <ChartOhlcWrapper
            rChainId={chainId}
            llammaId={llammaId}
            llamma={llamma}
            betaBackgroundColor={theme.design.Layer[1].Fill}
          />
          {isBeta && (
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
      )}
      {isAdvancedMode && !isBeta && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
          <BandsComp llamma={llamma} llammaId={llammaId} page={page} />
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
          <Stack sx={{ flexGrow: 1, padding: Spacing.md }}>
            <SubTitle>{t`Contracts`}</SubTitle>
            <DetailInfoAddressLookup isBorderBottom chainId={chainId} title={t`AMM`} address={llamma?.address ?? ''} />
            <DetailInfoAddressLookup
              isBorderBottom
              chainId={chainId}
              title={t`Controller`}
              address={llamma?.controller ?? ''}
            />
            <DetailInfoAddressLookup
              chainId={chainId}
              title={t`Monetary Policy`}
              address={llamma?.monetaryPolicy ?? ''}
            />
          </Stack>
          <Stack sx={{ backgroundColor: (t) => t.design.Layer[2].Fill, padding: Spacing.md, minWidth: '18.75rem' }}>
            <SubTitle>{t`Loan Parameters`}</SubTitle>
            <LoanInfoParameters llamma={llamma} llammaId={llammaId} />
          </Stack>
        </Stack>
      )}
    </>
  )
}
