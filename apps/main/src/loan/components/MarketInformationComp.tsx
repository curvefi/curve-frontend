import { MarketParameters } from '@/llamalend/features/market-parameters/MarketParameters'
import { BandsComp } from '@/loan/components/BandsComp'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
  previewPrices: string[] | null | undefined
}

/**
 * Reusable component for OHLC charts, Bands, and market parameters. For /create and /manage pages.
 */
export const MarketInformationComp = ({
  llamma,
  marketId,
  chainId,
  page = 'manage',
  previewPrices,
}: MarketInformationCompProps) => {
  const newBandsChartEnabled = useNewBandsChart()
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  return (
    <>
      <ChartAndActivityComp chainId={chainId} llammaId={marketId} market={llamma} previewPrices={previewPrices} />
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
