import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { BandsComp } from '@/loan/components/BandsComp'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import DetailInfoAddressLookup from '@/loan/components/LoanInfoLlamma/components/DetailInfoAddressLookup'
import LoanInfoParameters from '@/loan/components/LoanInfoLlamma/LoanInfoParameters'
import { SubTitle } from '@/loan/components/LoanInfoLlamma/styles'
import { useBandsData } from '@/loan/hooks/useBandsData'
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
  const { chartData, userBands, liquidationBand, oraclePrice, oraclePriceBand } = useBandsData({
    chainId,
    llammaId,
    api,
  })
  const collateralToken = llamma && {
    symbol: llamma?.collateralSymbol,
    address: llamma?.coinAddresses[1],
    chain: networks[chainId].id,
  }
  const borrowToken = llamma && {
    symbol: llamma?.coins[0],
    address: llamma?.coinAddresses[0],
    chain: networks[chainId].id,
  }

  return (
    <>
      {!chartExpanded && (
        <Stack
          display={isBeta ? 'grid' : undefined}
          gridTemplateColumns={isBeta ? '1fr 0.5fr' : undefined}
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
              collateralToken={collateralToken}
              borrowToken={borrowToken}
              chartData={chartData}
              userBandsBalances={userBands ?? []}
              liquidationBand={liquidationBand}
              oraclePrice={oraclePrice}
              oraclePriceBand={oraclePriceBand}
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
