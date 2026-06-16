import { Stack, Typography } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize, MaxWidth } = SizesAndSpaces

type NoPositionType = 'borrow' | 'supply' | 'loading'
type NoPositionProps = { type: NoPositionType }

const title: Record<NoPositionType, string> = {
  borrow: t`No active position`,
  supply: t`You're not earning yet`,
  loading: t`Loading...`,
}

const description: Partial<Record<NoPositionType, string>> = {
  borrow: t`Borrow with LLAMMA to stay exposed, reduce liquidation risk and access liquidity without selling.`,
  supply: t`Lend assets to earn yield and support deep liquidity across Curve.`,
}

export const NoPosition = ({ type }: NoPositionProps) => (
  <Stack
    sx={{
      flexDirection: 'column',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.md,
    }}
  >
    <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
    <Stack sx={{ alignItems: 'center' }}>
      <Typography variant="headingXsBold" sx={{ maxWidth: MaxWidth.emptyStateCard, textAlign: 'center' }}>
        {title[type]}
      </Typography>
      {maybe(description[type], description => (
        <Typography
          variant="bodySRegular"
          sx={{
            maxWidth: MaxWidth.emptyStateCard,
            textAlign: 'center',
            color: t => t.design.Text.TextColors.Secondary,
          }}
        >
          {description}
        </Typography>
      ))}{' '}
    </Stack>
  </Stack>
)
