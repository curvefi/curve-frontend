import { useMemo, useState } from 'react'
import { canRepayFromStateCollateral, canRepayFromUserCollateral, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import type { TokenOption } from '@ui-kit/features/select-token'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'

const formatLabel = (address: string, networkName: string) => `${networkName} ${shortenAddress(address)}`

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userCollateral' | 'userBorrowed' }

/**
 * Get token options for repayment based on market and network
 */
const getRepayTokenOptions = ({
  market,
  networkId,
  networkName,
}: {
  market: LlamaMarketTemplate | undefined
  networkId: string
  networkName: string
}) => {
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  return notFalsy<RepayTokenOption>(
    borrowToken && {
      address: borrowToken.address,
      chain: networkId,
      symbol: borrowToken.symbol,
      label: formatLabel(borrowToken.address, networkName),
      field: 'userBorrowed',
    },
    market &&
      collateralToken &&
      canRepayFromStateCollateral(market) && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        name: `${notFalsy(collateralToken.symbol, borrowToken?.symbol).join(' • ')} ${t`position`}`,
        label: shortenAddress(collateralToken.address),
        field: 'stateCollateral',
      },
    market &&
      collateralToken &&
      canRepayFromUserCollateral(market) && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        label: formatLabel(collateralToken.address, networkName),
        field: 'userCollateral',
      },
  )
}

/**
 * Hook that returns repay token options, containing the logic to select between different repayment sources
 */
export const useRepayTokens = <ChainId extends LlamaChainId, NetworkId extends LlamaNetworkId = LlamaNetworkId>({
  market,
  network: { name: networkName, id: networkId },
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: NetworkId; chainId: ChainId; name: string }
}) => {
  const [token, onToken] = useState<RepayTokenOption | undefined>()
  const tokens = useMemo(
    () => getRepayTokenOptions({ market, networkId, networkName }),
    [market, networkId, networkName],
  )
  return { tokens, token: token ?? tokens[0], onToken }
}
