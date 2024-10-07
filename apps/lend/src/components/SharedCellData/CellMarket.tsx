import React from 'react'
import MarketLabel from '@/components/MarketLabel'

const CellMarket = ({
  rChainId,
  isVisible,
  owmDataCachedOrApi,
}: {
  rChainId: ChainId
  isVisible: boolean
  owmDataCachedOrApi: OWMDataCacheOrApi
}) => {
  return (
    <MarketLabel
      rChainId={rChainId}
      isVisible={isVisible}
      isMobile={true}
      owmDataCachedOrApi={owmDataCachedOrApi}
      tableListProps={{
        hideTokens: true,
        onClick: () => {},
      }}
    />
  )
}

export default CellMarket
