import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { poolTypeClassifications } from '@ui/features/pool-list/cells/PoolTitleCell/classifications'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { isInRange, tickToPrice } from '../api/uniswap.api'
import type { UniswapPositionRow } from '../hooks/useUniswapPositionRows'
import { type CurveTarget, formatFeeTier, getTargetGauge, UNISWAP_FEE_APR_DESCRIPTION } from '../migration.utils'

const { Spacing, MaxWidth } = SizesAndSpaces

const CURVE_REBALANCING = {
  stable: t`Liquidity is concentrated around the peg automatically`,
  volatile: t`The pool re-centers liquidity on the price automatically`,
  fxswap: t`The pool re-centers liquidity on the FX rate automatically`,
}

const formatPrice = (price: number) => formatNumber(price, { abbreviate: true, decimals: price < 10 ? 4 : 2 })

/**
 * What a Uniswap v3 LP gives up and gains: a fungible full-range position that needs no range management,
 * and CRV emissions when staked, against their current range and fee tier.
 */
export const UniswapCurveComparison = ({ position, target }: { position: UniswapPositionRow; target: CurveTarget }) => {
  const [token0, token1] = position.tokens
  const priceRange = [position.tickLower, position.tickUpper].map(tick =>
    formatPrice(tickToPrice(tick, position.tokens)),
  )
  const classification = maybe(target.row.poolType, type => poolTypeClassifications[type])
  const hasGauge = !!getTargetGauge(target)
  const rows = [
    { label: t`Position`, value: t`Uniswap v3 NFT #${position.tokenId}`, futureValue: t`${target.row.name} LP token` },
    {
      label: t`Price range`,
      value: t`${priceRange[0]} – ${priceRange[1]} ${token1.symbol} per ${token0.symbol}`,
      futureValue: t`Full range`,
    },
    {
      label: t`Earning`,
      value: isInRange(position)
        ? t`Only while the price stays in your range`
        : t`Not earning, the price is out of range`,
      futureValue: t`At every price`,
    },
    {
      label: t`Rebalancing`,
      value: t`Manual: move your range when the price leaves it`,
      futureValue: classification ? CURVE_REBALANCING[classification] : t`Handled by the pool`,
    },
    {
      label: t`Trading fees`,
      value: t`${formatFeeTier(position.fee)} tier, claimed by hand`,
      futureValue: t`Added to the LP value automatically`,
    },
    {
      label: t`Rewards`,
      value: t`None`,
      futureValue: hasGauge ? t`CRV and pool rewards when staked` : t`No gauge on this pool`,
    },
    {
      label: t`APR`,
      labelTooltip: { title: t`Estimated fee APR`, body: UNISWAP_FEE_APR_DESCRIPTION },
      value: t`${formatNumber(position.feeApr, 'percent.rate')} fee APR (est.)`,
      futureValue: t`${formatNumber(target.row.netApr, 'percent.rate')} Net APR`,
    },
  ]
  return (
    <Stack>
      <TabsSwitcher
        variant="contained"
        value="compare"
        options={[{ value: 'compare', label: t`What changes when you migrate` }]}
      />
      <Stack
        sx={{ gap: Spacing.xs, padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
        data-testid="uniswap-curve-comparison"
      >
        {rows.map(row => (
          <ActionInfo key={row.label} {...row} sx={{ maxWidth: MaxWidth.tableTitle }} />
        ))}
      </Stack>
    </Stack>
  )
}
