import isUndefined from 'lodash/isUndefined'
import meanBy from 'lodash/meanBy'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import PoolInfoData from '@/loan/components/ChartOhlcWrapper'
import { getHealthMode } from '@/loan/components/DetailInfoHealth'
import { SubTitle } from '@/loan/components/LoanInfoLlamma/styles'
import ChartUserBands from '@/loan/components/LoanInfoUser/components/ChartUserBands'
import ChartUserLiquidationRange from '@/loan/components/LoanInfoUser/components/ChartUserLiquidationRange'
import UserInfos from '@/loan/components/LoanInfoUser/components/UserInfos'
import type { PageLoanManageProps } from '@/loan/components/PageLoanManage/types'
import { DEFAULT_HEALTH_MODE } from '@/loan/components/PageLoanManage/utils'
import { useCrvUsdSnapshots } from '@/loan/entities/crvusd-snapshots'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'
import type { Address } from '@curvefi/prices-api'
import Box from '@ui/Box'
import { breakpoints } from '@ui/utils/responsive'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { PositionDetails, type PositionDetailsProps } from '@ui-kit/shared/ui/PositionDetails'

interface Props extends Pick<PageLoanManageProps, 'llamma' | 'llammaId' | 'titleMapper'> {
  rChainId: ChainId
}

const LoanInfoUser = ({ llamma, llammaId, rChainId, titleMapper }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const { chartExpanded } = useStore((state) => state.ohlcCharts)
  const usdRatesLoading = useStore((state) => state.usdRates.loading)
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[llamma?.collateral ?? ''])

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId: networks[rChainId].id,
    contractAddress: llamma?.controller as Address,
  })

  const { userBands, healthFull, healthNotFull, userStatus } = userLoanDetails ?? {}
  const { oraclePriceBand } = loanDetails ?? {}
  const isSoftLiquidation = userStatus?.colorKey === 'soft_liquidation'

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)

  const sevenDayAvgRate = useMemo(() => {
    if (!crvUsdSnapshots) return null

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSnapshots = crvUsdSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > sevenDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ rate }) => rate) * 100
  }, [crvUsdSnapshots])

  const collateralValue = useMemo(() => {
    if (!collateralUsdRate || !userLoanDetails?.userState?.collateral) return null
    return (
      Number(userLoanDetails?.userState?.collateral) * Number(collateralUsdRate) +
      Number(userLoanDetails?.userState?.stablecoin)
    )
  }, [userLoanDetails?.userState?.collateral, userLoanDetails?.userState?.stablecoin, collateralUsdRate])

  useEffect(() => {
    if (!isUndefined(oraclePriceBand) && healthFull && healthNotFull && userBands) {
      const fetchedHealthMode = getHealthMode(
        oraclePriceBand,
        '',
        userBands,
        '',
        healthFull,
        healthNotFull,
        false,
        '',
        '',
      )
      setHealthMode(fetchedHealthMode)
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [oraclePriceBand, healthFull, healthNotFull, userBands])

  const positionDetailsProps: PositionDetailsProps = {
    app: 'crvusd',
    health: {
      value: healthMode.percent,
      loading: userLoanDetails?.loading ?? true,
    },
    borrowRate: {
      value: sevenDayAvgRate?.toString(),
      loading: isSnapshotsLoading,
    },
    accruedInterest: {
      value: '1',
      loading: userLoanDetails?.loading ?? true,
    },
    liquidationRange: {
      value: userLoanDetails?.userPrices,
      loading: userLoanDetails?.loading ?? true,
    },
    collateralValue: {
      value: collateralValue?.toString(),
      loading: (userLoanDetails?.loading ?? true) || usdRatesLoading,
    },
    ltv: {
      value: collateralValue ? ((Number(userLoanDetails?.userState?.debt) / collateralValue) * 100).toString() : null,
      loading: userLoanDetails?.loading ?? true,
    },
    totalDebt: {
      value: userLoanDetails?.userState?.debt,
      loading: userLoanDetails?.loading ?? true,
    },
  }

  return (
    <Wrapper>
      <PositionDetails {...positionDetailsProps} />
      <StatsWrapper className={`wrapper ${isSoftLiquidation ? 'alert' : 'first'}`}>
        <UserInfos
          llammaId={llammaId}
          llamma={llamma}
          isSoftLiquidation={isSoftLiquidation}
          healthMode={healthMode}
          titleMapper={titleMapper}
        />
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
        {isAdvancedMode ? (
          <ChartUserBands llammaId={llammaId} llamma={llamma} />
        ) : (
          <div>
            <SubTitle>{t`Liquidation Range`}</SubTitle>
            <ChartUserLiquidationRange llammaId={llammaId} healthMode={healthMode} />
          </div>
        )}
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .wrapper {
    border-bottom: 1px solid var(--border-600);
    display: grid;
    grid-row-gap: 2rem;
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

const PoolInfoWrapper = styled(Box)`
  width: 100%;
`

const PoolInfoContainer = styled(Box)`
  background-color: var(--tab-secondary--content--background-color);
`

export default LoanInfoUser
