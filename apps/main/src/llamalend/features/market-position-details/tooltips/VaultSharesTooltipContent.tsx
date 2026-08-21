import { t } from '@evm-ui/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@evm-ui/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { Stack } from '@mui/material'

const { Spacing } = SizesAndSpaces

export const VaultSharesTooltipContent = () => (
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
