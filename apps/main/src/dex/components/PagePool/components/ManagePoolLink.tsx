import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { UrlParams } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import Button from '@mui/material/Button'
import { Link as TanstackLink } from '@tanstack/react-router'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const getRefuelPath = (network: UrlParams['network'], poolAddress: string) =>
  getInternalUrl('dex', network, `${ROUTE.PAGE_POOLS}/${poolAddress}/refuel`)

/** Prices API tells us which pools methods are available, of which the following one is a requisite for refuels */
const hasRefuelMethod = (poolMethods?: string[]) => poolMethods?.includes('donation_shares')

export const ManagePoolLink = ({ chainId, poolAddress }: { chainId: number; poolAddress: string | undefined }) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: pricesApiPoolsMapper } = usePoolsPricesApi({ blockchainId: network?.networkId as Chain })
  const pricesApiPoolData = poolAddress ? pricesApiPoolsMapper?.[poolAddress] : undefined

  return (
    poolAddress != null &&
    hasRefuelMethod(pricesApiPoolData?.poolMethods) && (
      <Button
        component={TanstackLink}
        to={getRefuelPath(network?.networkId, poolAddress)}
        variant="inline"
        color="ghost"
        sx={{ whiteSpace: 'nowrap', alignSelf: 'end', marginBlockEnd: Spacing.xs }}
      >
        {t`Manage pool`}
      </Button>
    )
  )
}
