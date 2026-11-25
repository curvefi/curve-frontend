import { useConnection } from 'wagmi'
import { useTokenMetadata } from '@/llamalend/queries/token-metadata.query'
import type { Chain } from '@curvefi/prices-api'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { dexPages } from '@evm-ui/shared/routes'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Token } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
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
  const { data: tokenMetadata, error } = useTokenMetadata({ blockchainId, tokenAddress: token?.address }, hasNoBalance)
  const poolAddress = tokenMetadata?.poolAddress

  return (
    token && (
      <Collapse in={hasNoBalance && (!!tokenMetadata || !!error)} unmountOnExit>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <ExternalLink
            href={
              poolAddress
                ? dexPages.pool({ blockchainId, poolAddress })
                : dexPages.swap({ blockchainId, to: token.address })
            }
            label={t`Get ${token.symbol}`}
            fullWidth
            data-testid="buy-collateral-link"
          />
          {error && <ErrorIconButton error={error} size="extraSmall" />}
        </Stack>
      </Collapse>
    )
  )
}
