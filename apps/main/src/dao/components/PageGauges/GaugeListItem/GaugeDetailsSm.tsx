import { styled } from 'styled-components'
import { ETHEREUM_CHAIN_ID } from '@/dao/constants'
import { networks } from '@/dao/networks'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { getChainIdFromGaugeData } from '@/dao/utils'
import { Box } from '@ui/Box'
import { ExternalLink } from '@ui/Link'
import { formatNumber, convertToLocaleTimestamp, formatDate, scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Chain, shortenAddress } from '@ui-kit/utils'

type GaugeDetailsSmProps = {
  gaugeData: GaugeFormattedData
  userGaugeWeightVoteData?: UserGaugeVoteWeight
  className?: string
}

export const GaugeDetailsSm = ({ gaugeData, userGaugeWeightVoteData, className }: GaugeDetailsSmProps) => {
  const { userVeCrv, userFutureVeCrv } = userGaugeWeightVoteData || {}
  const hasFutureVeCrv = userVeCrv && userFutureVeCrv && userFutureVeCrv > userVeCrv

  const chainId = getChainIdFromGaugeData(gaugeData)
  const isSideChain = chainId !== Chain.Ethereum
  const emissions = isSideChain ? gaugeData?.prev_epoch_emissions : gaugeData?.emissions

  return (
    <Wrapper className={className}>
      {!userGaugeWeightVoteData && (
        <Box flex flexColumn>
          <StatsRow>
            <StatTitle>{t`Weight`}</StatTitle>
            <StatData>
              {gaugeData.gauge_relative_weight ? formatNumber(gaugeData.gauge_relative_weight) : 'N/A'}
            </StatData>
          </StatsRow>
          <StatsRow>
            <StatTitle>{t`7d Delta`}</StatTitle>
            <StatData>
              {gaugeData.gauge_relative_weight_7d_delta
                ? formatNumber(gaugeData.gauge_relative_weight_7d_delta)
                : 'N/A'}
            </StatData>
          </StatsRow>
          <StatsRow>
            <StatTitle>{t`60d Delta`}</StatTitle>
            <StatData>
              {gaugeData.gauge_relative_weight_60d_delta
                ? formatNumber(gaugeData.gauge_relative_weight_60d_delta)
                : 'N/A'}
            </StatData>
          </StatsRow>
        </Box>
      )}
      {userGaugeWeightVoteData && (
        <Box flex flexColumn>
          <StatsRow>
            <StatTitle>{t`User Weight`}</StatTitle>
            <StatData>{formatNumber(userGaugeWeightVoteData.userPower)}%</StatData>
          </StatsRow>
          <StatsRow>
            <StatTitle>{t`veCRV used`}</StatTitle>
            <Box flex flexAlignItems="center">
              <StatData>
                {formatNumber(userVeCrv)}
                {hasFutureVeCrv && ` → ${formatNumber(userFutureVeCrv)}`}
              </StatData>
            </Box>
          </StatsRow>
        </Box>
      )}
      <Box flex flexColumn margin="var(--spacing-3) 0 0">
        <CategoryTitle>{t`Gauge Information`}</CategoryTitle>
        <StatsRow>
          <StatTitle>{t`Emissions (CRV)`}</StatTitle>
          <StatData>{emissions ? formatNumber(emissions) : 'N/A'}</StatData>
        </StatsRow>
        <StatsRow>
          <StatTitle>{t`Deployment Date`}</StatTitle>
          <StatData>
            {formatDate(new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())), 'long')}
          </StatData>
        </StatsRow>
        <StatsRow>
          <StatTitle>{t`Contract Address`}</StatTitle>
          <StyledExternalLink href={scanAddressPath(networks[ETHEREUM_CHAIN_ID], gaugeData.address)}>
            {shortenAddress(gaugeData.address)}
          </StyledExternalLink>
        </StatsRow>
      </Box>
      <Box flex flexColumn margin="var(--spacing-3) 0 0">
        <CategoryTitle>{t`Pool Information`}</CategoryTitle>
        {gaugeData.pool && (
          <>
            <StatsRow>
              <StatTitle>{t`24 Volume`}</StatTitle>
              <StatData>
                {gaugeData.pool?.trading_volume_24h
                  ? formatNumber(gaugeData.pool.trading_volume_24h, {
                      currency: 'USD',
                    })
                  : 'N/A'}
              </StatData>
            </StatsRow>
            <StatsRow>
              <StatTitle>{t`TVL`}</StatTitle>
              <StatData>
                {gaugeData.pool?.tvl_usd
                  ? formatNumber(gaugeData.pool.tvl_usd, {
                      currency: 'USD',
                    })
                  : 'N/A'}
              </StatData>
            </StatsRow>
          </>
        )}
      </Box>
      <Box flex flexColumn>
        <StatsRow>
          <StatTitle>{t`Contract Address`}</StatTitle>
          {gaugeData.pool?.address && (
            <Box flex flexAlignItems="center">
              <StyledExternalLink href={scanAddressPath(networks[ETHEREUM_CHAIN_ID], gaugeData.pool.address)}>
                {shortenAddress(gaugeData.pool.address)}
              </StyledExternalLink>
            </Box>
          )}
        </StatsRow>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  background-color: var(--box_header--secondary--background-color);
  padding: var(--spacing-2) var(--spacing-3);
`

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-1) 0;
`

const StatTitle = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  align-self: center;
`

const CategoryTitle = styled.p`
  font-size: var(--font-size-1);
  opacity: 0.7;
  font-weight: var(--bold);
  border-bottom: 1px solid var(--gray-500a20);
  padding-bottom: var(--spacing-1);
  margin-bottom: var(--spacing-1);
`

const StatData = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: end;
  gap: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`
