import { Alert, Stack, Typography } from '@mui/material'
import { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarketType } from '@ui-kit/types/market'
import type { Decimal } from '@ui-kit/utils/decimal'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces

export type LiquidationAlert = {
  softLiquidation: boolean
  hardLiquidation: boolean
}
export type Health = { value: number | undefined | null; loading: boolean }
export type BorrowRate = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  rebasingYield: number | null
  averageRebasingYield: number | null
  // total = rate - rebasingYield
  totalBorrowRate: number | null
  totalAverageBorrowRate: number | null
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
export type LiquidationRange = {
  value: number[] | undefined | null
  rangeToLiquidation: number | undefined | null
  loading: boolean
}
export type BandRange = { value: number[] | undefined | null; loading: boolean }
export type Leverage = { value: number | undefined | null; loading: boolean }
export type CollateralValue = {
  totalValue: number | undefined | null
  collateral: {
    value: number | undefined | null
    usdRate: number | undefined | null
    symbol: string | undefined
  }
  borrow: {
    value: number | undefined | null
    usdRate: number | undefined | null
    symbol: string | undefined
  }
  loading: boolean
}
export type Ltv = { value: number | undefined | null; loading: boolean }
export type TotalDebt = { value: number | undefined | null; loading: boolean }
export type CollateralLoss = {
  depositedCollateral: Decimal | undefined
  currentCollateralEstimation: Decimal | undefined
  percentage: Decimal | undefined
  amount: Decimal | undefined
  loading: boolean
}

export type BorrowPositionDetailsProps = {
  marketType: LlamaMarketType
  liquidationAlert: LiquidationAlert
  health: Health
  borrowRate: BorrowRate
  liquidationRange: LiquidationRange
  bandRange: BandRange
  leverage?: Leverage // doesn't exist yet for crvusd
  collateralValue: CollateralValue
  ltv: Ltv
  totalDebt: TotalDebt
  collateralLoss: CollateralLoss
}

const alerts = {
  soft: {
    title: t`Liquidation protection active`,
    description: (
      <>
        <Typography variant="bodyXsRegular">
          {t`Price has entered the liquidation zone and your collateral is at risk. Either close position or add collateral to improve health.`}
        </Typography>
        <Typography variant="bodyXsRegular" sx={{ marginTop: Spacing.xs }}>
          {t`While soft liquidation is active, health steadily declines based on market volatility and liquidity available in the liquidation zone.`}{' '}
          <strong>{t`If health reaches 0 all collateral lost.`}</strong>
        </Typography>
      </>
    ),
  },
  hard: {
    title: t`Liquidation protection inactive`,
    description: t`Health has reached 0 and your position can now be liquidated at any time and all collateral lost. To recover remaining collateral (minus fees), repay your debt and withdraw promptly.`,
  },
}

const LiquidationAlert = ({ type }: { type: 'soft' | 'hard' }) => {
  const { title, description } = alerts[type]

  return (
    <Stack
      sx={{
        paddingTop: Spacing.md,
        paddingRight: Spacing.md,
        paddingLeft: Spacing.md,
      }}
    >
      <Alert variant="filled" severity="error">
        <Stack display="flex" flexDirection="column">
          <Typography variant="bodySBold">{title}</Typography>
          {typeof description === 'string' ? (
            <Typography variant="bodyXsRegular">{description}</Typography>
          ) : (
            description
          )}
        </Stack>
      </Alert>
    </Stack>
  )
}

export const BorrowPositionDetails = ({
  marketType,
  liquidationAlert,
  health,
  borrowRate,
  liquidationRange,
  bandRange,
  leverage,
  collateralValue,
  ltv,
  totalDebt,
  collateralLoss,
}: BorrowPositionDetailsProps) => (
  <Stack>
    {liquidationAlert.softLiquidation && <LiquidationAlert type="soft" />}
    {liquidationAlert.hardLiquidation && <LiquidationAlert type="hard" />}
    <HealthDetails health={health} liquidationAlert={liquidationAlert} />
    <BorrowInformation
      marketType={marketType}
      borrowRate={borrowRate}
      collateralValue={collateralValue}
      ltv={ltv}
      leverage={leverage}
      liquidationRange={liquidationRange}
      bandRange={bandRange}
      totalDebt={totalDebt}
      collateralLoss={collateralLoss}
    />
  </Stack>
)
