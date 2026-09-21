import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import type { ChainId } from '@/loan/types/loan.types'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { evmAddressDisplay } from '@evm-ui/utils'
import { Card, CardContent, CardHeader } from '@mui/material'
import { t } from '@ui/lib/i18n'

export const AdvancedDetails = ({ chainId }: { chainId: ChainId }) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Advanced Details`} />
    <CardContent>
      <AddressActionInfo
        chainId={chainId}
        title={t`Vault Contract Address`}
        address={SCRVUSD_VAULT_ADDRESS}
        display={evmAddressDisplay}
      />
    </CardContent>
  </Card>
)
