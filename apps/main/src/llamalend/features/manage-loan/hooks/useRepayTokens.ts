import { useMemo, useState } from 'react'
import { getAddress, type Address } from 'viem'
import { canRepayFromStateCollateral, canRepayFromUserCollateral, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import type { TokenOption } from '@ui-kit/features/select-token'
import { shortenAddress } from '@ui-kit/utils'

const getMarketAddress = (market: LlamaMarketTemplate): Address =>
  getAddress('addresses' in market ? market.addresses.controller : market.controller)

const formatLabel = (address: string, networkName: string) => `${networkName} ${shortenAddress(address)}`

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userCollateral' | 'userBorrowed' }

function getTokenOptions({
  market,
  networkId,
  networkName,
}: {
  market: LlamaMarketTemplate | undefined
  networkId: string
  networkName: string
}) {
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  return notFalsy<RepayTokenOption>(
    market &&
      collateralToken &&
      canRepayFromStateCollateral(market) && {
        address: getMarketAddress(market), // we use the market address for state collateral to avoid duplicates in the token list
        chain: networkId,
        symbol: collateralToken.symbol,
        label: formatLabel(collateralToken.address, networkName),
        field: 'stateCollateral',
      },
    borrowToken && {
      address: borrowToken.address,
      chain: networkId,
      symbol: borrowToken.symbol,
      label: formatLabel(borrowToken.address, networkName),
      field: 'userBorrowed',
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

export const useRepayTokens = <ChainId extends LlamaChainId, NetworkId extends LlamaNetworkId = LlamaNetworkId>({
  market,
  network: { name: networkName, id: networkId },
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; name: string }
}) => {
  const [selected, onSelect] = useState<RepayTokenOption | undefined>()
  const options = useMemo(() => getTokenOptions({ market, networkId, networkName }), [market, networkId, networkName])
  return {
    options,
    selected: selected ?? options[0],
    onSelect,
  }
}
