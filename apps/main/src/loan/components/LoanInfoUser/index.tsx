import type { PageLoanManageProps } from '@/components/PageLoanManage/types'

import React, { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { breakpoints } from '@/ui/utils/responsive'
import { getHealthMode } from '@/components/DetailInfoHealth'
import useStore from '@/store/useStore'

import { SubTitle } from '@/components/LoanInfoLlamma/styles'
import Box from '@/ui/Box'
import PoolInfoData from '@/components/ChartOhlcWrapper'
import ChartUserBands from '@/components/LoanInfoUser/components/ChartUserBands'
import ChartUserLiquidationRange from '@/components/LoanInfoUser/components/ChartUserLiquidationRange'
import UserInfos from '@/components/LoanInfoUser/components/UserInfos'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

interface Props extends Pick<PageLoanManageProps, 'isReady' | 'llamma' | 'llammaId' | 'titleMapper'> {
  rChainId: ChainId
}

const LoanInfoUser = ({ isReady, llamma, llammaId, rChainId, titleMapper }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const { chartExpanded } = useStore((state) => state.ohlcCharts)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { userBands, healthFull, healthNotFull, userStatus } = userLoanDetails ?? {}
  const { activeBand } = loanDetails ?? {}
  const isSoftLiquidation = userStatus?.colorKey === 'soft_liquidation'

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)

  useEffect(() => {
    if (!isUndefined(activeBand) && healthFull && healthNotFull && userBands) {
      const fetchedHealthMode = getHealthMode(activeBand, '', userBands, '', healthFull, healthNotFull, false, '', '')
      setHealthMode(fetchedHealthMode)
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [activeBand, healthFull, healthNotFull, userBands])

  return (
    <Wrapper>
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
