import React from 'react'
import styled from 'styled-components'

import networks from '@/networks'

import Chip from '@/ui/Typography/Chip'
import Box from '@/ui/Box'
import ChipMarket from '@/components/MarketLabel/components/ChipMarket'
import ChipTokens from '@/components/MarketLabel/components/ChipTokens'
import TokenIcons from '@/components/TokenIcons'

const MarketLabel = ({
  rChainId,
  className,
  isMobile,
  isVisible,
  owmDataCachedOrApi,
  tableListProps,
}: {
  rChainId: ChainId
  className?: string
  isMobile?: boolean
  isVisible?: boolean
  owmDataCachedOrApi: OWMDataCacheOrApi
  tableListProps?: {
    hideTokens?: boolean
    quickViewValue?: string | React.ReactNode | null
    searchText?: string
    searchTextByTokensAndAddresses?: { [address: string]: boolean }
    searchTextByOther?: { [address: string]: boolean }
    onClick(target: EventTarget): void
  }
}) => {
  const { id, addresses, borrowed_token, collateral_token } = owmDataCachedOrApi?.owm ?? {}
  const { hideTokens, searchText, searchTextByTokensAndAddresses, searchTextByOther, quickViewValue, onClick } =
    tableListProps ?? {}

  const parsedSearchText = searchText?.toLowerCase().trim()
  const isHighlightLabelAddress = parsedSearchText && id ? searchTextByOther?.[id] ?? false : false
  const isHighlightLabelName = parsedSearchText && id ? searchTextByOther?.[id] ?? false : false
  const tokens = collateral_token && borrowed_token ? [collateral_token.symbol, borrowed_token.symbol] : []
  const tokenAddresses = collateral_token && borrowed_token ? [collateral_token.address, borrowed_token.address] : []

  const handleClick = (target: EventTarget) => {
    if (typeof onClick === 'function') {
      const { nodeName } = target as HTMLElement
      if (nodeName !== 'A') {
        // prevent click-through link from tooltip
        onClick(target)
      }
    }
  }

  return (
    <div>
      <Wrapper className={className} isMobile={isMobile} onClick={({ target }) => handleClick(target)}>
        <IconsWrapper>
          {isVisible && (
            <TokenIcons
              imageBaseUrl={networks[rChainId].imageBaseUrl}
              tokens={tokens}
              tokenAddresses={tokenAddresses}
            />
          )}
        </IconsWrapper>
        <div>
          <Box flex flexAlignItems="center">
            <ChipMarket
              isMobile={isMobile}
              isHighlightLabelName={isHighlightLabelName}
              isHighlightLabelAddress={isHighlightLabelAddress}
              label={owmDataCachedOrApi?.displayName ?? ''}
              labelAddress={addresses?.amm ?? ''}
            />
          </Box>

          {!hideTokens && (
            <ChipTokens
              isMobile={isMobile}
              isVisible={isVisible}
              owmDataCachedOrApi={owmDataCachedOrApi}
              searchText={searchText}
              searchTextByTokensAndAddresses={searchTextByTokensAndAddresses}
            />
          )}
          {quickViewValue && <Chip>{quickViewValue}</Chip>}
        </div>
      </Wrapper>
    </div>
  )
}

const IconsWrapper = styled.div`
  min-width: 3.3125rem; // 53px
`

const Wrapper = styled.div<{ isMobile?: boolean }>`
  align-items: center;
  display: grid;
  height: 100%;
  grid-template-columns: auto 1fr;
`

export default MarketLabel
