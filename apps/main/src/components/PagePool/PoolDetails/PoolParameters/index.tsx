import { useMemo } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import useStore from '@/store/useStore'
import { breakpoints } from '@/ui/utils/responsive'
import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'
import { shortenTokenAddress } from '@/utils'
import { copyToClipboard } from '@/lib/utils'
import dayjs from '@/lib/dayjs'
import Box from '@/ui/Box'
import { StyledIconButton, StyledInformationSquare16 } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import { Chip } from '@/ui/Typography'
import { ExternalLink } from '@/ui/Link'
import TokenIcon from '@/components/TokenIcon'
import Icon from '@/ui/Icon'
import TextEllipsis from '@/ui/TextEllipsis'

type PoolParametersProps = {
  pricesApi: boolean
  poolData: PoolData
  rChainId: ChainId
}

const PoolParameters = ({ pricesApi, poolData, rChainId }: PoolParametersProps) => {
  const poolAddress = poolData.pool.address
  const snapshotsMapper = useStore((state) => state.pools.snapshotsMapper)
  const basePools = useStore((state) => state.pools.basePools)
  const pricesApiPoolDataMapper = useStore((state) => state.pools.pricesApiPoolDataMapper)
  const network = useStore((state) => state.networks.networks[rChainId])
  const snapshotData = snapshotsMapper[poolAddress]
  const pricesData = pricesApiPoolDataMapper[poolAddress]

  const convert1e8 = (number: number) => formatNumber(number / 10 ** 8, { showAllFractionDigits: true })
  const convert1e10 = (number: number) => formatNumber(number / 10 ** 10, { showAllFractionDigits: true })
  const convert1e18 = (number: number) => formatNumber(number / 10 ** 18, { showAllFractionDigits: true })

  const { gamma, A, future_A, future_A_time, initial_A, initial_A_time } = poolData.parameters ?? {}

  const haveWrappedCoins = useMemo(() => {
    if (!!poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  // TODO: format date by locale
  const rampUpAEndsTime = useMemo(() => {
    return future_A_time ? new Date(future_A_time).toLocaleString() : null
  }, [future_A_time])

  const rampADetails = useMemo(() => {
    if (initial_A_time && initial_A && future_A_time && future_A) {
      return {
        isFutureATimePassedToday: dayjs().isAfter(future_A_time, 'day'),
        isFutureATimeToday: dayjs().isSame(future_A_time, 'day'),
        isRampUp: Number(future_A) > Number(initial_A),
      }
    }
  }, [future_A, future_A_time, initial_A, initial_A_time])

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  const returnPoolType = (poolType: string, coins: number) => {
    const isCrypto = poolData.pool.isCrypto
    const isNg = poolData.pool.isNg

    if (poolData.pool.isLlamma) return 'Llamma'
    if (!isCrypto && !isNg) return t`Stableswap`
    if (!isCrypto && isNg) return t`Stableswap-NG`
    if (isCrypto && !isNg && coins === 2) return t`Two Coin Cryptoswap`
    if (isCrypto && !isNg && coins === 3) return t`Tricrypto`
    if (isCrypto && isNg && coins === 2) return t`Two Coin Cryptoswap-NG`
    if (isCrypto && isNg && coins === 3) return t`Three Coin Cryptoswap-NG`
  }

  const returnAssetType = (id: number) => {
    if (id === 0) return t`Standard`
    if (id === 1) return t`Oracle`
    if (id === 2) return t`Rebasing`
    return t`ERC4626`
  }

  return (
    <GridContainer variant="secondary">
      <PoolParametersWrapper>
        <SectionWrapper>
          <SectionTitle>{t`Pool Info:`}</SectionTitle>
          <PoolParameter>
            <PoolParameterTitle>{t`Pool Type:`}</PoolParameterTitle>
            <PoolParameterValue>
              {returnPoolType(pricesData.pool_type, pricesData.coins.length)}
              {pricesData.metapool && `, ${t`Metapool`}`}
              {basePools[rChainId].some((pool) => pool.pool === poolAddress) && `, ${t`Basepool`}`}
            </PoolParameterValue>
          </PoolParameter>
          {pricesData.base_pool && (
            <PoolParameter>
              <PoolParameterTitle>{t`Basepool:`}</PoolParameterTitle>
              <DataAddressLink href={network.scanTokenPath(pricesData.base_pool)}>
                {shortenTokenAddress(pricesData.base_pool)}
              </DataAddressLink>
            </PoolParameter>
          )}
          <PoolParameter>
            <PoolParameterTitle>{t`Vyper Version:`}</PoolParameterTitle>
            <PoolParameterValue>{pricesData.vyper_version}</PoolParameterValue>
          </PoolParameter>
          <PoolParameter>
            <PoolParameterTitle>{t`Registry:`}</PoolParameterTitle>
            <PoolParameterLink href={network.scanTokenPath(pricesData.registry)}>
              {shortenTokenAddress(pricesData.registry)}
            </PoolParameterLink>
          </PoolParameter>
        </SectionWrapper>
        {/* Coins with Asset types */}
        {poolData.pool.isNg && pricesData.asset_types && (
          <SectionWrapper>
            <SectionTitle>{t`Coins:`}</SectionTitle>
            {poolData.tokens.map((token, idx) => (
              <Coin key={`${token}-${idx}`}>
                <Box flex>
                  <>
                    <StyledExternalLink href={network.scanTokenPath(poolData.tokenAddresses[idx])}>
                      <ExternalLinkTokenWrapper>
                        <StyledTokenIcon
                          size="sm"
                          imageBaseUrl={network?.imageBaseUrl ?? ''}
                          token={token}
                          address={poolData.tokenAddresses[idx]}
                        />
                        <ExternalLinkToken>{token}</ExternalLinkToken>
                      </ExternalLinkTokenWrapper>
                    </StyledExternalLink>
                    <StyledIconButton size="medium" onClick={() => handleCopyClick(poolData.tokenAddresses[idx])}>
                      <Icon name="Copy" size={16} />
                    </StyledIconButton>
                  </>
                  {poolData.pool.isNg && pricesData.asset_types && (
                    <AssetType>{returnAssetType(pricesData.asset_types[idx])}</AssetType>
                  )}
                </Box>
                {/* Oracle */}
                {pricesData && pricesData.asset_types[idx] === 1 && (
                  <IndentWrapper>
                    <Box flex>
                      <Numeral>├─</Numeral>
                      <IndentDataTitle>{t`Oracle Address:`}</IndentDataTitle>
                      <IndentDataAddressLink href={network.scanTokenPath(pricesData.oracles[idx].oracle_address)}>
                        {shortenTokenAddress(pricesData.oracles[idx].oracle_address)}
                      </IndentDataAddressLink>
                    </Box>
                    <Box flex>
                      <Numeral>├─</Numeral>
                      <IndentDataTitle>{t`Function:`}</IndentDataTitle>
                      <IndentData>{pricesData.oracles[idx].method}</IndentData>
                    </Box>
                    <Box flex>
                      <Numeral>└─</Numeral>
                      <IndentDataTitle>{t`Function ID:`}</IndentDataTitle>
                      <IndentData>{pricesData.oracles[idx].method_id}</IndentData>
                    </Box>
                  </IndentWrapper>
                )}
              </Coin>
            ))}
          </SectionWrapper>
        )}
        <SectionWrapper>
          <SectionTitle>{t`Pool Parameters:`}</SectionTitle>
          {pricesApi && snapshotData.mid_fee !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Mid Fee:`}</PoolParameterTitle>
              <PoolParameterValue>{convert1e8(snapshotData.mid_fee)}</PoolParameterValue>
            </PoolParameter>
          )}
          {pricesApi && snapshotData.out_fee !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Out Fee:`}</PoolParameterTitle>
              <PoolParameterValue>{convert1e8(snapshotData.out_fee)}</PoolParameterValue>
            </PoolParameter>
          )}
          {snapshotData.a !== null && (
            <PoolParameter noBorder={rampADetails && rampADetails.isRampUp !== null}>
              <PoolParameterTitle>{t`A:`}</PoolParameterTitle>
              <PoolParameterValue>
                <Chip
                  isBold
                  size="sm"
                  tooltip={
                    <>
                      {t`Amplification coefficient chosen from fluctuation of prices around 1.`}
                      {rampADetails && rampADetails?.isFutureATimePassedToday && (
                        <>
                          <br />{' '}
                          {t`Last change occurred between ${dayjs(initial_A_time).format('ll')} and ${dayjs(
                            future_A_time,
                          ).format('ll')}, when A ramped from ${initial_A} to ${future_A}.`}
                        </>
                      )}
                    </>
                  }
                  tooltipProps={{ minWidth: '200px' }}
                >
                  {formatNumber(pricesApi ? snapshotData.a : A, { useGrouping: false })}
                  <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
                </Chip>
              </PoolParameterValue>
            </PoolParameter>
          )}
          {rampADetails && !rampADetails.isFutureATimePassedToday && (
            <RampUpContainer>
              <Box flex>
                <Numeral>├─</Numeral>
                <Box margin={'0 0 0 var(--spacing-2)'} flex flexJustifyContent="space-between" fillWidth>
                  <PoolParameterTitle>{t`Ramping ${rampADetails.isRampUp ? 'up' : 'down'} A:`}</PoolParameterTitle>
                  <PoolParameterValue>
                    <StyledChip
                      isBold
                      size="md"
                      tooltip={t`Slowly changing ${
                        rampADetails.isRampUp ? 'up' : 'down'
                      } A so that it doesn't negatively change virtual price growth of shares`}
                      tooltipProps={{
                        placement: 'bottom end',
                      }}
                    >
                      {formatNumber(initial_A, { useGrouping: false })} →{' '}
                      {formatNumber(future_A, { useGrouping: false })}{' '}
                      <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
                    </StyledChip>
                  </PoolParameterValue>
                </Box>
              </Box>
              <Box flex>
                <Numeral>└─</Numeral>
                <Box margin={'0 0 0 var(--spacing-2)'} flex flexJustifyContent="space-between" fillWidth>
                  <PoolParameterTitle>{t`Ramp ${
                    rampADetails.isRampUp ? 'up' : 'down'
                  } A ends on: `}</PoolParameterTitle>
                  <PoolParameterValue>{rampUpAEndsTime}</PoolParameterValue>
                </Box>
              </Box>
            </RampUpContainer>
          )}
          {pricesApi && snapshotData.offpeg_fee_multiplier !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Off Peg Multiplier:`}</PoolParameterTitle>
              <PoolParameterValue>{convert1e10(snapshotData.offpeg_fee_multiplier)}</PoolParameterValue>
            </PoolParameter>
          )}
          {pricesApi && snapshotData.gamma !== null && (
            <PoolParameter>
              <PoolParameterTitle>Gamma:</PoolParameterTitle>
              <PoolParameterValue>{pricesApi ? convert1e18(snapshotData.gamma) : gamma}</PoolParameterValue>
            </PoolParameter>
          )}
          {pricesApi && snapshotData.allowed_extra_profit !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Allowed Extra Profit:`}</PoolParameterTitle>
              <PoolParameterValue>{convert1e18(snapshotData.allowed_extra_profit)}</PoolParameterValue>
            </PoolParameter>
          )}
          {pricesApi && snapshotData.fee_gamma !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Fee Gamma:`}</PoolParameterTitle>
              <PoolParameterValue>{convert1e18(snapshotData.fee_gamma)}</PoolParameterValue>
            </PoolParameter>
          )}
          {pricesApi && snapshotData.adjustment_step !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Adjustment Step:`}</PoolParameterTitle>
              <PoolParameterValue>{convert1e18(snapshotData.adjustment_step)}</PoolParameterValue>
            </PoolParameter>
          )}
          {pricesApi && snapshotData.ma_half_time !== null && (
            <PoolParameter>
              <PoolParameterTitle>{t`Moving Average Time:`}</PoolParameterTitle>
              <PoolParameterValue>{formatNumber(snapshotData.ma_half_time, { useGrouping: false })}</PoolParameterValue>
            </PoolParameter>
          )}
        </SectionWrapper>
      </PoolParametersWrapper>
      <PoolDataWrapper>
        {!!poolData && haveWrappedCoins && Array.isArray(poolData.parameters.priceOracle) && (
          <StatsSection>
            <Box grid>
              {Array.isArray(poolData.parameters.priceOracle) && (
                <>
                  <StatsTitle>{t`Price Oracle:`}</StatsTitle>
                  {poolData.parameters.priceOracle.map((p, idx) => {
                    const wrappedCoins = poolData.pool.wrappedCoins as string[]
                    const symbol = wrappedCoins[idx + 1]
                    return (
                      <StatsContainer key={p}>
                        <StatsSymbol>{symbol}:</StatsSymbol>
                        <StatsData>{formatNumber(p, { ...getFractionDigitsOptions(p, 10) })}</StatsData>
                      </StatsContainer>
                    )
                  })}
                </>
              )}
            </Box>
          </StatsSection>
        )}

        {!!poolData && haveWrappedCoins && Array.isArray(poolData.parameters.priceScale) && (
          <StatsSection>
            <StatsTitle>{t`Price Scale:`}</StatsTitle>
            {poolData.parameters.priceScale.map((p, idx) => {
              const wrappedCoins = poolData.pool.wrappedCoins as string[]
              const symbol = wrappedCoins[idx + 1]
              return (
                <StatsContainer key={p}>
                  <StatsSymbol>{symbol}:</StatsSymbol>
                  <StatsData>{formatNumber(p, { ...getFractionDigitsOptions(p, 10) })}</StatsData>
                </StatsContainer>
              )
            })}
          </StatsSection>
        )}

        {(snapshotData.xcp_profit || snapshotData.xcp_profit_a) && pricesApi && (
          <StatsSection>
            {snapshotData.xcp_profit !== null && (
              <StatsContainer>
                <StatsSymbol>{t`Xcp Profit:`}</StatsSymbol>
                <StatsData>{convert1e18(snapshotData.xcp_profit)}</StatsData>
              </StatsContainer>
            )}
            {snapshotData.xcp_profit_a !== null && (
              <StatsContainer>
                <StatsSymbol>{t`Xcp Profit A:`}</StatsSymbol>
                <StatsData>{convert1e18(snapshotData.xcp_profit_a)}</StatsData>
              </StatsContainer>
            )}
          </StatsSection>
        )}
      </PoolDataWrapper>
    </GridContainer>
  )
}

