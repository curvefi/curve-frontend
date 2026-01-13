import { styled } from 'styled-components'
import { CopyIconButton } from '@/dao/components/CopyIconButton'
import { ExternalLinkIconButton } from '@/dao/components/ExternalLinkIconButton'
import { ETHEREUM_CHAIN_ID } from '@/dao/constants'
import { networks } from '@/dao/networks'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { getChainIdFromGaugeData } from '@/dao/utils'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link'
import { Chip } from '@ui/Typography'
import { convertToLocaleTimestamp, formatDate, formatNumber, scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Chain, shortenAddress } from '@ui-kit/utils'

export const StyledInformationSquare16 = styled(Icon)`
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
`

export const GaugeDetails = ({ gaugeData, className }: { gaugeData: GaugeFormattedData; className?: string }) => {
  const chainId = getChainIdFromGaugeData(gaugeData)
  const isSideChain = chainId !== Chain.Ethereum
  const emissions = isSideChain ? gaugeData.prev_epoch_emissions : gaugeData.emissions

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
                  <StyledExternalLink href={scanAddressPath(networks[chainId], gaugeData.pool.address)}>
                    {shortenAddress(gaugeData.pool.address)}
                  </StyledExternalLink>
                  <ExternalLinkIconButton
                    href={scanAddressPath(networks[chainId], gaugeData.pool.address)}
                    tooltip={t`View on explorer`}
                  />
                  <CopyIconButton tooltip={t`Copy Pool Address`} copyContent={gaugeData.pool.address} />
                </Box>
              )}
              <h5>
                {gaugeData.pool?.trading_volume_24h
                  ? formatNumber(gaugeData.pool.trading_volume_24h, {
                      currency: 'USD',
                      ...(gaugeData.pool.trading_volume_24h > 10 && { decimals: 0 }),
                    })
                  : 'N/A'}
              </h5>
              <h5>
                {gaugeData.pool?.tvl_usd
                  ? formatNumber(gaugeData.pool.tvl_usd, {
                      currency: 'USD',
                      ...(gaugeData.pool.tvl_usd > 10 && { decimals: 0 }),
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
            <StyledExternalLink href={scanAddressPath(networks[ETHEREUM_CHAIN_ID], gaugeData.address)}>
              {shortenAddress(gaugeData.address)}
            </StyledExternalLink>
            <ExternalLinkIconButton
              href={scanAddressPath(networks[ETHEREUM_CHAIN_ID], gaugeData.address)}
              tooltip={t`View on explorer`}
            />
            <CopyIconButton tooltip={t`Copy Gauge Address`} copyContent={gaugeData.address} />
          </Box>
          <Chip
            size="md"
            tooltip={
              isSideChain &&
              t`Side chain gauge emissions are on a 1-week delay, as they first have to be accumulated before they can be bridged to the designated chain`
            }
          >
            <h5>
              {emissions ? formatNumber(emissions) : 'N/A'}
              {isSideChain && <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />}
            </h5>
          </Chip>
          <h5>{formatDate(new Date(convertToLocaleTimestamp(new Date(gaugeData.creation_date).getTime())), 'long')}</h5>
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
