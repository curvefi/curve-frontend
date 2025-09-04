import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const VaultSharesTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The number of shares you hold in the lending vault.`} />
    <TooltipDescription
      text={t`Shares represent your proportional ownership of the pool and accrue interest and rewards over time.`}
    />
    <Stack padding={Spacing.sm} sx={{ bgcolor: (t) => t.design.Layer[2].Fill }}>
      <TooltipDescription
        text={t`⚠️ Share value increases with yield — so your balance grows even if share count stays constant.`}
      />
    </Stack>
  </TooltipWrapper>
)
