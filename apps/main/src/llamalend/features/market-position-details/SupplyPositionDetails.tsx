import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AmountSuppliedTooltipContent } from './tooltips/AmountSuppliedTooltipContent'
import { VaultSharesTooltipContent } from './tooltips/VaultSharesTooltipContent'

const { Spacing } = SizesAndSpaces

export type Shares = {
  value: number | undefined | null
  staked: number | undefined | null
  loading: boolean
}
type Boost = {
  value: number | undefined | null
  loading: boolean
}
export type SupplyAsset = {
  symbol: string | undefined | null
  address: string | undefined | null
  usdRate: number | undefined | null
  depositedAmount: number | undefined | null
  depositedUsdValue: number | undefined | null
  loading: boolean
}

export type SupplyPositionDetailsProps = {
  shares: Shares
  supplyAsset: SupplyAsset
  boost: Boost
}

export const SupplyPositionDetails = ({ shares, supplyAsset, boost }: SupplyPositionDetailsProps) => {
  const { loading: supplyAssetLoading, symbol: supplyAssetSymbol, depositedAmount } = supplyAsset
  const { value: sharesValue, staked: sharesStaked, loading: sharesLoading } = shares
  const { value: boostValue, loading: boostLoading } = boost

  return (
    <Box>
      <CardHeader title={t`Supplying Information`} size="small" />
      <Box
        display="grid"
        gap={3}
        sx={(theme) => ({
          padding: Spacing.md,
          gridTemplateColumns: '1fr 1fr',
          // 550px
          [theme.breakpoints.up(550)]: {
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
          },
        })}
      >
        <Metric
          size="medium"
          label={t`Amount supplied`}
          value={depositedAmount}
          loading={supplyAssetLoading}
          valueOptions={{ unit: 'dollar' }}
          notional={
            depositedAmount
              ? {
                  value: depositedAmount,
                  unit: { symbol: ` ${supplyAssetSymbol}`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Amount Supplied`,
            body: <AmountSuppliedTooltipContent shares={shares} supplyAsset={supplyAsset} />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`Vault shares`}
          value={sharesValue}
          loading={sharesLoading}
          valueOptions={{}}
          notional={
            sharesStaked && sharesValue
              ? {
                  value: (sharesStaked / sharesValue) * 100,
                  unit: { symbol: t`% staked`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Vault Shares`,
            body: <VaultSharesTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="medium"
          label={t`veCRV Boost`}
          value={boostValue}
          loading={boostLoading}
          valueOptions={{ unit: 'multiplier' }}
          valueTooltip={{
            title: t`veCRV Boost`,
            body: <BoostTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
      </Box>
    </Box>
  )
}
