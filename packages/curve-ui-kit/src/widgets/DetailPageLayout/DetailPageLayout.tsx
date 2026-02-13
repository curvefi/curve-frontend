import type { ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormSkeleton } from './FormSkeleton'

const { Spacing, MaxWidth } = SizesAndSpaces

/**
 * A grid that separates the detail page into two main sections:
 * 1. action form (`FormTabs`) (left side on larger screens)
 * 2. market and user position details (right side on larger screens)
 */
export const DetailPageLayout = ({ formTabs, children }: { formTabs: ReactNode; children: ReactNode }) => (
  <Grid
    container
    data-testid="detail-page-layout"
    spacing={Spacing.lg}
    sx={{ marginInline: Spacing.md, marginBlockStart: Spacing.md, marginBlockEnd: Spacing.xxl }}
  >
    {/* In Figma, columns are 12/4/3, but too small around breakpoints. I've added one extra column.
        Ultrawide isn't a breakpoint yet, use maxWidth so it's not too large. */}
    <Grid size={{ mobile: 12, tablet: 5, desktop: 4 }} maxWidth={{ desktop: MaxWidth.actionCard }}>
      {formTabs || <FormSkeleton />}
    </Grid>
    <Grid size="grow">
      <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
        {children}
      </Stack>
    </Grid>
  </Grid>
)
