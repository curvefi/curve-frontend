import React, { useMemo } from 'react'
import styled from 'styled-components'

import useStore from '@/dex/store/useStore'
import usePoolAlert from '@/dex/hooks/usePoolAlert'
import useTokenAlert from '@/dex/hooks/useTokenAlert'

import { Chip } from '@ui/Typography'
import AlertBox from '@ui/AlertBox'
import AlertTooltipIcon from '@ui/Tooltip/TooltipAlert'
import Box from '@ui/Box'
import ChipPool from '@/dex/components/ChipPool'
import ChipToken from '@/dex/components/ChipToken'
import TokenIcons from '@/dex/components/TokenIcons'
import TableCellReferenceAsset from '@/dex/components/PagePoolList/components/TableCellReferenceAsset'

type PoolListProps = {
  quickViewValue?: string | React.ReactNode | null
  searchText?: string
  searchTextByTokensAndAddresses?: { [address: string]: boolean }
  searchTextByOther?: { [address: string]: boolean }
  onClick(target: EventTarget): void
}

type Props = {
  className?: string
  imageBaseUrl: string
  isVisible?: boolean
  poolData: PoolDataCache | PoolData | undefined
  poolListProps?: PoolListProps
}

const PoolLabel = ({ className = '', imageBaseUrl, isVisible = true, poolData, poolListProps }: Props) => {
  const { pool, tokens = [], tokenAddresses = [] } = poolData ?? {}

  const poolAlert = usePoolAlert(poolData?.pool.address, poolData?.hasVyperVulnerability)
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const isMobile = useStore((state) => state.isMobile)
  const searchedTerms = useStore((state) => state.poolList.searchedTerms)

  const { quickViewValue, onClick } = poolListProps ?? {}

  const handleClick = (target: EventTarget) => {
    if (typeof onClick === 'function') {
      const { nodeName } = target as HTMLElement
      if (nodeName !== 'A') {
        // prevent click-through link from tooltip
        onClick(target)
      }
    }
  }

  const { highlightedTokens, isHighlightPoolName } = useMemo(() => {
    if (isMobile || !isVisible) return { highlightedTokens: [], isHighlightPoolName: true }

    let foundSearchedToken = false

    const highlightedTokens = tokens.map((token, idx) => {
      const tokenAddress = tokenAddresses[idx]
      const isHighLight =
        searchedTerms.findIndex((searched) => {
          const parsedToken = token.toLowerCase()
          const parsedTokenAddress = tokenAddress.toLowerCase()
          const parsedSearch = searched.toLowerCase()
          return (
            parsedToken.includes(parsedSearch) ||
            parsedTokenAddress === parsedSearch ||
            parsedTokenAddress.startsWith(parsedSearch)
          )
        }) !== -1
      if (isHighLight) foundSearchedToken = true
      return { token, tokenAddress, isHighLight }
    })

    return { highlightedTokens, isHighlightPoolName: !foundSearchedToken }
  }, [isMobile, isVisible, searchedTerms, tokenAddresses, tokens])

  return (
    <div>
      <Wrapper className={className} onClick={({ target }) => handleClick(target)}>
        <IconsWrapper>
          {isVisible && <TokenIcons imageBaseUrl={imageBaseUrl} tokens={tokens} tokenAddresses={tokenAddresses} />}
        </IconsWrapper>
        <Box fillWidth>
          <TableCellReferenceAsset
            isCrypto={poolData?.pool?.isCrypto}
            referenceAsset={poolData?.pool?.referenceAsset}
          />

          <Box flex flexAlignItems="center">
            {!isMobile && (
              <>
                {(poolAlert?.isInformationOnly || poolAlert?.isInformationOnlyAndShowInForm) && (
                  <AlertTooltipIcon minWidth="300px" placement="start" {...poolAlert}>
                    {poolAlert.message}
                  </AlertTooltipIcon>
                )}
                {tokenAlert && (
                  <AlertTooltipIcon minWidth="300px" placement="start" {...tokenAlert}>
                    {tokenAlert.message}
                  </AlertTooltipIcon>
                )}
              </>
            )}
            {/* isHighlightPoolName = default to true now, even if searched text is not same result */}
            {pool && <ChipPool poolAddress={pool.address} poolName={pool.name} isHighlightPoolName />}
          </Box>

          <PoolLabelTokensWrapper>
            {pool && (
              <div>
                {isMobile
                  ? tokens.map((token, idx) => <TokenLabel key={`${token}-${idx}`}>{token} </TokenLabel>)
                  : isVisible &&
                    highlightedTokens.map(({ token, tokenAddress, isHighLight }, idx) => (
                      <ChipToken
                        key={`${token}${tokenAddress}${idx}`}
                        tokenName={token}
                        tokenAddress={tokenAddress}
                        isHighlight={isHighLight}
                      />
                    ))}
              </div>
            )}
          </PoolLabelTokensWrapper>
          {quickViewValue && <Chip>{quickViewValue}</Chip>}
        </Box>
      </Wrapper>

      {tokenAlert && isMobile && <StyledAlertBox alertType={tokenAlert.alertType}>{tokenAlert.message}</StyledAlertBox>}
      {poolAlert && (
        <>
          {!poolAlert.isInformationOnly && !poolAlert.isInformationOnlyAndShowInForm ? (
            <Box padding="0.5rem 0 0 0">{poolAlert.message}</Box>
          ) : isMobile ? (
            <StyledAlertBox alertType={poolAlert.alertType}>{poolAlert.message}</StyledAlertBox>
          ) : null}
        </>
      )}
    </div>
  )
}

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
  max-width: 24.375rem; // 390px
`

const TokenLabel = styled.span`
  font-size: var(--font-size-2);
`

const StyledAlertBox = styled(AlertBox)`
  font-size: var(--font-size-2);
  margin: var(--spacing-2) 0;
  max-height: 100px;
  overflow: scroll;
  max-width: 260px;
`

export default PoolLabel
