import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AppType = 'borrow' | 'supply'
type NoPositionProps = {
  type: AppType
}

const title: Record<AppType, string> = {
  borrow: t`No active position`,
  supply: t`You're not earning yet`,
}

const description: Record<AppType, string> = {
  borrow: t`Borrow with LLAMMA to stay exposed, reduce liquidation risk and access liquidity without selling.`,
  supply: t`Lend assets to earn yield and support deep liquidity across Curve.`,
}

export const NoPosition = ({ type }: NoPositionProps) => (
  <Stack flexDirection="column" alignItems="center" gap={4} padding={Spacing.md}>
    <LlamaIcon sx={{ width: 48, height: 48 }} />
    <Stack alignItems="center">
      <Typography variant="headingSBold" sx={{ maxWidth: '27.5rem', textAlign: 'center' }}>
        {title[type]}
      </Typography>
      <Typography variant="bodyMRegular" sx={{ maxWidth: '27.5rem', textAlign: 'center' }}>
        {description[type]}
      </Typography>
    </Stack>
  </Stack>
)
