import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { noop } from '@tanstack/react-query'
import { BUTTON_FORM_SIZE } from '@ui-kit/features/forms/constants'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { FormContent } from './FormContent'
import { FormTabs } from './FormTabs'

export const FormSkeleton = () => (
  <FormTabs
    params={{}}
    menu={[
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
              >
                <HelperMessage message={t`Loading`} />
              </LargeTokenInput>
            </Skeleton>
            <Button loading disabled fullWidth size={BUTTON_FORM_SIZE} />
          </FormContent>
        ),
      },
    ]}
  />
)
