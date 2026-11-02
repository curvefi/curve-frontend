import { useMemo } from 'react'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe, range } from '@primitives/objects.utils'
import { EChartsLineChart } from '@ui/features/charts/EChartsLineChart'
import { DENSITY_LOG_PRICE_BAND, liquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

// Show the first token pair at equal reserves and a unit peg.
const PREVIEW_PAIR = [0, 1] as const
const REFERENCE_DASH = [4, 3]
const PREVIEW_HEIGHT = 210

const { Spacing } = SizesAndSpaces

export const StableswapLiquidityDepthPreview = ({
  amplification,
  tokenCount,
}: {
  amplification: Decimal | undefined
  tokenCount: number
}) => {
  const theme = useTheme()
  const data = useMemo(
    () =>
      // Reuse the local liquidity-density math; an undeployed pool has no on-chain reserves to query.
      maybe(amplification, amplification => {
        const balances = range(tokenCount).map(() => 1) // Unit reserves and rates model equal-value tokens at a 1:1 peg; absolute size cancels in the depth ratio.
        return maybe(createStableSwapCurve(balances, balances, +amplification), curve =>
          maybe(liquidityProfile(curve, PREVIEW_PAIR), profile =>
            profile.samples.map(({ price, depth }) => ({
              deviation: (price - 1) * 100,
              // For x*y=1, |dx/d(log price)| = 1 / (2*sqrt(price)); use the profile's log-price band.
              relativeDepth: depth / (DENSITY_LOG_PRICE_BAND / (2 * Math.sqrt(price))),
              reference: 1,
            })),
          ),
        )
      }),
    [amplification, tokenCount],
  )
  const peak = maybe(data, samples => Math.max(...samples.map(sample => sample.relativeDepth)))

  return (
    <Stack sx={{ gap: Spacing.sm }}>
      <Typography variant="headingXsBold">{t`Liquidity depth around the peg`}</Typography>
      {data?.length ? (
        <>
          <Typography variant="bodySBold">
            {t`Peak depth`}: {formatNumber(peak, 'multiplier')}
          </Typography>
          <EChartsLineChart
            data={data}
            height={PREVIEW_HEIGHT}
            xKey="deviation"
            xAxisType="value"
            xTickFormatter={value => formatNumber(Number(value), 'percent.value')}
            yTickFormatter={value => formatNumber(Number(value), 'multiplier')}
            series={[
              { key: 'relativeDepth', label: t`Stableswap`, color: theme.palette.primary.main },
              {
                key: 'reference',
                label: t`Constant product`,
                color: theme.palette.text.secondary,
                dash: REFERENCE_DASH,
              },
            ]}
          />
          <Typography
            variant="bodyXsRegular"
            color="textSecondary"
          >{t`Stableswap (solid) vs. constant product (dashed). Equal reserves, before fees. Preview for the first two tokens.`}</Typography>
        </>
      ) : (
        <Typography variant="bodySRegular">{t`Enter a valid amplification to preview the curve.`}</Typography>
      )}
    </Stack>
  )
}
