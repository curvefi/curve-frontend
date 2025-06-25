import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const TooltipItem = ({
  title,
  children,
  loading = false,
  subitem = false,
  primary = false,
}: {
  title: ReactNode
  children?: ReactNode
  loading?: boolean
  subitem?: boolean
  primary?: boolean
}) => (
  <Typography
    component={Stack}
    color={subitem ? 'textTertiary' : 'textSecondary'}
    variant={subitem ? 'bodyMRegular' : 'bodyMBold'}
    direction="row"
    justifyContent="space-between"
    {...(subitem && {
      sx: {
        marginLeft: Spacing.md,
      },
    })}
  >
    <Stack direction="row" flexShrink={1} gap={1}>
      {title}
    </Stack>
    <WithSkeleton loading={loading}>
      <Typography variant={subitem ? 'bodyMRegular' : 'bodyMBold'} color={primary ? 'primary' : 'textSecondary'}>
        {children}
      </Typography>
    </WithSkeleton>
  </Typography>
)
