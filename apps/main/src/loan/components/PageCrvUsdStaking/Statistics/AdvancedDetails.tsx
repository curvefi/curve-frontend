import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { ETHEREUM_CHAIN_ID } from '@/loan/constants'
import networks from '@/loan/networks'
import { Card, CardHeader, Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const AdvancedDetails = () => (
  <Card sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, boxShadow: 'none' }}>
    <CardHeader
      size="small"
      title={t`Advanced Details`}
      slotProps={{ title: { variant: 'small' }, root: { variant: 'small' } }}
    />
    <Stack direction="column" spacing={Spacing.md} sx={{ padding: Spacing.md }}>
      <ActionInfo
        label={t`Vault Contract Address`}
        value={shortenAddress(SCRVUSD_VAULT_ADDRESS)}
        link={networks[ETHEREUM_CHAIN_ID].scanAddressPath(SCRVUSD_VAULT_ADDRESS)}
        copy
        copiedTitle={t`Vault contract address copied!`}
      />
    </Stack>
  </Card>
)

export default AdvancedDetails
