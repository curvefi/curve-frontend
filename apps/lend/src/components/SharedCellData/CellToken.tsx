import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import Chip from '@/ui/Typography/Chip'
import TokenLabel from '@/components/TokenLabel'

const CellToken = ({
  hideIcon,
  rChainId,
  isVisible = true,
  owmDataCachedOrApi,
  showLeverageIcon,
  type,
  ...props
}: ChipProps & {
  hideIcon?: boolean
  rChainId: ChainId
  isVisible?: boolean
  owmDataCachedOrApi: OWMDataCacheOrApi
  showLeverageIcon?: boolean
  type: 'collateral' | 'borrowed'
}) => {
  const { collateral_token, borrowed_token } = owmDataCachedOrApi?.owm ?? {}

  const token = type === 'collateral' ? collateral_token : borrowed_token

  return hideIcon ? (
    <Chip {...props}>{token?.symbol}</Chip>
  ) : (
    <TokenLabel
      isDisplayOnly
      showLeverageIcon={showLeverageIcon}
      isVisible={isVisible}
      rChainId={rChainId}
      token={token}
    />
  )
}

export default CellToken
