import type { ComponentPropsWithRef } from 'react'
import { useMemo } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { formatCryptoA, FXSWAP } from '@/dex/components/PageCreatePool/constants'
import { StyledIconButton, StyledInformationSquare16 } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { useBasePools } from '@/dex/queries/base-pools.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { ChainId, PoolData } from '@/dex/types/main.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Address } from '@primitives/address.utils'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link'
import { TextEllipsis } from '@ui/TextEllipsis'
import { Chip } from '@ui/Typography'
import { formatDate, scanTokenPath } from '@ui/utils'
import { dayjs } from '@ui-kit/lib/dayjs'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { cardContentSmallStyles } from '@ui-kit/themes/components/card-content'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { copyToClipboard, shortenAddress, formatNumber, amount, getFractionDigitsOptions } from '@ui-kit/utils'
import { requireBlockchainId } from '@ui-kit/utils/network'

const { Spacing } = SizesAndSpaces

type PoolParametersProps = {
  poolData: PoolData
  rChainId: ChainId
}

export const PoolParameters = ({ poolData, rChainId }: PoolParametersProps) => {
  const poolAddress = poolData.pool.address as Address
  const blockchainId = requireBlockchainId(rChainId)
  const { data: basePools } = useBasePools({ chainId: rChainId })
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const { data: poolMetadata } = usePoolMetadata({
    chain: blockchainId,
    poolAddress,
  })
  const { data: snapshots } = usePoolSnapshots({
    chain: blockchainId,
    poolAddress,
  })
  const snapshotData = snapshots?.[0]

  const { data: poolParameters } = usePoolParameters({ chainId: rChainId, poolId: poolData.pool.id })
  const { gamma, A, future_A, future_A_time, initial_A, initial_A_time, priceOracle, priceScale } = poolParameters ?? {}

  const isFxSwap = poolMetadata?.hasDonations ?? false
  const convert1e8 = (number: number) => formatNumber(number / 10 ** 8, { decimals: 5, abbreviate: false })
  const convert1e10 = (number: number) => formatNumber(number / 10 ** 10, { decimals: 5, abbreviate: false })
  const convert1e18 = (number: number) => formatNumber(number / 10 ** 18, { decimals: 5, abbreviate: false })
  const convertA = (a: number | string | undefined) => {
    if (!isFxSwap || a == null) return a
    return formatCryptoA(a, FXSWAP)
  }
  const formatADisplay = (a: number | string | undefined) =>
    formatNumber(amount(convertA(a)), { abbreviate: false, fallback: '-' })

  const haveWrappedCoins = useMemo(() => {
    if (poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  // TODO: format date by locale
  const rampUpAEndsTime = useMemo(() => (future_A_time ? formatDate(future_A_time, 'long') : null), [future_A_time])

  const rampADetails = useMemo(() => {
    if (initial_A_time && initial_A && future_A_time && future_A) {
      return {
        isFutureATimePassedToday: dayjs().isAfter(future_A_time, 'day'),
        isFutureATimeToday: dayjs().isSame(future_A_time, 'day'),
        isRampUp: Number(future_A) > Number(initial_A),
      }
    }
  }, [future_A, future_A_time, initial_A, initial_A_time])

  const returnPoolType = (_poolType: string, coins: number) => {
    const isCrypto = poolData.pool.isCrypto
    const isNg = poolData.pool.isNg

    if (poolData.pool.isLlamma) return 'Llamma'
    if (isFxSwap) return t`FXSwap`
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

  if (!poolMetadata || !snapshotData) return null

  return (
    <Card size="inline">
      <CardContent component={Grid} container columnSpacing={Spacing.md}>
        <Grid size={{ mobile: 12, desktop: 8 }} sx={cardContentSmallStyles}>
          <Stack gap={Spacing.lg}>
            <Stack>
              <SectionTitle>{t`Pool Info:`}</SectionTitle>
              <PoolParameter>
                <PoolParameterTitle>{t`Pool Type:`}</PoolParameterTitle>
                <PoolParameterValue>
                  {returnPoolType(poolMetadata.poolType, poolMetadata.coins.length)}
                  {poolMetadata.metapool && `, ${t`Metapool`}`}
                  {basePools?.some(pool => pool.pool === poolAddress) && `, ${t`Basepool`}`}
                </PoolParameterValue>
              </PoolParameter>
              {poolMetadata.basePool && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Basepool:`}</PoolParameterTitle>
                  <DataAddressLink href={scanTokenPath(network, poolMetadata.basePool)}>
                    {shortenAddress(poolMetadata.basePool)}
                  </DataAddressLink>
                </PoolParameter>
              )}
              <PoolParameter>
                <PoolParameterTitle>{t`Vyper Version:`}</PoolParameterTitle>
                <PoolParameterValue>{poolMetadata.vyperVersion}</PoolParameterValue>
              </PoolParameter>
              <PoolParameter>
                <PoolParameterTitle>{t`Registry:`}</PoolParameterTitle>
                <PoolParameterLink href={scanTokenPath(network, poolMetadata.registry)}>
                  {shortenAddress(poolMetadata.registry)}
                </PoolParameterLink>
              </PoolParameter>
            </Stack>

            {/* Coins with Asset types */}
            {poolData.pool.isNg && poolMetadata.assetTypes && (
              <Stack>
                <SectionTitle>{t`Coins:`}</SectionTitle>
                {poolData.tokens.map((token, idx) => (
                  <Stack key={`${token}-${idx}`}>
                    <Stack direction="row">
                      <Stack direction="row">
                        <StyledExternalLink href={scanTokenPath(network, poolData.tokenAddresses[idx])}>
                          <ExternalLinkTokenWrapper>
                            <StyledTokenIcon
                              size="sm"
                              blockchainId={network?.networkId ?? ''}
                              tooltip={token}
                              address={poolData.tokenAddresses[idx]}
                            />
                            <ExternalLinkToken>{token}</ExternalLinkToken>
                          </ExternalLinkTokenWrapper>
                        </StyledExternalLink>
                        <StyledIconButton size="medium" onClick={() => copyToClipboard(poolData.tokenAddresses[idx])}>
                          <Icon name="Copy" size={16} />
                        </StyledIconButton>
                      </Stack>
                      {poolData.pool.isNg && poolMetadata.assetTypes && (
                        <AssetType>{returnAssetType(poolMetadata.assetTypes[idx])}</AssetType>
                      )}
                    </Stack>
                    {/* Oracle */}
                    {poolMetadata.assetTypes?.[idx] === 1 && poolMetadata.oracles?.[idx] && (
                      <Stack>
                        <Stack direction="row">
                          <Numeral>├─</Numeral>
                          <IndentDataTitle>{t`Oracle Address:`}</IndentDataTitle>
                          {poolMetadata.oracles[idx].oracleAddress ? (
                            <IndentDataAddressLink
                              href={scanTokenPath(network, poolMetadata.oracles[idx].oracleAddress)}
                            >
                              {shortenAddress(poolMetadata.oracles[idx].oracleAddress)}
                            </IndentDataAddressLink>
                          ) : (
                            <IndentData>-</IndentData>
                          )}
                        </Stack>
                        <Stack direction="row">
                          <Numeral>├─</Numeral>
                          <IndentDataTitle>{t`Function:`}</IndentDataTitle>
                          <IndentData>{poolMetadata.oracles[idx].method ?? '-'}</IndentData>
                        </Stack>
                        <Stack direction="row">
                          <Numeral>└─</Numeral>
                          <IndentDataTitle>{t`Function ID:`}</IndentDataTitle>
                          <IndentData>{poolMetadata.oracles[idx].methodId ?? '-'}</IndentData>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}

            <Stack>
              <SectionTitle>{t`Pool Parameters:`}</SectionTitle>
              {snapshotData.midFee !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Mid Fee:`}</PoolParameterTitle>
                  <PoolParameterValue>{convert1e8(snapshotData.midFee)}</PoolParameterValue>
                </PoolParameter>
              )}
              {snapshotData.outFee !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Out Fee:`}</PoolParameterTitle>
                  <PoolParameterValue>{convert1e8(snapshotData.outFee)}</PoolParameterValue>
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
                          {rampADetails &&
                            rampADetails?.isFutureATimePassedToday &&
                            initial_A_time != null &&
                            future_A_time != null && (
                              <>
                                <br />{' '}
                                {t`Last change occurred between ${formatDate(initial_A_time, 'short')} and ${formatDate(
                                  future_A_time,
                                  'short',
                                )}, when A ramped from ${formatADisplay(initial_A)} to ${formatADisplay(future_A)}.`}
                              </>
                            )}
                        </>
                      }
                      tooltipProps={{ minWidth: '200px' }}
                    >
                      {formatADisplay(A)}
                      <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
                    </Chip>
                  </PoolParameterValue>
                </PoolParameter>
              )}
              {rampADetails && !rampADetails.isFutureATimePassedToday && (
                <RampUpContainer>
                  <Stack direction="row">
                    <Numeral>├─</Numeral>
                    <Stack margin={'0 0 0 var(--spacing-2)'} justifyContent="space-between">
                      <PoolParameterTitle>{t`Ramping ${rampADetails.isRampUp ? 'up' : 'down'} A:`}</PoolParameterTitle>
                      <PoolParameterValue>
                        <StyledChip
                          isBold
                          size="md"
                          tooltip={t`Slowly changing ${
                            rampADetails.isRampUp ? 'up' : 'down'
                          } A so that it doesn't negatively change virtual price growth of shares`}
                          tooltipProps={{ placement: 'bottom-end' }}
                        >
                          {formatADisplay(initial_A)} → {formatADisplay(future_A)}{' '}
                          <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
                        </StyledChip>
                      </PoolParameterValue>
                    </Stack>
                  </Stack>
                  <Stack direction="row">
                    <Numeral>└─</Numeral>
                    <Stack margin={'0 0 0 var(--spacing-2)'} justifyContent="space-between">
                      <PoolParameterTitle>{t`Ramp ${
                        rampADetails.isRampUp ? 'up' : 'down'
                      } A ends on: `}</PoolParameterTitle>
                      <PoolParameterValue>{rampUpAEndsTime}</PoolParameterValue>
                    </Stack>
                  </Stack>
                </RampUpContainer>
              )}
              {snapshotData.offpegFeeMultiplier !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Off Peg Multiplier:`}</PoolParameterTitle>
                  <PoolParameterValue>{convert1e10(snapshotData.offpegFeeMultiplier)}</PoolParameterValue>
                </PoolParameter>
              )}
              {snapshotData.gamma !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Gamma:`}</PoolParameterTitle>
                  <PoolParameterValue>{gamma}</PoolParameterValue>
                </PoolParameter>
              )}
              {snapshotData.allowedExtraProfit !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Allowed Extra Profit:`}</PoolParameterTitle>
                  <PoolParameterValue>{convert1e18(snapshotData.allowedExtraProfit)}</PoolParameterValue>
                </PoolParameter>
              )}
              {snapshotData.feeGamma !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Fee Gamma:`}</PoolParameterTitle>
                  <PoolParameterValue>{convert1e18(snapshotData.feeGamma)}</PoolParameterValue>
                </PoolParameter>
              )}
              {snapshotData.adjustmentStep !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Adjustment Step:`}</PoolParameterTitle>
                  <PoolParameterValue>{convert1e18(snapshotData.adjustmentStep)}</PoolParameterValue>
                </PoolParameter>
              )}
              {snapshotData.maHalfTime !== null && (
                <PoolParameter>
                  <PoolParameterTitle>{t`Moving Average Time:`}</PoolParameterTitle>
                  <PoolParameterValue>
                    {formatNumber(snapshotData.maHalfTime, { useGrouping: false, abbreviate: false })}
                  </PoolParameterValue>
                </PoolParameter>
              )}
            </Stack>
          </Stack>
        </Grid>

        <Grid
          size={{ mobile: 12, desktop: 4 }}
          sx={{
            ...cardContentSmallStyles,
            backgroundColor: t => t.design.Layer[2].Fill,
          }}
        >
          <Stack gap={Spacing.md}>
            {!!poolData && haveWrappedCoins && priceOracle && (
              <Stack>
                <StatsTitle>{t`Price Oracle:`}</StatsTitle>
                {priceOracle.map((p, idx) => {
                  const wrappedCoins = poolData.pool.wrappedCoins as string[]
                  const symbol = wrappedCoins[idx + 1]
                  return (
                    <ActionInfo
                      key={p}
                      label={symbol}
                      value={formatNumber(amount(p), {
                        ...getFractionDigitsOptions(p, 10),
                        abbreviate: false,
                        fallback: '-',
                      })}
                    />
                  )
                })}
              </Stack>
            )}

            {!!poolData && haveWrappedCoins && priceScale && (
              <Stack>
                <StatsTitle>{t`Price Scale:`}</StatsTitle>
                {priceScale.map((p, idx) => {
                  const wrappedCoins = poolData.pool.wrappedCoins as string[]
                  const symbol = wrappedCoins[idx + 1]
                  return (
                    <ActionInfo
                      key={p}
                      label={symbol}
                      value={formatNumber(amount(p), {
                        ...getFractionDigitsOptions(p, 10),
                        abbreviate: false,
                        fallback: '-',
                      })}
                    />
                  )
                })}
              </Stack>
            )}

            {(snapshotData.xcpProfit != null || snapshotData.xcpProfitA != null) && (
              <Stack>
                {snapshotData.xcpProfit !== null && (
                  <ActionInfo label={t`Xcp Profit:`} value={convert1e18(snapshotData.xcpProfit)} />
                )}
                {snapshotData.xcpProfitA !== null && (
                  <ActionInfo label={t`Xcp Profit A:`} value={convert1e18(snapshotData.xcpProfitA)} />
                )}
              </Stack>
            )}
          </Stack>
        </Grid>
      </CardContent>
    </Card>
  )
}

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
  border-bottom: ${props => (props.noBorder ? '' : '1px solid var(--border-600)')};
  &:last-child {
    border: none;
  }
  &:first-of-type {
    margin-top: var(--spacing-3);
    padding-top: 0;
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

type SpanProps = ComponentPropsWithRef<'span'>

const ExternalLinkToken: IStyledComponent<'web', SpanProps> = styled(TextEllipsis)`
  font-weight: bold;
  text-transform: initial;
`
