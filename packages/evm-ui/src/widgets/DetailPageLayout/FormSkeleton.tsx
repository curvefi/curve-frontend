import { LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { noop } from '@tanstack/react-query'
import { BUTTON_FORM_SIZE } from '@ui/features/forms/constants'
import { t } from '@ui/lib/i18n'
import { FormContent } from './FormContent'
import { FormTabs } from './FormTabs'

const PARAMS = {} as const

const menu = [
  {
    value: 'tab',
    label: (
      <Skeleton variant="rectangular" width={100}>
        <Typography variant="buttonTabsM">{t`Loading`}</Typography>
      </Skeleton>
    ),
    component: () => (
      <FormContent>
        <Skeleton variant="rectangular" width="100%">
          <LargeTokenInput
            name="loading"
            onBalance={noop}
            label={t`Loading`}
            tokenSelector={<Typography variant="bodyMBold">{t`Token`}</Typography>}
            walletBalance={{ balance: '0', symbol: t`Token` }}
            inputBalanceUsd="0"
          />
        </Skeleton>
        <Button loading disabled fullWidth size={BUTTON_FORM_SIZE} />
      </FormContent>
    ),
  },
]

export const FormSkeleton = () => <FormTabs params={PARAMS} menu={menu} />
