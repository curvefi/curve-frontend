import styled from 'styled-components'
import { t } from '@lingui/macro'

import { shortenTokenAddress, formatNumber, convertToLocaleTimestamp } from '@/ui/utils'
import networks from '@/networks'

import Box from '@/ui/Box'
import ExternalLinkIconButton from '@/components/ExternalLinkIconButton'
import CopyIconButton from '@/components/CopyIconButton'
import { ExternalLink } from '@/ui/Link'

const GaugeDetails = ({ gaugeData }: { gaugeData: GaugeFormattedData }) => {
  return (
    <Wrapper>
      <Box flex flexColumn>
        {gaugeData.pool && (
          <>
            <StatsTitleRow>
              <h6>{t`Pool`}</h6>
              <h6>{t`24 Volume`}</h6>
              <h6>{t`TVL`}</h6>
            </StatsTitleRow>
            <StatsRow>
              {gaugeData.pool?.address && (
                <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                  <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.pool.address)}>
                    {shortenTokenAddress(gaugeData.pool.address)}
                  </StyledExternalLink>
                  <ExternalLinkIconButton
                    href={networks[1].scanAddressPath(gaugeData.pool.address)}
                    tooltip={t`View on explorer`}
                  />
                  <CopyIconButton tooltip={t`Copy Gauge Address`} copyContent={gaugeData.pool.address} />
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
                {gaugeData.pool?.tvl_usd && gaugeData.pool.tvl_usd !== undefined
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
          <h6>{t`Emissions (CRV)`}</h6>
          <h6>{t`Created`}</h6>
        </StatsTitleRow>
        <StatsRow>
          <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
            <StyledExternalLink href={networks[1].scanAddressPath(gaugeData.address)}>
              {shortenTokenAddress(gaugeData.address)}
            </StyledExternalLink>
            <ExternalLinkIconButton
              href={networks[1].scanAddressPath(gaugeData.address)}
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
  text-transform: none;
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`

export default GaugeDetails
