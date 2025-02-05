import { Card, CardHeader, Stack } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { t } from '@lingui/macro'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SCRVUSD_VAULT_ADDRESS } from './constants'
import networks from '@/loan/networks'

const { Spacing } = SizesAndSpaces

const ethereumChainId = 1

const AdvancedDetails = () => (
  <Card sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }} elevation={0}>
    <CardHeader
      size="small"
      title={t`Advanced Details`}
      slotProps={{ title: { variant: 'small' }, root: { variant: 'small' } }}
    />
    <Stack direction="column" spacing={Spacing.md} sx={{ padding: Spacing.md }}>
      <ActionInfo
        label={t`Vault Contract Address`}
        address={SCRVUSD_VAULT_ADDRESS}
        linkAddress={networks[ethereumChainId].scanAddressPath(SCRVUSD_VAULT_ADDRESS)}
        copiedText={t`Vault Contract Address Copied!`}
      />
    </Stack>
  </Card>
)

export default AdvancedDetails
