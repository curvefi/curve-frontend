import type { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { noop } from '@tanstack/react-query'
import { t } from '@ui-kit/lib/i18n'
import { FormTabs } from '@ui-kit/shared/ui/FormTabs/FormTabs'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MinWidth } = SizesAndSpaces

const FormSkeleton = () => (
  <FormTabs<{}>
    params={{}}
    shouldWrap={false}
    menu={[
      {
        value: 'tab',
        label: <Skeleton width={100} />,
        component: () => (
          <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }} gap={Spacing.md} padding={Spacing.md}>
            <Skeleton>
              <LargeTokenInput name="loading" onBalance={noop} message={t`Loading`} />
            </Skeleton>
            <Button loading disabled fullWidth />
          </Stack>
        ),
      },
    ]}
  />
)

/**
 * A grid that separates the detail page into two main sections:
 * 1. action form (loan creation, loan management, vault view) (left side on larger screens)
 * 2. market and user position details (right side on larger screens)
 */
export const DetailPageLayout = ({ formTabs, children }: { formTabs: ReactNode; children: ReactNode }) => (
  <Grid
    container
    data-testid="detail-page-layout"
    spacing={Spacing.lg}
    sx={(t) => ({
      marginInline: Spacing.md,
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
      [t.breakpoints.up(MinWidth.twoCardLayout)]: { flexDirection: 'row' },
    })}
  >
    <Grid size={{ mobile: 12, tablet: 4, desktop: 3 }}>{formTabs || <FormSkeleton />}</Grid>
    <Grid size={{ mobile: 12, tablet: 8, desktop: 9 }}>
      <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
        {children}
      </Stack>
    </Grid>
  </Grid>
)
