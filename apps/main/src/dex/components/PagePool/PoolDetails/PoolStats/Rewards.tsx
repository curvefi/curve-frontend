import { styled } from 'styled-components'
import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { DescriptionChip, StyledIconButton, StyledStats } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import { ChipVolatileBaseApy } from '@/dex/components/PagePoolList/components/ChipVolatileBaseApy'
import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { LARGE_APY } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { ChainId, RewardsApy, PoolData } from '@/dex/types/main.types'
import { shortenTokenName } from '@/dex/utils'
import { haveRewardsApy } from '@/dex/utils/utilsCurvejs'
import type { Chain } from '@curvefi/prices-api'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link'
import { Spacer } from '@ui/Spacer'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber, scanTokenPath } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { copyToClipboard, type Address } from '@ui-kit/utils'

type RewardsProps = {
  chainId: ChainId
  poolData: PoolData
  rewardsApy: RewardsApy | undefined
}

export const Rewards = ({ chainId, poolData, rewardsApy }: RewardsProps) => {
  const { base, other } = rewardsApy ?? {}
  const { haveBase, haveOther, haveCrv } = haveRewardsApy(rewardsApy ?? {})
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network.networkId as Chain,
    address: poolData.pool.address as Address,
  })
  const { isLite } = network

  const baseAPYS = [
    { label: t`Daily`, value: base?.day ?? '' },
    { label: t`Weekly`, value: base?.week ?? '' },
  ]

  if ((isLite ? true : !haveBase) && !poolData?.failedFetching24hOldVprice && !haveCrv && !haveOther) return null

  return (
    <RewardsWrapper>
      {!isLite && (haveBase || poolData?.failedFetching24hOldVprice) && (
        <RewardsContainer>
          <Box flex fillWidth>
            <RewardsTitle>{t`Base vAPY`}</RewardsTitle>
            <Tooltip
              placement="bottom"
              tooltip={t`Base variable APY (vAPY) is the annualized yield from trading fees based on the activity over the past 24h. If a pool holds a yield bearing asset, the intrinsic yield is added.`}
            >
              <StyledInformationIcon name="InformationSquare" size={16} />
            </Tooltip>
            <StyledDescriptionChip>
              <ExternalLink $noStyles href="https://resources.curve.finance/pools/calculating-yield/#base-vapy">
                {t`Learn more`}
              </ExternalLink>
            </StyledDescriptionChip>
          </Box>

          <BaseApyItems as="ul">
            {baseAPYS.map(({ label, value }) => (
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
                ) : value === '' ? (
                  ''
                ) : +value > LARGE_APY ? (
                  <ChipVolatileBaseApy isBold showIcon />
                ) : (
                  <strong title={value}>{formatNumber(value, FORMAT_OPTIONS.PERCENT)}</strong>
                )}
              </BaseApyItem>
            ))}
          </BaseApyItems>
        </RewardsContainer>
      )}

      {(haveCrv || haveOther) && (
        <RewardsContainer>
          <Box flex fillWidth>
            <RewardsTitle>{t`Rewards tAPR`}</RewardsTitle>
            <Tooltip placement="bottom" tooltip={t`Token APR based on current prices of tokens and reward rates.`}>
              <StyledInformationIcon name="InformationSquare" size={16} />
            </Tooltip>
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
              other?.map(({ apy, symbol, tokenAddress }) => (
                <StyledStyledStats key={symbol} flex flexJustifyContent="space-between" padding>
                  <Box flex flexAlignItems="center">
                    <StyledExternalLink href={chainId ? scanTokenPath(network, tokenAddress) : ''}>
                      <TokenWrapper flex flexAlignItems="center" padding="var(--spacing-1) 0">
                        {shortenTokenName(symbol)} <Icon name="Launch" size={16} />
                      </TokenWrapper>
                    </StyledExternalLink>

                    <StyledIconButton size="small" onClick={() => copyToClipboard(tokenAddress)}>
                      <Icon name="Copy" size={16} />
                    </StyledIconButton>
                  </Box>
                  <Chip isBold isNumber size="md">
                    {formatNumber(apy, FORMAT_OPTIONS.PERCENT)}{' '}
                  </Chip>
                </StyledStyledStats>
              ))}
          </Box>
          {!isLite && (
            <BoostingLink>
              <ExternalLink $noStyles href="https://resources.curve.finance/reward-gauges/boosting-your-crv-rewards/">
                {t`Learn more about Boosting your CRV rewards`}
              </ExternalLink>
            </BoostingLink>
          )}
        </RewardsContainer>
      )}
      {campaigns.length > 0 && (
        <CampaignRewardsWrapper>
          <h4>{t`Additional external rewards`}</h4>
          <CampaignRewardsRow rewardItems={campaigns} />
        </CampaignRewardsWrapper>
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

const CampaignRewardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-2);
  @media (min-width: 37.5rem) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`
