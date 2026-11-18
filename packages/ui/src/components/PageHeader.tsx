import type { ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RouterLink } from '@ui/components/RouterLink'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowLeft } from '@ui/icons/ArrowLeft'

const { Spacing } = SizesAndSpaces

const BackButton = ({ href }: { href: string }) => (
  <IconButton size="small" component={RouterLink} href={href}>
    <ArrowLeft />
  </IconButton>
)

export const PageHeader = ({
  title: { data: title, isLoading: titleLoading },
  subtitle: subtitle,
  disableUpperCase = false,
  icon,
  titleItems,
  rightItems,
  backHref,
}: {
  title: QueryProp<string>
  subtitle?: QueryProp<string>
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
                {...(!titleLoading && { 'data-testid': 'page-header-title' })}
                sx={{ overflowWrap: 'anywhere', ...(disableUpperCase && { textTransform: 'none' }) }}
              >
                {title ?? 'Page header' /** For skeleton width inference */}
              </Typography>
            </WithSkeleton>

            {titleItems}
          </Stack>

          {subtitle && (
            <WithSkeleton loading={subtitle.isLoading}>
              <Typography variant="bodyXsRegular" color="textSecondary">
                {subtitle.data ?? 'Page subtitle' /** For skeleton width inference */}
              </Typography>
            </WithSkeleton>
          )}
        </Stack>
      </Stack>
    </Stack>

    {rightItems}
  </Stack>
)