const GridContainer = styled(Box)`
  width: 100%;
  display: grid;
  transition: 200ms;
  grid-template-columns: 1fr;
  min-height: 14.6875rem;
  @media (min-width: 75rem) {
    grid-template-columns: 1fr 0.7fr;
  }
`

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-4);
`

const PoolParametersWrapper = styled(Box)`
  padding: 1.5rem 1rem;

  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem;
  }
`

const Coin = styled(Box)`
  display: flex;
  flex-direction: column;
  &:first-of-type {
    margin-top: var(--spacing-3);
  }
`

const AssetType = styled.p`
  margin: auto 0 auto auto;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

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

const IndentWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0 0 var(--spacing-2) var(--spacing-2);
`

const Numeral = styled.p`
  font-family: var(--font-mono);
`

const IndentDataTitle = styled.p`
  margin-left: var(--spacing-2);
  font-size: var(--font-size-2);
`

const DataAddressLink = styled(ExternalLink)`
  margin: var(--spacing-1) 0 0 auto;
  font-size: var(--font-size-2);
  color: inherit;
  font-weight: var(--bold);
`

const IndentDataAddressLink = styled(ExternalLink)`
  margin: var(--spacing-1) 0 0 auto;
  font-size: var(--font-size-2);
  color: inherit;
  font-weight: var(--semi-bold);
