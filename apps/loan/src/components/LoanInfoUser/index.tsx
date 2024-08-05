import type { BrushStartEndIndex } from '@/components/ChartBandBalances/types'
import type { PageLoanManageProps } from '@/components/PageLoanManage/types'

import { t } from '@lingui/macro'
import React, { useEffect, useMemo, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { breakpoints } from '@/ui/utils/responsive'
import { getHealthMode } from '@/components/DetailInfoHealth'
import { getTokenName } from '@/utils/utilsLoan'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import { SubTitle } from '@/components/LoanInfoLlamma/styles'
import AlertBox from '@/ui/AlertBox'
import PoolInfoData from '@/components/ChartOhlcWrapper'
import ChartBandBalances from '@/components/ChartBandBalances'
import DetailInfo from '@/ui/DetailInfo'
import ExternalLink from '@/ui/Link/ExternalLink'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import UserInfoStats from '@/components/LoanInfoUser/components/UserInfoStats'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import ChartLiquidationRange from '@/components/ChartLiquidationRange'
import TextCaption from '@/ui/TextCaption'
import Box from '@/ui/Box'

interface Props extends Pick<PageLoanManageProps, 'isReady' | 'llamma' | 'llammaId'> {
  rChainId: ChainId
}

const DEFAULT_BAND_CHART_DATA = {
  collateral: '0',
  collateralUsd: '0',
  isLiquidationBand: '',
  isOraclePriceBand: false,
  isNGrouped: false,
  n: '',
  p_up: '0',
  p_down: '0',
  pUpDownMedian: '',
  stablecoin: '0',
  collateralStablecoinUsd: 0,
}

const LoanInfoUser = ({ isReady, llamma, llammaId, rChainId }: Props) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const theme = useStore((state) => state.themeType)
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalances = useStore((state) => state.loans.userWalletBalancesMapper[llammaId])
  const { chartExpanded } = useStore((state) => state.ohlcCharts)

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)

  const {
    userPrices,
    userBands,
    userBandsBalances,
    userBandsPct,
    userState,
    healthFull,
    healthNotFull,
    userLoss,
    userStatus,
  } = userLoanDetails ?? {}
  const { activeBand, priceInfo } = loanDetails ?? {}
  const { oraclePrice, oraclePriceBand } = priceInfo ?? {}
  const { userPrices: currPrices } = userLoanDetails ?? {}
  const isSoftLiquidation = userStatus?.colorKey === 'soft_liquidation'

  useEffect(() => {
    if (!isUndefined(activeBand) && healthFull && healthNotFull && userBands) {
      const fetchedHealthMode = getHealthMode(activeBand, '', userBands, '', healthFull, healthNotFull, false, '', '')
      setHealthMode(fetchedHealthMode)
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [activeBand, healthFull, healthNotFull, userBands])

  const liqPriceRange = useMemo(() => {
    const [price1, price2] = userPrices ?? []
    const [band1, band2] = userBands ?? []

    if (!isUndefined(price1) && !isUndefined(price2) && !isUndefined(band1) && !isUndefined(band2)) {
      const parsedPrice1 = `${formatNumber(price1, { maximumFractionDigits: 2 })}`
      const parsedPrice2 = `${formatNumber(price2, { maximumFractionDigits: 2 })}`
      return { price1: parsedPrice1, price2: parsedPrice2, band1, band2 }
    }
  }, [userPrices, userBands])

  const chartBandBalancesData = useMemo(() => {
    const data = cloneDeep(userBandsBalances ?? [])
    if (data.length > 0 && typeof oraclePriceBand === 'number') {
      const firstN = data[0].n
      const lastN = data[data.length - 1].n
      if (oraclePriceBand > +firstN) {
        if (+firstN + 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          const n1 = +firstN + 1
          const n2 = oraclePriceBand - 1
          const showN1 = n1 === n2
          data.unshift({ ...DEFAULT_BAND_CHART_DATA, n: showN1 ? `${n1}` : `${n1}...${n2}`, isNGrouped: !showN1 })
        }
        data.unshift({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      } else if (oraclePriceBand < +lastN) {
        if (+lastN - 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          const n1 = +lastN - 1
          const n2 = oraclePriceBand + 1
          const showN1 = n1 === n2
          data.push({ ...DEFAULT_BAND_CHART_DATA, n: showN1 ? `${n1}` : `${n1}...${n2}`, isNGrouped: !showN1 })
        }
        data.push({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      }
    }
    return data
  }, [userBandsBalances, oraclePriceBand])

  const softLiquidationAmountText = useMemo(() => {
    let text = ''
    const { collateral = '0', stablecoin = '0' } = userState ?? {}
    text += +collateral > 0 ? `${formatNumber(collateral)} ${getTokenName(llamma).collateral}` : ''

    if (+stablecoin > 0) {
      const stablecoinText = `${formatNumber(stablecoin)} ${getTokenName(llamma).stablecoin}`
      if (text) {
        text += ` and ${stablecoinText}`
      } else {
        text += stablecoinText
      }
    }

    return text
  }, [llamma, userState])

  // default to empty data to show chart
  const liqRangeData = useMemo(() => {
    return [
      {
        name: '',
        currLabel: 'LR',
        curr: [+(currPrices?.[1] ?? '0'), +(currPrices?.[0] ?? '0')],
        newLabel: currPrices ? 'LR' : 'LR',
        new: [0, 0],
        oraclePrice: loanDetails?.priceInfo?.oraclePrice ?? '',
        oraclePriceBand: loanDetails?.priceInfo?.oraclePriceBand ?? 0,
      },
    ]
  }, [currPrices, loanDetails?.priceInfo])

  useEffect(() => {
    setBrushIndex({ startIndex: undefined, endIndex: undefined })
  }, [chartBandBalancesData])

  const liquidationRangeStats = (
    <UserInfoStats title={t`Liquidation range`}>
      {liqPriceRange && <strong>{`${liqPriceRange.price1} - ${liqPriceRange.price2}`}</strong>}
    </UserInfoStats>
  )

  return (
    <Wrapper>
      <StatsWrapper className={`wrapper ${isSoftLiquidation ? 'alert' : 'first'}`}>
        {isSoftLiquidation && (
          <AlertBox alertType="warning">
            <Box grid gridGap={3}>
              <p>{t`You are in soft-liquidation mode. The amount currently at risk is ${softLiquidationAmountText}. In this mode, you cannot partially withdraw or add more collateral to your position. To reduce the risk of hard liquidation, you can repay or, to exit soft liquidation, you can close (self-liquidate).`}</p>
              <p>
                {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
                <ExternalLink href="https://resources.curve.fi/crvusd/loan-details/#hard-liquidations" $noStyles>
                  Click here to learn more.
                </ExternalLink>
              </p>
            </Box>
          </AlertBox>
        )}
        <StatsContentWrapper rowGridTemplate={isAdvanceMode ? 'auto 1fr' : 'auto auto auto 1fr auto'}>
          <UserInfoStats title={t`Status`}>
            {userStatus && (
              <HealthColorText as="strong" colorKey={userStatus.colorKey}>
                {userStatus.label}
              </HealthColorText>
            )}
          </UserInfoStats>
          <UserInfoStats title={t`Health`}>
            {healthMode?.percent && userStatus && (
              <HealthColorText colorKey={userStatus.colorKey}>
                <strong>{formatNumber(healthMode.percent, FORMAT_OPTIONS.PERCENT)} </strong>
                <StyledIconTooltip minWidth="250px">
                  <Box grid gridGap={2}>
                    <p>{t`The loan metric indicates the current health of your position.`}</p>
                    <p>
                      {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
                      <ExternalLink href="https://resources.curve.fi/crvusd/loan-details/#hard-liquidations" $noStyles>
                        Click here to learn more.
                      </ExternalLink>
                    </p>
                  </Box>
                </StyledIconTooltip>
              </HealthColorText>
            )}
          </UserInfoStats>
          {!isAdvanceMode && (
            <>
              {liquidationRangeStats}
              <span></span>
              <UserInfoStats title={t`Borrow rate`}>
                <TableCellRate isBold parameters={loanDetails?.parameters} />
              </UserInfoStats>
            </>
          )}
        </StatsContentWrapper>

        {isAdvanceMode && (
          <StatsContentWrapper rowGridTemplate="auto auto auto 1fr auto">
            <UserInfoStats title={t`Liquidation range`}>
              {liqPriceRange && <strong>{`${liqPriceRange.price1} to ${liqPriceRange.price2}`}</strong>}
            </UserInfoStats>
            <UserInfoStats title={t`Band range`}>
              {liqPriceRange && <strong>{`${liqPriceRange.band1} to ${liqPriceRange.band2}`}</strong>}
            </UserInfoStats>
            <UserInfoStats title={t`Range %`}>
              {userBandsPct && <strong>{formatNumber(userBandsPct, FORMAT_OPTIONS.PERCENT)}</strong>}
            </UserInfoStats>
            <span></span>
            <UserInfoStats title={t`Borrow rate`}>
              <TableCellRate isBold parameters={loanDetails?.parameters} />
            </UserInfoStats>
          </StatsContentWrapper>
        )}

        <CollateralStatsWrapper>
          <SubTitle>Collateral</SubTitle>

          <StatsContentWrapper rowGridTemplate="auto  auto auto 1fr">
            <UserInfoStats
              title={t`Current balance (est.) / Deposited`}
              tooltip={t`Current balance (est.) is current balance minus losses.`}
            >
              {userLoss?.current_collateral_estimation && userLoss?.deposited_collateral && (
                <strong>
                  <strong>
                    {`${formatNumber(userLoss.current_collateral_estimation, {
                      trailingZeroDisplay: 'stripIfInteger',
                    })}`}{' '}
                  </strong>
                  <TextCaption>
                    /{' '}
                    {formatNumber(userLoss.deposited_collateral, {
                      trailingZeroDisplay: 'stripIfInteger',
                    })}
                  </TextCaption>
                </strong>
              )}
            </UserInfoStats>
            <UserInfoStats title={t`Loss amount`}>
              <strong>{formatNumber(userLoss?.loss)}</strong>
            </UserInfoStats>
            <UserInfoStats
              title={t`% lost`}
              tooltip={t`This metric measures the loss in collateral value caused by LLAMMA's soft liquidation process, which is activated when the oracle price falls within a user’s liquidation range.`}
              tooltipProps={{
                placement: 'top end',
                minWidth: '300px',
              }}
            >
              {userLoss?.loss_pct && <strong>{formatNumber(userLoss.loss_pct, FORMAT_OPTIONS.PERCENT)}</strong>}
            </UserInfoStats>
          </StatsContentWrapper>
        </CollateralStatsWrapper>
      </StatsWrapper>

      {!chartExpanded && (
        <div className="wrapper">
          <PoolInfoWrapper>
            <PoolInfoContainer>
              <PoolInfoData rChainId={rChainId} llamma={llamma} llammaId={llammaId} />
            </PoolInfoContainer>
          </PoolInfoWrapper>
        </div>
      )}

      <div className="wrapper">
        {isAdvanceMode ? (
          <>
            <ChartBandBalances
              brushIndex={brushIndex}
              data={chartBandBalancesData}
              llamma={llamma}
              oraclePrice={oraclePrice}
              oraclePriceBand={oraclePriceBand}
              showLiquidationIndicator={!!userLoanDetails?.userLiquidationBand}
              title={t`Bands`}
              setBrushIndex={setBrushIndex}
            />
          </>
        ) : (
          <div>
            <SubTitle>{t`Liquidation Range`}</SubTitle>
            <ChartLiquidationRange
              isDetailView
              isManage
              data={liqRangeData}
              healthColorKey={healthMode.colorKey}
              theme={theme}
            />
          </div>
        )}
      </div>

      <BalancesWrapper className="wrapper last">
        {/* user LLAMMA balances */}
        <div>
          <SubTitle>{t`LLAMMA Balances`}</SubTitle>
          <DetailInfo size="md" label={llamma ? getTokenName(llamma).stablecoin : ''}>
            {isReady && userState?.stablecoin && (
              <Chip size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(userState.stablecoin)}
              </Chip>
            )}
          </DetailInfo>
          <DetailInfo size="md" label={llamma ? getTokenName(llamma).collateral : ''}>
            {isReady && userState?.collateral && (
              <Chip size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(userState.collateral)}
              </Chip>
            )}
          </DetailInfo>
          <DetailInfo size="md" isDivider label={t`Total debt:`}>
            {isReady && userState?.debt && (
              <Chip size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(userState.debt)}
              </Chip>
            )}
          </DetailInfo>
        </div>

        {/* user wallet balances */}
        <div>
          <SubTitle>{t`Wallet Balances`}</SubTitle>
          <DetailInfo size="md" label={getTokenName(llamma).stablecoin}>
            {userWalletBalances?.stablecoin && (
              <Chip size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(userWalletBalances.stablecoin)}
              </Chip>
            )}
          </DetailInfo>
          <DetailInfo size="md" label={getTokenName(llamma).collateral}>
            {userWalletBalances?.collateral && (
              <Chip size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(userWalletBalances.collateral)}
              </Chip>
            )}
          </DetailInfo>
        </div>
      </BalancesWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .wrapper {
    border-bottom: 1px solid var(--border-600);
    display: grid;
    grid-row-gap: 1rem;
    padding: 2rem 0.75rem 1.5rem 0.75rem;

    @media (min-width: ${breakpoints.sm}rem) {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    &.first {
      @media (min-width: ${breakpoints.sm}rem) {
        padding-top: 2.5rem;
      }
    }

    &.last {
      border-bottom: none;
      padding-bottom: 1.5rem;

      @media (min-width: ${breakpoints.sm}rem) {
        padding-bottom: 2rem;
      }
    }
  }
`

const StatsWrapper = styled.div`
  &.alert > div:first-of-type {
    margin-bottom: 1rem;
  }

  &.wrapper {
    @media (min-width: ${breakpoints.sm}rem) {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }
`

const StatsContentWrapper = styled.div<{ rowGridTemplate: string }>`
  > div {
    display: grid;
    margin-bottom: 8px;

    // label
    .label {
      opacity: 0.7;
      white-space: nowrap;
    }
  }

  @media (min-width: ${breakpoints.sm}rem) {
    display: grid;
    grid-column-gap: 1.5rem;
    ${({ rowGridTemplate }) => {
      if (rowGridTemplate) {
        return `grid-template-columns: ${rowGridTemplate};`
      }
    }};

    > div {
      margin-bottom: 0;

      > strong {
        text-align: left;
      }
    }
  }
`

const BalancesWrapper = styled.div`
  &.wrapper {
    grid-row-gap: 2.5rem;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    grid-auto-flow: column;
    grid-column-gap: 2.5rem;
  }
`

const HealthColorText = styled.span<{ colorKey?: HeathColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}--color)`};
`

const CollateralStatsWrapper = styled.div`
  margin-top: 1rem;
`

const PoolInfoWrapper = styled(Box)`
  width: 100%;
`

const PoolInfoContainer = styled(Box)`
  background-color: var(--tab-secondary--content--background-color);
`

const StyledIconTooltip = styled(IconTooltip)`
  min-width: 0;

  @media (min-width: ${breakpoints.xs}rem) {
    min-width: auto;
  }
`

export default LoanInfoUser
