import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { Chain } from '@curvefi/prices-api'
import { getInternalUrl } from '@evm-ui/shared/routes'
import Button from '@mui/material/Button'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

/** Prices API tells us which pools methods are available, of which the following one is a requisite for refuels */
const hasRefuelMethod = (poolMethods?: string[]) => poolMethods?.includes('donation_shares')

export const ManagePoolLink = ({ chainId, poolAddress }: { chainId: number; poolAddress: string | undefined }) => {
  const { data: network } = useNetworkByChain({ chainId })
  const blockchainId = network?.blockchainId as Chain
  const { data: pricesApiPoolData } = usePoolPricesApi({ blockchainId, poolAddress })

  return (
    poolAddress != null &&
    hasRefuelMethod(pricesApiPoolData?.poolMethods) && (
      <Button
        component={RouterLink}
        href={getInternalUrl('dex', blockchainId, `${ROUTE.PAGE_POOLS}/${poolAddress}/manage-pool`)}
        variant="inline"
        color="ghost"
        sx={{ whiteSpace: 'nowrap', alignSelf: 'end', marginBlockEnd: Spacing.xs }}
      >
        {t`Manage pool`}
      </Button>
    )
  )
}
