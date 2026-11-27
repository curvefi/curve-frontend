import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Skeleton } from '@ui/components/Skeleton'
import { FormContent } from '@ui/features/forms/components/FormContent'
import { BUTTON_FORM_SIZE } from '@ui/features/forms/constants'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import { t } from '@ui/lib/i18n'
import { FormTabs } from './FormTabs'

const PARAMS = {} as const

const menu = [
  {
    value: 'tab',
    label: (
      <Skeleton category="content.block">
        <Typography variant="buttonTabsM">{t`Loading`}</Typography>
      </Skeleton>
    ),
    component: () => (
      <FormContent>
        <LargeTokenInputSkeleton />
        <Button loading disabled fullWidth size={BUTTON_FORM_SIZE} />
      </FormContent>
    ),
  },
]

export const FormSkeleton = () => <FormTabs params={PARAMS} menu={menu} />
