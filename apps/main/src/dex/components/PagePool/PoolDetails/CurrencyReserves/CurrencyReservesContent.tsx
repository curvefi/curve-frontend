import styled from 'styled-components'
import type { CurrencyReservesProps } from '@/dex/components/PagePool/PoolDetails/CurrencyReserves/types'
import { StyledStats } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import ExternalLink from '@ui/Link/ExternalLink'
import TextEllipsis from '@ui/TextEllipsis'
import TooltipButton from '@ui/Tooltip'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import Chip from '@ui/Typography/Chip'
import { breakpoints, formatNumber, formatNumberUsdRate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { shortenAddress } from '@ui-kit/utils'

const CurrencyReservesContent = ({
  cr,
  haveSameTokenName,
  network,
  token,
  tokenAddress,
  tokenLink,
  tokensMapper,
  handleCopyClick,
}: CurrencyReservesProps) => (
  <Wrapper flex flexJustifyContent="space-between" isBorderBottom>
    <Box flex flexAlignItems="center" gridGap={1}>
      <TokenIcon
        size="sm"
        blockchainId={network?.networkId ?? ''}
        tooltip={token}
        address={tokensMapper[tokenAddress]?.ethAddress || tokenAddress}
      />

      <Box grid gridGap={1}>
        <TokenLabelLink $noStyles href={network.scanTokenPath(tokenAddress)}>
          <ExternalLinkToken>{token}</ExternalLinkToken>{' '}
          {haveSameTokenName ? (
            <Chip opacity={0.7} size="xs">
              {shortenAddress(tokenAddress)}
            </Chip>
          ) : null}
        </TokenLabelLink>

        <Box flex flexAlignItems="center" gridGap={2}>
          <Chip opacity={0.7}>{formatNumberUsdRate(cr?.usdRate)}</Chip>
          <TooltipButton onClick={() => handleCopyClick(tokenAddress)} noWrap tooltip={t`Copy address`}>
            <Icon name="Copy" size={16} />
          </TooltipButton>

          {tokenLink && (
            <TokenLink $noStyles href={tokenLink}>
              <IconTooltip noWrap customIcon={<Icon name="StoragePool" size={16} />}>{t`Visit pool`}</IconTooltip>
            </TokenLink>
          )}
        </Box>
      </Box>
    </Box>

    <Box className={'right'} flex flexDirection="column">
      <Chip size="md" isBold>
        {formatNumber(cr?.balance, { defaultValue: '-' })}{' '}
      </Chip>
      <TokenBalancePercent opacity={0.7}>
        {typeof cr?.percentShareInPool === 'undefined' || cr.percentShareInPool === 'NaN'
          ? '?%'
          : formatNumber(cr.percentShareInPool, {
              style: 'percent',
              ...(Number(cr.percentShareInPool) > 0 ? { minimumIntegerDigits: 2 } : {}),
            })}
      </TokenBalancePercent>
    </Box>
  </Wrapper>
)

const Wrapper = styled(StyledStats)`
  padding-top: var(--spacing-2);
`

const TokenLabelLink = styled(ExternalLink)`
  align-items: baseline;
  color: inherit;
  display: inline-flex;
  grid-gap: var(--spacing-1);
  text-decoration: none;
`

export const TokenBalancePercent = styled(Chip)`
  align-items: center;
  display: inline-flex;
  justify-content: right;
  min-height: var(--height-small);
  min-width: 3.75rem; //60px

  @media (min-width: ${breakpoints.sm}rem) {
    min-height: 24px;
  }
`

export const ExternalLinkToken = styled(TextEllipsis)`
  font-weight: bold;
  text-transform: initial;
`

export const TokenLink = styled(ExternalLink)`
  color: inherit;
`

export default CurrencyReservesContent
