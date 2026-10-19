import { useConnection } from 'wagmi'
import { useLpTokenPool } from '@/llamalend/queries/lp-token-pool.query'
import type { Chain } from '@curvefi/prices-api'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import type { Token } from '@primitives/address.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { t } from '@ui/lib/i18n'

/**
 * Shown to connected users without collateral balance.
 * Links to the pool page when the collateral is a Curve LP token, otherwise to the swap page.
 */
export const BuyCollateralLink = ({
  chainId,
  blockchainId,
  token,
}: {
  chainId: number
  blockchainId: Chain
  token: Token | undefined
}) => {
  const { address: userAddress } = useConnection()
  const { data: balance } = useTokenBalance({ chainId, userAddress, tokenAddress: token?.address })
  const hasNoBalance = balance != null && +balance === 0
  const { data: poolAddress, isLoading } = useLpTokenPool({ blockchainId, tokenAddress: token?.address }, hasNoBalance)

  return (
    token &&
    hasNoBalance &&
    !isLoading && (
      <ExternalLink
        href={
          poolAddress
            ? getInternalUrl('dex', blockchainId, `${DEX_ROUTES.PAGE_POOLS}/${poolAddress}/deposit`)
            : `${getInternalUrl('dex', blockchainId, DEX_ROUTES.PAGE_SWAP)}?to=${token.address}`
        }
        label={t`Get ${token.symbol}`}
        data-testid="buy-collateral-link"
      />
    )
  )
}
