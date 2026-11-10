import { usePoolContext } from '@/dex/features/pool-context'
import { dexPages } from '@evm-ui/shared/routes'
import Button from '@mui/material/Button'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const ManagePoolLink = () => {
  const { blockchainId, poolAddress, apiPool } = usePoolContext()

  return (
    apiPool.data?.info.hasDonations && (
      <Button
        component={RouterLink}
        href={dexPages.poolManagement({ blockchainId, poolAddress })}
        variant="inline"
        color="ghost"
        sx={{ whiteSpace: 'nowrap', alignSelf: 'end', marginBlockEnd: Spacing.xs }}
      >
        {t`Manage pool`}
      </Button>
    )
  )
}
