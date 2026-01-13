import { partition } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { RepayTokenOption } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import { TokenSection } from '@ui-kit/features/select-token/ui/modal/TokenSection'
import { useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Decimal } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export function RepayTokenList<ChainId extends IChainId>({
  market,
  network,
  onToken,
  tokens,
  positionCollateral,
}: {
  market: LlamaMarketTemplate | undefined
  network: NetworkDict<ChainId>[ChainId]
  onToken: (token: RepayTokenOption) => void
  tokens: RepayTokenOption[]
  positionCollateral: Decimal | undefined
}) {
  const { address: userAddress } = useConnection()
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const tokenAddresses = useMemo(
    () => notFalsy(collateralToken?.address, borrowToken?.address),
    [collateralToken?.address, borrowToken?.address],
  )
  const { data: balances } = useTokenBalances({ chainId: network.chainId, userAddress, tokenAddresses })
  const { data: tokenPrices } = useTokenUsdRates({ chainId: network.chainId, tokenAddresses })

  const [[stateCollateralToken], walletTokens] = useMemo(
    () => partition(tokens, (token) => token.field === 'stateCollateral'),
    [tokens],
  )

  return (
    <Stack gap={Spacing.sm} sx={{ overflowY: 'auto', height: '100%' }}>
      {tokens.length ? (
        <>
          <TokenSection
            title={t`In wallet`}
            tokens={walletTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            onToken={onToken}
          />

          <TokenSection
            title={t`Llamalend`}
            tokens={[stateCollateralToken]}
            balances={{ ...(stateCollateralToken && { [stateCollateralToken.address]: positionCollateral }) }}
            tokenPrices={tokenPrices}
            onToken={onToken}
          />
        </>
      ) : (
        <Alert variant="filled" severity="info">
          <AlertTitle>{t`No tokens found`}</AlertTitle>
        </Alert>
      )}
    </Stack>
  )
}
