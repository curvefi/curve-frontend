import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

export const EmptyStateMarkets = ({
  table,
  title,
  subtitle,
  action,
}: {
  table: TanstackTable<any>
  title: string
  subtitle?: string
  action?: ReactNode
}) => (
  <EmptyStateRow table={table}>
    <Stack direction="row" justifyContent="center">
      {/* Needed to be centered in the row because of the max width */}
      <Stack direction="column" gap={Spacing.sm} alignItems="center" sx={{ maxWidth: '440px' }}>
        <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
        {/* Needed because no gap between the title and subtitle */}
        <Stack direction="column">
          <Typography component="span" variant="headingSBold">
            {title}
          </Typography>
          {subtitle && (
            <Typography component="span" variant="bodyMRegular" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {action}
      </Stack>
    </Stack>
  </EmptyStateRow>
)
