import { useMemo } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { breakpoints } from '@/ui/utils/responsive'
import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import Box from '@/ui/Box'
import { StyledInformationSquare16 } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import { Chip } from '@/ui/Typography'

type Props = {
  pricesApi: boolean
  poolData: PoolData
}

const PoolParameters = ({ pricesApi, poolData }: Props) => {
  const poolAddress = poolData.pool.address
  const snapshotsMapper = useStore((state) => state.pools.snapshotsMapper)
  const snapshotData = snapshotsMapper[poolAddress]

  const convertSmallNumber = (number: number) => formatNumber(number / 10 ** 8, { showAllFractionDigits: true })
  const convertNumber = (number: number) => formatNumber(number / 10 ** 18, { showAllFractionDigits: true })

  const { gamma, A, future_A, future_A_time, initial_A } = poolData.parameters ?? {}

  const haveWrappedCoins = useMemo(() => {
    if (!!poolData?.pool?.wrappedCoins) {
      return Array.isArray(poolData.pool.wrappedCoins)
    }
    return false
  }, [poolData?.pool?.wrappedCoins])

  const rampUpA = useMemo(() => {
    return future_A_time && initial_A && future_A ? `${initial_A} → ${future_A}` : null
  }, [future_A, future_A_time, initial_A])

  // TODO: format date by locale
  const rampUpAEndsTime = useMemo(() => {
    return future_A_time ? new Date(future_A_time).toLocaleString() : null
  }, [future_A_time])

  return (
    <GridContainer variant="secondary">
      <PoolParametersWrapper>
        <StatsSectionTitle>{t`Pool Parameters`}</StatsSectionTitle>
        {pricesApi && snapshotData.mid_fee !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Mid Fee:`}</PoolParameterTitle>
            <PoolParameterValue>{convertSmallNumber(snapshotData.mid_fee)}</PoolParameterValue>
          </PoolParameter>
        )}
        {pricesApi && snapshotData.out_fee !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Out Fee:`}</PoolParameterTitle>
            <PoolParameterValue>{convertSmallNumber(snapshotData.out_fee)}</PoolParameterValue>
          </PoolParameter>
        )}
        {snapshotData.a !== null && (
          <PoolParameter noBorder={rampUpA !== null}>
            <PoolParameterTitle>{t`A:`}</PoolParameterTitle>
            <PoolParameterValue>
              {formatNumber(pricesApi ? snapshotData.a : A, { useGrouping: false })}
            </PoolParameterValue>
          </PoolParameter>
        )}
        {rampUpA && (
          <RampUpContainer>
            <Box flex flexJustifyContent="space-between">
              <PoolParameterTitle>{t`Ramping up A:`}</PoolParameterTitle>
              <PoolParameterValue>
                <Chip
                  isBold
                  size="md"
                  tooltip={t`Slowly changing up A so that it doesn't negatively change virtual price growth of shares`}
                  tooltipProps={{
                    placement: 'bottom end',
                  }}
                >
                  {rampUpA} <StyledInformationSquare16 name="InformationSquare" size={16} className="svg-tooltip" />
                </Chip>
              </PoolParameterValue>
            </Box>
            <Box flex flexJustifyContent="space-between">
              <PoolParameterTitle>{t`Ramp up A ends on: `}</PoolParameterTitle>
              <PoolParameterValue>{rampUpAEndsTime}</PoolParameterValue>
            </Box>
          </RampUpContainer>
        )}
        {pricesApi && snapshotData.offpeg_fee_multiplier !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Off Peg Multiplier:`}</PoolParameterTitle>
            <PoolParameterValue>{convertNumber(snapshotData.offpeg_fee_multiplier)}</PoolParameterValue>
          </PoolParameter>
        )}
        {pricesApi && snapshotData.gamma !== null && (
          <PoolParameter>
            <PoolParameterTitle>Gamma:</PoolParameterTitle>
            <PoolParameterValue>{pricesApi ? convertNumber(snapshotData.gamma) : gamma}</PoolParameterValue>
          </PoolParameter>
        )}
        {pricesApi && snapshotData.allowed_extra_profit !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Allowed Extra Profit:`}</PoolParameterTitle>
            <PoolParameterValue>{convertNumber(snapshotData.allowed_extra_profit)}</PoolParameterValue>
          </PoolParameter>
        )}
        {pricesApi && snapshotData.fee_gamma !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Fee Gamma:`}</PoolParameterTitle>
            <PoolParameterValue>{convertNumber(snapshotData.fee_gamma)}</PoolParameterValue>
          </PoolParameter>
        )}
        {pricesApi && snapshotData.adjustment_step !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Adjustment Step:`}</PoolParameterTitle>
            <PoolParameterValue>{convertNumber(snapshotData.adjustment_step)}</PoolParameterValue>
          </PoolParameter>
        )}
        {pricesApi && snapshotData.ma_half_time !== null && (
          <PoolParameter>
            <PoolParameterTitle>{t`Moving Average Time:`}</PoolParameterTitle>
            <PoolParameterValue>{formatNumber(snapshotData.ma_half_time, { useGrouping: false })}</PoolParameterValue>
          </PoolParameter>
        )}
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

        {(snapshotData.xcp_profit || snapshotData.xcp_profit_a || snapshotData.offpeg_fee_multiplier) && pricesApi && (
          <StatsSection>
            {snapshotData.xcp_profit !== null && (
              <StatsContainer>
                <StatsSymbol>{t`Xcp Profit:`}</StatsSymbol>
                <StatsData>{convertNumber(snapshotData.xcp_profit)}</StatsData>
              </StatsContainer>
            )}
            {snapshotData.xcp_profit_a !== null && (
              <StatsContainer>
                <StatsSymbol>{t`Xcp Profit A:`}</StatsSymbol>
                <StatsData>{convertNumber(snapshotData.xcp_profit_a)}</StatsData>
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

const PoolParametersWrapper = styled(Box)`
  padding: 1.5rem 1rem;

  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem;
  }
`

const PoolParameter = styled.div<{ noBorder?: boolean }>`
  display: flex;
  justify-content: space-between;
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
  padding: calc(1.5rem + var(--spacing-2)) 1rem;
  row-gap: var(--spacing-3);
  display: flex;
  flex-direction: column;
`

const PoolParameterTitle = styled.p`
  font-weight: var(--semi-bold);
`

const PoolParameterValue = styled.p`
  font-weight: var(--bold);
`

const RampUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-2);
  background-color: var(--box--secondary--content--background-color);
`

const StatsSection = styled(Box)`
  display: flex;
  flex-direction: column;
`

const StatsSectionTitle = styled.h3``

const StatsTitle = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  opacity: 0.7;
`

const StatsContainer = styled(Box)`
  display: flex;
  margin-top: var(--spacing-1);
`

const StatsSymbol = styled.p`
  padding-right: var(--spacing-2);
  font-weight: var(--semi-bold);
`

const StatsData = styled.p`
  margin-left: auto;
  font-weight: var(--bold);
`

export default PoolParameters
