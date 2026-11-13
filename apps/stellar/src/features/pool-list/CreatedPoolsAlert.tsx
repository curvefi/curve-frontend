import { asStellarContract, stellarAddressDisplay } from '@/stellar/features/connect-wallet/address'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { StellarPages } from '@/stellar/routes/routes'
import Alert from '@mui/material/Alert'
import type { Address } from '@primitives/address.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { t } from '@ui/lib/i18n'

export const CreatedPoolsAlert = ({ network, unlistedPools }: NetworkQuery & { unlistedPools: Address[] }) =>
  !!unlistedPools.length && (
    <Alert severity="info" data-testid="created-pools-alert">
      {t`Your recently created pools are not listed yet. You can open them directly:`}
      {unlistedPools.map(pool => (
        <RouterLink
          key={pool}
          href={StellarPages.pool({ network, pool: asStellarContract(pool) })}
          sx={{ display: 'block' }}
        >
          {stellarAddressDisplay.shortenAddress(pool)}
        </RouterLink>
      ))}
    </Alert>
  )
