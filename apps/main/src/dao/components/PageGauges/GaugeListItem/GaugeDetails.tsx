import styled from 'styled-components'
import CopyIconButton from '@/dao/components/CopyIconButton'
import ExternalLinkIconButton from '@/dao/components/ExternalLinkIconButton'
import { ETHEREUM_CHAIN_ID } from '@/dao/constants'
import networks from '@/dao/networks'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { getChainIdFromGaugeData } from '@/dao/utils'
import Box from '@ui/Box'
import { ExternalLink } from '@ui/Link'
import { formatNumber, convertToLocaleTimestamp } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'

const GaugeDetails = ({ gaugeData, className }: { gaugeData: GaugeFormattedData; className?: string }) => {
  const chainId = getChainIdFromGaugeData(gaugeData)

  return (
    <Wrapper className={className}>
      <Box flex flexColumn>
        {gaugeData.pool && (
          <>
            <StatsTitleRow>
              <h6>{t`Pool`}</h6>
              <h6>{t`24h Volume`}</h6>
              <h6>{t`TVL`}</h6>
            </StatsTitleRow>
            <StatsRow>
              {gaugeData.pool?.address && (
                <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                  <StyledExternalLink href={networks[chainId].scanAddressPath(gaugeData.pool.address)}>
                    {shortenAddress(gaugeData.pool.address)}
                  </StyledExternalLink>
                  <ExternalLinkIconButton
                    href={networks[chainId].scanAddressPath(gaugeData.pool.address)}
                    tooltip={t`View on explorer`}
                  />
                  <CopyIconButton tooltip={t`Copy Pool Address`} copyContent={gaugeData.pool.address} />
                </Box>
              )}
              <h5>
                {gaugeData.pool?.trading_volume_24h
                  ? formatNumber(gaugeData.pool.trading_volume_24h, {
                      showDecimalIfSmallNumberOnly: true,
                      currency: 'USD',
                    })
                  : 'N/A'}
              </h5>
              <h5>
                {gaugeData.pool?.tvl_usd
                  ? formatNumber(gaugeData.pool.tvl_usd, {
                      showDecimalIfSmallNumberOnly: true,
                      currency: 'USD',
                    })
                  : 'N/A'}
              </h5>
            </StatsRow>
          </>
        )}
      </Box>
      <Box flex flexColumn>
        <StatsTitleRow>
          <h6>{t`Gauge`}</h6>
          <h6>{t`Current Week Emissions (CRV)`}</h6>
          <h6>{t`Created`}</h6>
        </StatsTitleRow>
        <StatsRow>
          <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
            <StyledExternalLink href={networks[ETHEREUM_CHAIN_ID].scanAddressPath(gaugeData.address)}>
              {shortenAddress(gaugeData.address)}
            </StyledExternalLink>
            <ExternalLinkIconButton
              href={networks[ETHEREUM_CHAIN_ID].scanAddressPath(gaugeData.address)}
              tooltip={t`View on explorer`}
            />
            <CopyIconButton tooltip={t`Copy Gauge Address`} copyContent={gaugeData.address} />
          </Box>
          <h5>
            {gaugeData.emissions
              ? formatNumber(gaugeData.emissions, {
                  showDecimalIfSmallNumberOnly: true,
                })
              : 'N/A'}
          </h5>
          <h5>{new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())).toLocaleString()}</h5>
        </StatsRow>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const StatsTitleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid var(--gray-500a20);
  padding: var(--spacing-1) var(--spacing-2);
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-2);
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

export default GaugeDetails
