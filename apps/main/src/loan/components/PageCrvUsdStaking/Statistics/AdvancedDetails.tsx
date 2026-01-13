import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { networks } from '@/loan/networks'
import { Card, CardHeader, Stack } from '@mui/material'
import { scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain, shortenAddress } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const AdvancedDetails = () => (
  <Card>
    <CardHeader
      size="small"
      title={t`Advanced Details`}
      slotProps={{ title: { variant: 'small' }, root: { variant: 'small' } }}
    />
    <Stack direction="column" spacing={Spacing.md} sx={{ padding: Spacing.md }}>
      <ActionInfo
        label={t`Vault Contract Address`}
        value={shortenAddress(SCRVUSD_VAULT_ADDRESS)}
        link={scanAddressPath(networks[Chain.Ethereum], SCRVUSD_VAULT_ADDRESS)}
        copyValue={SCRVUSD_VAULT_ADDRESS}
        copiedTitle={t`Vault contract address copied!`}
      />
    </Stack>
  </Card>
)
