import React from 'react'
import styled from 'styled-components'

import ChipToken from '@/components/MarketLabel/components/ChipToken'
import { _isStartPartOrEnd, _parseSearchTextToList } from '@/components/PageMarketList/utils'


const ChipTokens = ({
  isMobile,
  isVisible,
  owmDataCachedOrApi,
  searchText,
  searchTextByTokensAndAddresses,
}: {
  isMobile?: boolean
  isVisible?: boolean
  owmDataCachedOrApi: OWMDataCacheOrApi
  searchText?: string
  searchTextByTokensAndAddresses?: { [address: string]: boolean }
}) => {
  const { addresses, borrowed_token, collateral_token } = owmDataCachedOrApi?.owm ?? {}

  const parsedSearchText = searchText?.toLowerCase().trim()
  const tokens = borrowed_token && collateral_token ? [collateral_token.symbol, borrowed_token.symbol] : []
  const tokenAddresses = borrowed_token && collateral_token ? [collateral_token.address, borrowed_token.address] : []

  return (
    <Wrapper>
      <div>
        {isMobile
          ? tokens.map((token, idx) => {
              return <TokenLabel key={`${token}-${idx}`}>{token} </TokenLabel>
            })
          : isVisible &&
            tokens.map((token, idx) => {
              const tokenAddress = tokenAddresses[idx]
              const parsedSearchTexts = parsedSearchText ? _parseSearchTextToList(parsedSearchText) : null

              const isHighlight =
                !!parsedSearchTexts &&
                !!searchTextByTokensAndAddresses &&
                addresses &&
                addresses.amm in searchTextByTokensAndAddresses
                  ? parsedSearchTexts.some((st) => _isStartPartOrEnd(st, token.toLowerCase())) ||
                    parsedSearchTexts.some((st) => _isStartPartOrEnd(st, tokenAddress.toLowerCase()))
                  : false

              return (
                <ChipToken
                  key={`${token}-${tokenAddress}-${idx}`}
                  isHighlight={isHighlight}
                  tokenName={token}
                  tokenAddress={tokenAddress}
                />
              )
            })}
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  min-height: 1.5rem; // 24px;
  text-align: left;
`

const TokenLabel = styled.span`
  font-size: var(--font-size-2);
`

export default ChipTokens
