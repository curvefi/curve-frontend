import type { CurrencyReservesProps } from '@/components/PagePool/PoolDetails/CurrencyReserves/types'

import styled from 'styled-components'

import { formatNumber, formatNumberUsdRate } from '@/ui/utils'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import { shortenTokenAddress } from '@/utils'

import { ExternalLink } from '@/ui/Link'
import { StyledIconButton } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import {
  ExternalLinkToken,
  TokenBalancePercent,
  TokenInfo,
} from '@/components/PagePool/PoolDetails/CurrencyReserves/styles'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import TokenIcon from '@/components/TokenIcon'

const CrMobile = ({
  cr,
  haveSameTokenName,
  network,
  rChainId,
  token,
  tokenAddress,
  tokensMapper,
  handleCopyClick,
}: CurrencyReservesProps) => {
  return (
    <TokenWrapper grid gridTemplateColumns="1fr auto auto" padding="0.75rem 0 var(--spacing-2) 0">
      <Box grid>
        <Box flex margin="var(--spacing-1) 0">
          <TokenIcon
            size="sm"
            imageBaseUrl={getImageBaseUrl(rChainId)}
            token={token}
            address={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
          />{' '}
          <StyledExternalLinkToken>{token}</StyledExternalLinkToken>
          {haveSameTokenName ? <TokenInfo> {shortenTokenAddress(tokenAddress)}</TokenInfo> : null}
          <TokenInfo> {formatNumberUsdRate(cr?.usdRate)}</TokenInfo>{' '}
        </Box>

        <div>
          {formatNumber(cr?.balance, { defaultValue: '-' })}{' '}
          <TokenBalancePercent>
            (
            {typeof cr?.percentShareInPool === 'undefined' || cr.percentShareInPool === 'NaN'
              ? '?%'
              : formatNumber(cr.percentShareInPool, { style: 'percent' })}
            )
          </TokenBalancePercent>
        </div>
      </Box>
      <TokenLink href={network.scanTokenPath(tokenAddress)}>
        <Icon name="Launch" size={16} />
      </TokenLink>
      <StyledIconButton size="medium" onClick={() => handleCopyClick(tokenAddress)}>
        <Icon name="Copy" size={16} />
      </StyledIconButton>
    </TokenWrapper>
  )
}

const TokenWrapper = styled(Box)`
  border-bottom: 1px solid var(--border-600);
`

const StyledExternalLinkToken = styled(ExternalLinkToken)`
  margin: auto 0 auto var(--spacing-1);
`

const TokenLink = styled(ExternalLink)`
  align-items: center;
  display: inline-flex;
  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;
  padding: var(--spacing-2);
`

export default CrMobile
