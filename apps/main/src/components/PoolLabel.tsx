import React from 'react'
import styled from 'styled-components'

import { isStartPartOrEnd, parsedSearchTextToList } from '@/components/PagePoolList/utils'
import useStore from '@/store/useStore'
import usePoolAlert from '@/hooks/usePoolAlert'
import useTokenAlert from '@/hooks/useTokenAlert'

import { Chip } from '@/ui/Typography'
import AlertTooltipIcon from '@/ui/AlertTooltipIcon'
import Box from '@/ui/Box'
import ChipPool from '@/components/ChipPool'
import ChipToken from '@/components/ChipToken'
import TokenIcons from '@/components/TokenIcons'
import TableCellReferenceAsset from '@/components/PagePoolList/components/TableCellReferenceAsset'
import TableCellFactory from '@/components/PagePoolList/components/TableCellFactory'

const PoolLabel = ({
  className,
  imageBaseUrl,
  isVisible,
  poolData,
  poolListProps,
  tokensMapper,
}: {
  className?: string
  imageBaseUrl: string
  isVisible?: boolean
  poolData: PoolDataCache | PoolData | undefined
  poolListProps?: {
    quickViewValue?: string | React.ReactNode | null
    searchText?: string
    searchTextByTokensAndAddresses?: { [address: string]: boolean }
    searchTextByOther?: { [address: string]: boolean }
    onClick(target: EventTarget): void
  }
  tokensMapper: TokensMapper
}) => {
  const poolAlert = usePoolAlert(poolData?.pool.address, poolData?.hasVyperVulnerability)
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const isMobile = useStore((state) => state.isMobile)

  const { pool, tokens = [], tokenAddresses = [] } = poolData ?? {}
  const { searchText, searchTextByTokensAndAddresses, searchTextByOther, quickViewValue, onClick } = poolListProps ?? {}
  const parsedSearchText = searchText?.toLowerCase().trim()
  const isHighlightPoolAddress = pool && parsedSearchText ? pool.address.includes(parsedSearchText) : false
  const isHighlightPoolName =
    !!pool && !!parsedSearchText && !!searchTextByOther && pool.address in searchTextByOther
      ? pool.name.toLowerCase().includes(parsedSearchText)
      : false

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
      <Wrapper className={className} onClick={({ target }) => handleClick(target)}>
        <IconsWrapper>
          {isVisible && (
            <TokenIcons
              imageBaseUrl={imageBaseUrl}
              tokens={tokens}
              tokenAddresses={tokenAddresses}
              tokensMapper={tokensMapper}
            />
          )}
        </IconsWrapper>
        <div>
          <PoolTypeWrapper>
            <TableCellReferenceAsset
              isCrypto={poolData?.pool?.isCrypto}
              referenceAsset={poolData?.pool?.referenceAsset}
            />{' '}
            <TableCellFactory isFactory={poolData?.pool?.isFactory} />
          </PoolTypeWrapper>

          <Box flex flexAlignItems="center">
            {poolAlert && poolAlert.isInformationOnly ? (
              <AlertTooltipIcon placement="start" {...poolAlert}>
                {poolAlert.message}
              </AlertTooltipIcon>
            ) : tokenAlert ? (
              <AlertTooltipIcon minWidth="300px" placement="start" {...tokenAlert}>
                {tokenAlert.message}
              </AlertTooltipIcon>
            ) : null}
            {pool && (
              <ChipPool
                isHighlightPoolName={isHighlightPoolName}
                isHighlightPoolAddress={isHighlightPoolAddress}
                poolAddress={pool.address}
                poolName={pool.name}
              />
            )}
          </Box>

          <PoolLabelTokensWrapper>
            {pool && (
              <div>
                {isMobile
                  ? tokens.map((token, idx) => {
                      return <TokenLabel key={`${token}-${idx}`}>{token} </TokenLabel>
                    })
                  : isVisible &&
                    tokens.map((token, idx) => {
                      const tokenAddress = tokenAddresses[idx]
                      const parsedSearchTexts = parsedSearchText ? parsedSearchTextToList(parsedSearchText) : null

                      const isHighlight =
                        !!parsedSearchTexts &&
                        !!searchTextByTokensAndAddresses &&
                        pool.address in searchTextByTokensAndAddresses
                          ? parsedSearchTexts.some((st) => isStartPartOrEnd(st, token.toLowerCase())) ||
                            parsedSearchTexts.some((st) => isStartPartOrEnd(st, tokenAddress.toLowerCase()))
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
            )}
          </PoolLabelTokensWrapper>
          {quickViewValue && <Chip>{quickViewValue}</Chip>}
        </div>
      </Wrapper>
      {poolAlert && !poolAlert.isInformationOnly && <Box padding="0.5rem 0 0 0">{poolAlert.message}</Box>}
    </div>
  )
}

PoolLabel.defaultProps = {
  className: '',
  isVisible: true,
}

const PoolTypeWrapper = styled.div`
  margin-bottom: 0.125rem; // 2px;
`

const IconsWrapper = styled.div`
  min-width: 3.3125rem; // 53px
`

const Wrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  grid-column-gap: var(--spacing-2);
  width: 100%;
`

const PoolLabelTokensWrapper = styled.div`
  min-height: 1.5rem; // 24px;
`

const TokenLabel = styled.span`
  font-size: var(--font-size-2);
`

export default PoolLabel
