import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { Card, CardContent, CardHeader } from '@mui/material'
import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'

export const AdvancedDetails = ({ network }: { network: BaseConfig | undefined }) => (
  <Card size="small">
    <CardHeader
      data-inline
      title={t`Advanced Details`}
      slotProps={{ title: { variant: 'small' }, root: { variant: 'small' } }}
    />

    <CardContent sx={{ paddingInline: '0 !important' }} /** no data-inline support yet like in header */>
      <AddressActionInfo network={network} title={t`Vault Contract Address`} address={SCRVUSD_VAULT_ADDRESS} />
    </CardContent>
  </Card>
)
