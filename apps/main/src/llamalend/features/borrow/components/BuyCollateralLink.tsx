import { useConnection } from 'wagmi'
import { useLpTokenPool } from '@/llamalend/queries/lp-token-pool.query'
import type { Chain } from '@curvefi/prices-api'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { DEX_ROUTES } from '@evm-ui/shared/routes'
import Collapse from '@mui/material/Collapse'
import type { Token } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
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
  // loading is intentionally not shown: a skeleton would disappear for users holding collateral.
  // TODO: Errors should be shown in the status bar
  const { data: balance } = useTokenBalance({ chainId, userAddress, tokenAddress: token?.address })
  const hasNoBalance = maybe(balance, Number) === 0
  const { data: poolAddress } = useLpTokenPool({ blockchainId, tokenAddress: token?.address }, hasNoBalance)

  return (
    token && (
      <Collapse in={hasNoBalance && poolAddress !== undefined} unmountOnExit>
        <ExternalLink
          href={
            poolAddress
              ? DEX_ROUTES.PAGE_POOL({ app: 'dex', blockchainId, poolAddress })
              : DEX_ROUTES.PAGE_SWAP({ app: 'dex', blockchainId, to: token.address })
          }
          label={t`Get ${token.symbol}`}
          fullWidth
          data-testid="buy-collateral-link"
        />
      </Collapse>
    )
  )
}
