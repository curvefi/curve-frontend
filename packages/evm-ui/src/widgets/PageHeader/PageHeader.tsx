import type { ReactNode } from 'react'
import { ArrowLeft } from '@evm-ui/shared/icons/ArrowLeft'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const { Spacing } = SizesAndSpaces

const BackButton = ({ href }: { href: string }) => (
  <IconButton size="small" component={RouterLink} href={href}>
    <ArrowLeft />
  </IconButton>
)

export const PageHeader = ({
  title,
  subtitle,
  titleLoading = false,
  subtitleLoading = false,
  disableUpperCase = false,
  icon,
  titleItems,
  rightItems,
  backHref,
}: {
  title: string
  subtitle?: string
  titleLoading?: boolean
  subtitleLoading?: boolean
  disableUpperCase?: boolean
  backHref?: string
  icon?: ReactNode
  titleItems?: ReactNode
  rightItems?: ReactNode
}) => (
  <Stack
    direction={{ mobile: 'column', desktop: 'row' }}
    sx={{ justifyContent: 'space-between', gap: Spacing.md, paddingBlock: Spacing.sm, flexWrap: 'wrap' }}
  >
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      {backHref && <BackButton href={backHref} />}

      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        {icon}

        <Stack>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs }}>
            <WithSkeleton loading={titleLoading}>
              {/* headingSBold uppercases text by default but some titles must preserve token symbol casing. */}
              <Typography
                variant="headingSBold"
                sx={{ overflowWrap: 'anywhere', ...(disableUpperCase && { textTransform: 'none' }) }}
              >
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
