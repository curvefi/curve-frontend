import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { t } from '@evm-ui/lib/i18n'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { Card, CardContent, CardHeader } from '@mui/material'

export const AdvancedDetails = ({ chainId }: { chainId: number }) => (
  <Card size="inline">
    <CardHeader title={t`Advanced Details`} />
    <CardContent>
      <AddressActionInfo chainId={chainId} title={t`Vault Contract Address`} address={SCRVUSD_VAULT_ADDRESS} />
    </CardContent>
  </Card>
)
