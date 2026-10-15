import { useLpTokenPool } from '@/llamalend/queries/lp-token-pool.query'
import type { Chain } from '@curvefi/prices-api'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import type { Token } from '@primitives/address.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { t } from '@ui/lib/i18n'

/** Links to the pool page when the collateral is a Curve LP token, otherwise to the swap page */
export const BuyCollateralLink = ({ blockchainId, token }: { blockchainId: Chain; token: Token | undefined }) => {
  const { data: poolAddress, isLoading } = useLpTokenPool({ blockchainId, tokenAddress: token?.address })
  if (!token || isLoading) return null
  const href = poolAddress
    ? getInternalUrl('dex', blockchainId, `${DEX_ROUTES.PAGE_POOLS}/${poolAddress}/deposit`)
    : `${getInternalUrl('dex', blockchainId, DEX_ROUTES.PAGE_SWAP)}?to=${token.address}`
  return <ExternalLink href={href} label={t`Get ${token.symbol}`} />
}
