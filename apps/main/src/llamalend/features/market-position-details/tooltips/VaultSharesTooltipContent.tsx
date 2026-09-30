import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import {
  TooltipWrapper,
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipFooter,
} from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const VaultSharesTooltipContent = ({ stakedPercentage }: { stakedPercentage?: Decimal } = {}) => {
  const beta = useNewLlamalendHealth()
  if (beta) {
    return (
      <TooltipWrapper>
        <TooltipDescription text={t`Your ownership of the lending vault, measured in shares.`} />
        {stakedPercentage != null && (
          <TooltipItems secondary>
            <TooltipItem title={t`Staked share`} variant="independent">
              {formatNumber(stakedPercentage, 'percent.rate')}
            </TooltipItem>
          </TooltipItems>
        )}
        <TooltipFooter>{t`Shares can gain value as yield accrues without changing your share count.`}</TooltipFooter>
      </TooltipWrapper>
    )
  }
  return (
    <TooltipWrapper>
      <TooltipDescription text={t`The number of shares you hold in the lending vault.`} />
      <TooltipDescription
        text={t`Shares represent your proportional ownership of the pool and accrue interest and rewards over time.`}
      />
      <Stack sx={{ padding: Spacing.sm, bgcolor: t => t.design.Layer[2].Fill }}>
        <TooltipDescription
          text={t`⚠️ Share value increases with yield — so your balance grows even if share count stays constant.`}
        />
      </Stack>
    </TooltipWrapper>
  )
}
