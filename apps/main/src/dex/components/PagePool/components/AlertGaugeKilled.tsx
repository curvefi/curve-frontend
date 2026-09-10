import { AlertBox } from '@legacy-ui/AlertBox'
import { t } from '@ui/lib/i18n'

export const AlertGaugeKilled = () => <AlertBox alertType="warning">{t`This gauge is inactive.`}</AlertBox>
