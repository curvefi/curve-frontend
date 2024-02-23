import { t } from '@lingui/macro'
import React from 'react'
import styled, { css } from 'styled-components'

import { handleClickCopy, shortenTokenName } from '@/utils/helpers'
import { breakpoints, FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Chip from '@/ui/Typography/Chip'
import DetailsSupplyRewardsCrv from '@/components/DetailsMarket/components/DetailsSupplyRewardsCrv'
import ExternalLink from '@/ui/Link/ExternalLink'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import Tooltip from '@/ui/Tooltip'

// TODO: refactor to UI
const DetailsSupplyRewards = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const rewardsResp = useStore((state) => state.markets.rewardsMapper[rChainId]?.[rOwmId])

  const { rewards } = rewardsResp ?? {}
  const { other, crv } = rewards ?? {}

  const haveCrv = typeof crv !== 'undefined' && +(crv?.[0] ?? '0') > 0
  const haveOther = typeof other !== 'undefined' && other.length > 0

  return (
    <RewardsWrapper>
      <Box flex fillWidth margin="var(--spacing-narrow) 0 0 0">
        <RewardsTitle>{t`Rewards tAPR`}</RewardsTitle>{' '}
        <Tooltip placement="bottom" tooltip={t`Token APR based on current prices of tokens and reward rates.`}>
          <Icon name="InformationSquare" size={16} />
        </Tooltip>
      </Box>

      {haveCrv && (
        <CrvEmissionWrapper>
          <Chip size="sm" isBold>{t`CRV Emission:`}</Chip>
          <DetailsSupplyRewardsCrv isBold rChainId={rChainId} rOwmId={rOwmId} />
        </CrvEmissionWrapper>
      )}

      {haveOther && (
        <Box>
          <Chip isBold>{t`Incentives:`}</Chip>
          {other?.map(({ apy, symbol, tokenAddress }) => {
            return (
              <StyledStyledStats key={symbol} flex flexJustifyContent="space-between" padding>
                <Box flex flexAlignItems="center">
                  <StyledExternalLink href={networks[rChainId].scanTokenPath(tokenAddress)}>
                    <TokenWrapper flex flexAlignItems="center" padding="var(--spacing-1) 0">
                      {shortenTokenName(symbol)} <Icon name="Launch" size={16} />
                    </TokenWrapper>
                  </StyledExternalLink>

                  <StyledIconButton size="small" onClick={() => handleClickCopy(tokenAddress)}>
                    <Icon name="Copy" size={16} />
                  </StyledIconButton>
                </Box>
                <Chip isBold isNumber size="md">
                  {formatNumber(apy, FORMAT_OPTIONS.PERCENT)}{' '}
                </Chip>
              </StyledStyledStats>
            )
          })}
        </Box>
      )}

      <BoostingLink $noStyles href="https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards">
        {t`Learn more about Boosting your CRV rewards`}
      </BoostingLink>
    </RewardsWrapper>
  )
}

const CrvEmissionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${breakpoints.sm}rem) {
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
  }
`

const actionStyles = css`
  align-items: center;
  display: inline-flex;

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  :hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`
export const StyledIconButton = styled(IconButton)`
  ${actionStyles}
`

export const StyledStats = styled(Box)<{
  isBorderBottom?: boolean
  padding?: boolean
}>`
  align-items: center;
  display: flex;
  padding: var(--spacing-1);

  font-weight: 500;

  ${({ padding }) => {
    if (padding) {
      return 'padding: 0.25rem 0;'
    }
  }}

  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return 'border-bottom: 1px solid var(--border-600);'
    }
  }}
`

const RewardsWrapper = styled.div`
  border: 1px solid var(--border-600);
  display: flex;
  flex-direction: column;
  grid-row-gap: var(--spacing-3);
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);
  margin-top: var(--spacing-normal);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-normal);
  }
`

const RewardsTitle = styled.h4`
  margin-bottom: var(--spacing-1);
`

export const TokenWrapper = styled(Box)`
  text-transform: initial;

  svg {
    padding-top: 0.3125rem;
  }
`

export const StyledStyledStats = styled(StyledStats)`
  padding: 0 var(--spacing-1);
`

export const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: underline;
`

const BoostingLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-transform: initial;
  font-size: var(--font-size-2);
`

export default DetailsSupplyRewards
