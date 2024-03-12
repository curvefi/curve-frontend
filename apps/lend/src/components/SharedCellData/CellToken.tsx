import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import Chip from '@/ui/Typography/Chip'
import TokenLabel from '@/components/TokenLabel'

const CellToken = ({
  hideIcon,
  rChainId,
  owmDataCachedOrApi,
  type,
  ...props
}: ChipProps & {
  hideIcon?: boolean
  rChainId: ChainId
  owmDataCachedOrApi: OWMDataCacheOrApi
  type: 'collateral' | 'borrowed'
}) => {
  const { collateral_token, borrowed_token } = owmDataCachedOrApi?.owm ?? {}

  const token = type === 'collateral' ? collateral_token : borrowed_token

  return hideIcon ? (
    <Chip {...props}>{token?.symbol}</Chip>
  ) : (
    <TokenLabel isDisplayOnly rChainId={rChainId} token={token} />
  )
}

export default CellToken
