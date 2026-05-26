import { useMemo } from 'react'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { RefuelFormValues } from '../types'

const { Spacing } = SizesAndSpaces

const DONATIONS_PER_YEAR = {
  weekly: 52,
  biWeekly: 26,
  monthly: 12,
} as const

type RefuelFormListProps = {
  values: RefuelFormValues
  tokenA: {
    usdRate?: number
    isLoading: boolean
  }
  tokenB: {
    usdRate?: number
    isLoading: boolean
  }
  poolTvl: {
    usd?: number
    isLoading: boolean
  }
}

const formatPercentage = (value: number | undefined) =>
  formatNumber(value, { unit: 'percentage', decimals: 2, abbreviate: false, fallback: '-' })

const extrapolateYearly = (value: number | undefined, donationsPerYear: number) =>
  value == null ? undefined : value * donationsPerYear

export const RefuelFormList = ({ values, tokenA, tokenB, poolTvl: pool }: RefuelFormListProps) => {
  const refuelTvlPercentage = useMemo(
    () =>
      tokenA.usdRate == null ||
      tokenB.usdRate == null ||
      pool.usd == null ||
      pool.usd === 0 ||
      (values.tokenAAmount == null && values.tokenBAmount == null)
        ? undefined
        : ((+(values.tokenAAmount ?? 0) * tokenA.usdRate + +(values.tokenBAmount ?? 0) * tokenB.usdRate) / pool.usd) *
          100,
    [pool.usd, tokenA.usdRate, tokenB.usdRate, values.tokenAAmount, values.tokenBAmount],
  )

  const isLoading = tokenA.isLoading || tokenB.isLoading || pool.isLoading

  return (
    <Stack sx={{ gap: Spacing.sm }}>
      <ActionInfo
        size="small"
        label={t`Percentage of pool TVL`}
        value={formatPercentage(refuelTvlPercentage)}
        loading={isLoading}
        testId="refuel-size-action-info"
      />

      <Stack>
        <ActionInfo
          size="small"
          label={t`Weekly`}
          value={formatPercentage(extrapolateYearly(refuelTvlPercentage, DONATIONS_PER_YEAR.weekly))}
          loading={isLoading}
          testId="refuel-weekly-action-info"
        />

        <ActionInfo
          size="small"
          label={t`Bi-weekly`}
          value={formatPercentage(extrapolateYearly(refuelTvlPercentage, DONATIONS_PER_YEAR.biWeekly))}
          loading={isLoading}
          testId="refuel-bi-weekly-action-info"
        />

        <ActionInfo
          size="small"
          label={t`Monthly`}
          value={formatPercentage(extrapolateYearly(refuelTvlPercentage, DONATIONS_PER_YEAR.monthly))}
          loading={isLoading}
          testId="refuel-monthly-action-info"
        />
      </Stack>
    </Stack>
  )
}
