import { useMemo } from 'react'
import { AlertType } from '@/dex/types/main.types'
import { AlertBox } from '@ui/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

const ALERT_FORM_WARNING_KEYS = {
  'warning-exchange-rate-low': 'warning-exchange-rate-low',
} as const

type AlertFormWarningKey = keyof typeof ALERT_FORM_WARNING_KEYS

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  errorKey: AlertFormWarningKey | string
}

export const AlertFormWarning = ({ errorKey, ...props }: Props) => {
  const errorMessage = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
    const messages: Record<AlertFormWarningKey | string, { message: string; alertType?: AlertType }> = {
      [ALERT_FORM_WARNING_KEYS['warning-exchange-rate-low']]: {
        message: t`Warning! Exchange rate is too low!`,
        alertType: 'error',
      },
    }

    if (errorKey) {
      return messages[errorKey] ?? { message: errorKey }
    } else {
      return null
    }
  }, [errorKey])

  return errorMessage ? (
    <AlertBox {...props} alertType={errorMessage.alertType ?? 'warning'}>
      {errorMessage.message}
    </AlertBox>
  ) : null
}
