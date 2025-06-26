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
  loading?: boolean // shows skeleton instead of children
  subitem?: boolean // adds some extra padding and non-bold font weight
  primary?: boolean // used for the sum, displayed in primary color
}) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography
      color={primary ? 'textPrimary' : subitem ? 'textTertiary' : 'textSecondary'}
      variant={subitem ? 'bodyMRegular' : 'bodyMBold'}
      {...(subitem && {
        sx: {
          marginLeft: Spacing.md,
        },
      })}
    >
      {title}
    </Typography>
    <WithSkeleton loading={loading}>
      <Typography variant={subitem ? 'bodyMRegular' : 'bodyMBold'} color={primary ? 'primary' : 'textSecondary'}>
        {children}
      </Typography>
    </WithSkeleton>
  </Stack>
)

export const TooltipItems = ({ children, secondary }: { children: ReactNode; secondary?: boolean }) => (
  <Stack padding={Spacing.sm} {...(secondary && { bgcolor: (t) => t.design.Layer[2].Fill })}>
    {children}
  </Stack>
)
