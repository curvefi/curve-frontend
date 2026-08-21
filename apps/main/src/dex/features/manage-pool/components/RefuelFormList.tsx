import { useCallback } from 'react'
import { useCombinedQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import type { RefuelFormValues } from '../types'

const { Spacing } = SizesAndSpaces

const [WEEKLY, BIWEEKLY, MONTHLY] = [52, 26, 12]

type RefuelFormListProps = {
  values: RefuelFormValues
  tokenARate: QueryProp<number>
  tokenBRate: QueryProp<number>
  poolTvl: QueryProp<number>
}

const formatPercentage = (value: number | undefined) =>
  formatNumber(value, { unit: 'percentage', decimals: 2, abbreviate: false, fallback: '-' })

const extrapolateYearly = (value: number | null, donationsPerYear: number) =>
  maybe(value, value => value * donationsPerYear)

export const RefuelFormList = ({ values, tokenARate, tokenBRate, poolTvl }: RefuelFormListProps) => {
  const refuelTvlPercentage = useCombinedQueries(
    [tokenARate, tokenBRate, poolTvl],
    useCallback(
      (tokenAUsdRate, tokenBUsdRate, poolUsd) =>
        poolUsd === 0 || (values.tokenAAmount == null && values.tokenBAmount == null)
          ? null
          : ((+(values.tokenAAmount ?? 0) * tokenAUsdRate + +(values.tokenBAmount ?? 0) * tokenBUsdRate) / poolUsd) *
            100,
      [values.tokenAAmount, values.tokenBAmount],
    ),
  )

  return (
    <Stack sx={{ gap: Spacing.sm }}>
      <ActionInfo
        size="small"
        label={t`Percentage of pool TVL`}
        value={mapQuery(refuelTvlPercentage, formatPercentage)}
        testId="refuel-size-action-info"
      />

      <Stack>
        <ActionInfo
          size="small"
          label={t`Weekly`}
          value={mapQuery(refuelTvlPercentage, v => formatPercentage(extrapolateYearly(v, WEEKLY)))}
          testId="refuel-weekly-action-info"
        />

        <ActionInfo
          size="small"
          label={t`Bi-weekly`}
          value={mapQuery(refuelTvlPercentage, v => formatPercentage(extrapolateYearly(v, BIWEEKLY)))}
          testId="refuel-bi-weekly-action-info"
        />

        <ActionInfo
          size="small"
          label={t`Monthly`}
          value={mapQuery(refuelTvlPercentage, v => formatPercentage(extrapolateYearly(v, MONTHLY)))}
          testId="refuel-monthly-action-info"
        />
      </Stack>
    </Stack>
  )
}
