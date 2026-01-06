import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { noop } from '@tanstack/react-query'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormTabs } from './FormTabs'

const { Spacing } = SizesAndSpaces

export const FormSkeleton = () => (
  <FormTabs
    params={{}}
    menu={[
      {
        value: 'tab',
        label: <Skeleton width={100} />,
        component: () => (
          <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }} gap={Spacing.md} padding={Spacing.md}>
            <Skeleton width="100%">
              <LargeTokenInput name="loading" onBalance={noop} message={t`Loading`} />
            </Skeleton>
            <Skeleton width="100%">
              <Typography variant="buttonM">{t`Loading form...`}</Typography>
            </Skeleton>
            <Button loading disabled fullWidth />
          </Stack>
        ),
      },
    ]}
  />
)
