import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { Card, CardHeader } from '@mui/material'
import Stack from '@mui/material/Stack'
import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const AdvancedDetails = ({ network }: { network: BaseConfig | undefined }) => (
  <Card>
    <Stack gap={Spacing.sm}>
      <CardHeader
        size="small"
        data-inline
        title={t`Advanced Details`}
        slotProps={{ title: { variant: 'small' }, root: { variant: 'small' } }}
      />

      <AddressActionInfo network={network} title={t`Vault Contract Address`} address={SCRVUSD_VAULT_ADDRESS} />
    </Stack>
  </Card>
)
