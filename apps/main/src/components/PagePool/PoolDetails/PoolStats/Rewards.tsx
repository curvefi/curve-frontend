import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import { copyToClipboard } from '@/lib/utils'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { haveRewardsApy } from '@/utils/utilsCurvejs'
import { shortenTokenName } from '@/utils'
import networks from '@/networks'

import { LARGE_APY } from '@/constants'
import { Chip } from '@/ui/Typography'
import { DescriptionChip, StyledIconButton, StyledStats } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import Tooltip from '@/ui/Tooltip'
import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import Spacer from '@/ui/Spacer'

type Props = {
  chainId: ChainId
  poolData: PoolData
  rewardsApy: RewardsApy | undefined
}

const Rewards = ({ chainId, poolData, rewardsApy }: Props) => {
  const { base, other } = rewardsApy ?? {}
  const { haveBase, haveOther, haveCrv } = haveRewardsApy(rewardsApy ?? {})

  const baseAPYS = [
    { label: t`Daily`, value: base?.day ?? '' },
    { label: t`Weekly`, value: base?.week ?? '' },
  ]

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  if (!haveBase && !poolData?.failedFetching24hOldVprice && !haveCrv && !haveOther) return null

  return (
    <RewardsWrapper>
      {(haveBase || poolData?.failedFetching24hOldVprice) && (
        <RewardsContainer>
          <Box flex fillWidth>
            <RewardsTitle>{t`Base vAPY`}</RewardsTitle>
            <StyledTooltip placement="bottom" tooltip={t`Variable APY based on today's trading activity.`}>
              <StyledInformationIcon name="InformationSquare" size={16} />
            </StyledTooltip>
            <StyledDescriptionChip>
              <ExternalLink $noStyles href="https://resources.curve.fi/lp/understanding-curve-pools/#base-vapy">
                {t`Learn more`}
              </ExternalLink>
            </StyledDescriptionChip>
          </Box>

          <BaseApyItems as="ul">
            {baseAPYS.map(({ label, value }) => {
              let apyFormatted
              if (+value > LARGE_APY) {
                apyFormatted = `${formatNumber(LARGE_APY)}+%`
              } else {
                apyFormatted = formatNumber(value, FORMAT_OPTIONS.PERCENT)
              }

              return (
                <BaseApyItem
                  as="li"
                  key={label}
                  grid
                  gridRowGap={2}
                  padding="var(--spacing-1) var(--spacing-1) var(--spacing-2)"
                >
                  <Chip size="md">{label}</Chip>
                  {poolData?.failedFetching24hOldVprice ? (
                    <span>
                      -<IconTooltip>Not available currently</IconTooltip>
                    </span>
                  ) : (
                    <strong title={value}>{apyFormatted}</strong>
                  )}
                </BaseApyItem>
              )
            })}
          </BaseApyItems>
        </RewardsContainer>
      )}

      {(haveCrv || haveOther) && (
        <RewardsContainer>
          <Box flex fillWidth>
            <RewardsTitle>{t`Rewards tAPR`}</RewardsTitle>
            <StyledTooltip
              placement="bottom"
              tooltip={t`Token APR based on current prices of tokens and reward rates.`}
            >
              <StyledInformationIcon name="InformationSquare" size={16} />
            </StyledTooltip>
          </Box>

          <Box margin="var(--spacing-2) 0 0 0">
            {haveCrv && (
              <StyledStyledStats>
                CRV
                <Spacer />
                {poolData && <PoolRewardsCrv isHighlight poolData={poolData} rewardsApy={rewardsApy} />}
              </StyledStyledStats>
            )}

            {haveOther &&
              other?.map(({ apy, symbol, tokenAddress }) => {
                return (
                  <StyledStyledStats key={symbol} flex flexJustifyContent="space-between" padding>
                    <Box flex flexAlignItems="center">
                      <StyledExternalLink href={chainId ? networks[chainId].scanTokenPath(tokenAddress) : ''}>
                        <TokenWrapper flex flexAlignItems="center" padding="var(--spacing-1) 0">
                          {shortenTokenName(symbol)} <Icon name="Launch" size={16} />
                        </TokenWrapper>
                      </StyledExternalLink>

                      <StyledIconButton size="small" onClick={() => handleCopyClick(tokenAddress)}>
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
          <BoostingLink>
            <ExternalLink $noStyles href="https://resources.curve.fi/reward-gauges/boosting-your-crv-rewards/">
              {t`Learn more about Boosting your CRV rewards`}
            </ExternalLink>
          </BoostingLink>
        </RewardsContainer>
      )}
    </RewardsWrapper>
  )
}

const RewardsWrapper = styled.div`
  border: 1px solid var(--border-600);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  grid-row-gap: var(--spacing-3);
`

const RewardsTitle = styled.h4`
  margin-bottom: var(--spacing-1);
`

const RewardsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-content: center;
`

const TokenWrapper = styled(Box)`
  text-transform: initial;

  svg {
    padding-top: 0.3125rem;
  }
`

const StyledTooltip = styled(Tooltip)``

const StyledStyledStats = styled(StyledStats)`
  padding: var(--spacing-1);
`

const StyledInformationIcon = styled(Icon)`
  margin: auto auto auto var(--spacing-1);
`

const StyledDescriptionChip = styled(DescriptionChip)`
  margin-left: auto;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: underline;
`

const BoostingLink = styled(DescriptionChip)`
  margin: var(--spacing-3) var(--spacing-1) var(--spacing-2);
  font-weight: 500;
`

const BaseApyItem = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const BaseApyItems = styled(Box)`
  margin-top: var(--spacing-2);
  display: flex;
  flex-direction: column;
`

export default Rewards