`

const IndentData = styled.p`
  margin: var(--spacing-1) 0 0 auto;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
`

const PoolParameter = styled.div<{ noBorder?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  border-bottom: ${(props) => (props.noBorder ? '' : '1px solid var(--border-600)')};
  &:last-child {
    border: none;
  }
  &:first-of-type {
    margin-top: var(--spacing-3);
    padding-top: 0;
  }
`

const PoolDataWrapper = styled.div`
  background-color: var(--box--secondary--content--background-color);
  row-gap: var(--spacing-3);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;

  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem;
  }
`

const StyledChip = styled(Chip)`
  font-size: var(--font-size-2);
`

const PoolParameterTitle = styled.p`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
`

const PoolParameterValue = styled.p`
  font-weight: var(--bold);
  font-size: var(--font-size-2);
`

const PoolParameterLink = styled(ExternalLink)`
  margin: auto 0 0 auto;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  color: inherit;
`

const RampUpContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const StatsSection = styled(Box)`
  display: flex;
  flex-direction: column;
`

const SectionTitle = styled.h3`
  font-size: var(--font-size-1);
  text-transform: uppercase;
  font-weight: var(--bold);
`

const StatsTitle = styled.h3`
  font-size: var(--font-size-1);
  text-transform: uppercase;
  font-weight: var(--bold);
  margin-bottom: var(--spacing-2);
`

const StatsContainer = styled(Box)`
  display: flex;
  margin-top: var(--spacing-1);
`

const StatsSymbol = styled.p`
  padding-right: var(--spacing-2);
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
`

const StatsData = styled.p`
  margin-left: auto;
  font-weight: var(--bold);
  font-size: var(--font-size-2);
`

export const ExternalLinkToken = styled(TextEllipsis)`
  font-weight: bold;
  text-transform: initial;
`

export default PoolParameters
