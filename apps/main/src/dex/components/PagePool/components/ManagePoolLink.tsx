import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { Chain } from '@curvefi/prices-api'
import { t } from '@evm-ui/lib/i18n'
import { getInternalUrl } from '@evm-ui/shared/routes'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Button from '@mui/material/Button'

const { Spacing } = SizesAndSpaces

/** Prices API tells us which pools methods are available, of which the following one is a requisite for refuels */
const hasRefuelMethod = (poolMethods?: string[]) => poolMethods?.includes('donation_shares')

export const ManagePoolLink = ({ chainId, poolAddress }: { chainId: number; poolAddress: string | undefined }) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: pricesApiPoolData } = usePoolPricesApi({ blockchainId: network?.networkId as Chain, poolAddress })

  return (
    poolAddress != null &&
    hasRefuelMethod(pricesApiPoolData?.poolMethods) && (
      <Button
        component={RouterLink}
        href={getInternalUrl('dex', network?.networkId, `${ROUTE.PAGE_POOLS}/${poolAddress}/manage-pool`)}
        variant="inline"
        color="ghost"
        sx={{ whiteSpace: 'nowrap', alignSelf: 'end', marginBlockEnd: Spacing.xs }}
      >
        {t`Manage pool`}
      </Button>
    )
  )
}
