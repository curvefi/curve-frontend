import type { ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGoBack } from '@ui-kit/hooks/router'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const BackButton = ({ href }: { href: string }) => (
  <IconButton size="small" component={RouterLink} href={href} onClick={useGoBack()}>
    <ArrowLeft />
  </IconButton>
)

export const PageHeader = ({
  title,
  subtitle,
  titleLoading = false,
  subtitleLoading = false,
  icon,
  titleItems,
  rightItems,
  rightItemsRowBreakpoint = 'tablet',
  backHref,
}: {
  title: string
  subtitle?: string
  titleLoading?: boolean
  subtitleLoading?: boolean
  backHref?: string
  icon?: ReactNode
  titleItems?: ReactNode
  rightItems?: ReactNode
  rightItemsRowBreakpoint?: 'tablet' | 'desktop'
}) => (
  <Stack
    direction={{ mobile: 'column', [rightItemsRowBreakpoint]: 'row' }}
    sx={{ justifyContent: 'space-between', gap: Spacing.md, paddingBlock: Spacing.sm, flexWrap: 'wrap' }}
  >
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      {backHref && <BackButton href={backHref} />}

      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        {icon}

        <Stack>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs }}>
            <WithSkeleton loading={titleLoading}>
              <Typography variant="headingSBold" sx={{ overflowWrap: 'anywhere' }}>
                {title ?? 'Page header' /** For skeleton width inference */}
              </Typography>
            </WithSkeleton>

            {titleItems}
          </Stack>

          {subtitle && (
            <WithSkeleton loading={subtitleLoading}>
              <Typography variant="bodyXsRegular" color="textSecondary">
                {subtitle ?? 'Page subtitle' /** For skeleton width inference */}
              </Typography>
            </WithSkeleton>
          )}
        </Stack>
      </Stack>
    </Stack>

    {rightItems}
  </Stack>
)
