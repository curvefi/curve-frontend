import type { CurrencyReservesProps } from '@/components/PagePool/PoolDetails/CurrencyReserves/types'

import styled from 'styled-components'

import { formatNumber, formatNumberUsdRate } from '@/ui/utils'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import { shortenTokenAddress } from '@/utils'

import { Chip } from '@/ui/Typography'
import { ExternalLink } from '@/ui/Link'
import { StyledStats, StyledIconButton } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import {
  ExternalLinkToken,
  TokenBalancePercent,
  TokenInfo,
} from '@/components/PagePool/PoolDetails/CurrencyReserves/styles'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import TokenIcon from '@/components/TokenIcon'

const CrDesktop = ({
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
    <StyledStats flex flexJustifyContent="space-between" isBorderBottom>
      <Box flex>
        <StyledExternalLink href={network.scanTokenPath(tokenAddress)}>
          <ExternalLinkTokenWrapper>
            <StyledTokenIcon
              size="sm"
              imageBaseUrl={getImageBaseUrl(rChainId)}
              token={token}
              address={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
            />
            <ExternalLinkToken>{token}</ExternalLinkToken>
          </ExternalLinkTokenWrapper>{' '}
          {haveSameTokenName ? <TokenInfo>{shortenTokenAddress(tokenAddress)}</TokenInfo> : null}
          <TokenInfo>{formatNumberUsdRate(cr?.usdRate)}</TokenInfo> <Icon name="Launch" size={16} />
        </StyledExternalLink>

        <StyledIconButton size="medium" onClick={() => handleCopyClick(tokenAddress)}>
          <Icon name="Copy" size={16} />
        </StyledIconButton>
      </Box>

      <TokenReserveBalanceWrapper>
        <Chip
          size="md"
          tooltip={cr?.balance}
          tooltipProps={{
            placement: 'bottom end',
            textAlign: 'left',
            noWrap: true,
          }}
        >
          {formatNumber(cr?.balance, { defaultValue: '-' })}{' '}
          <TokenBalancePercent>
            (
            {typeof cr?.percentShareInPool === 'undefined' || cr.percentShareInPool === 'NaN'
              ? '?%'
              : formatNumber(cr.percentShareInPool, {
                  style: 'percent',
                  ...(Number(cr.percentShareInPool) > 0 ? { minimumIntegerDigits: 2 } : {}),
                })}
            )
          </TokenBalancePercent>
        </Chip>
      </TokenReserveBalanceWrapper>
    </StyledStats>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ExternalLinkTokenWrapper = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

const TokenReserveBalanceWrapper = styled(Box)`
  text-align: right;
`

export default CrDesktop
