import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { noop } from '@tanstack/react-query'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { FormContent } from './FormContent'
import { FormTabs } from './FormTabs'

export const FormSkeleton = () => (
  <FormTabs
    params={{}}
    menu={[
      {
        value: 'tab',
        label: <Skeleton width={100} />,
        component: () => (
          <FormContent>
            <Skeleton width="100%">
              <LargeTokenInput name="loading" onBalance={noop} message={t`Loading`} />
            </Skeleton>
            <Skeleton width="100%">
              <Typography variant="buttonM">{t`Loading form...`}</Typography>
            </Skeleton>
            <Button loading disabled fullWidth />
          </FormContent>
        ),
      },
    ]}
  />
)
