import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import type { BaseConfig } from '@legacy-ui/utils'
import { Card, CardContent, CardHeader } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'

export const AdvancedDetails = ({ network }: { network: BaseConfig | undefined }) => (
  <Card size="inline">
    <CardHeader title={t`Advanced Details`} />
    <CardContent>
      <AddressActionInfo network={network} title={t`Vault Contract Address`} address={SCRVUSD_VAULT_ADDRESS} />
    </CardContent>
  </Card>
)
