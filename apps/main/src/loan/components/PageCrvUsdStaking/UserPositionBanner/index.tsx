import styled from 'styled-components'
import { t } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import Image from 'next/image'

import useStore from '@/loan/store/useStore'
import { isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import { formatNumber } from '@ui/utils'
import { RCScrvUSDLogoSM } from 'ui/src/images'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

import Box from '@ui/Box'
import Loader from '@ui/Loader'
import Tooltip from '@ui/Tooltip'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusdStatistics'

const { MaxWidth } = SizesAndSpaces

type UserPositionBannerProps = {
  className?: string
  mobileBreakpoint: string
  chartExpanded: boolean
}

const UserPositionBanner: React.FC<UserPositionBannerProps> = ({ className, mobileBreakpoint, chartExpanded }) => {
  const { signerAddress, provider } = useWallet()
  const { data: statisticsData, isLoading: isStatisticsLoading } = useScrvUsdStatistics({ provider })
  const crvUsdRate = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const crvUsdRateLoading = useStore((state) => state.usdRates.loading)
  const userBalance = useStore((state) => state.scrvusd.userBalances[signerAddress ?? ''])
  const crvUsdExchangeRateFetchStatus = useStore((state) => state.scrvusd.crvUsdExchangeRate.fetchStatus)

  const userScrvUsdBalance = userBalance?.scrvUSD ?? '0'
  const userScrvUsdBalanceFormatted = formatNumber(userScrvUsdBalance, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
  const userBalanceLoading = !isReady(userBalance?.fetchStatus)
  const exchangeRateLoading = !isReady(crvUsdExchangeRateFetchStatus)

  const totalScrvUsdSupply = statisticsData?.supply ?? 0
  const totalScrvUsdSupplyFormatted = formatNumber(totalScrvUsdSupply, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const scrvUsdApy = statisticsData?.proj_apr ?? 0
  const scrvUsdApyFormatted = formatNumber(scrvUsdApy, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const userShareOfTotalScrvUsdSupply = BigNumber(userScrvUsdBalance).div(totalScrvUsdSupply).times(100).toString()
  const userShareOfTotalScrvUsdSupplyFormatted = formatNumber(userShareOfTotalScrvUsdSupply, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const userScrvUsdBalanceInUSD = formatNumber(BigNumber(userScrvUsdBalance).div(crvUsdRate).toString(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Wrapper className={className} chartExpanded={chartExpanded}>
      <Box>
        <Title>{t`YOUR CSV POSITION`}</Title>
      </Box>
      <StatsRow mobileBreakpoint={mobileBreakpoint}>
        <StatsItem>
          <StatsTitleWrapper>
            <StatsItemTitle>{t`Your scrvUSD balance`}</StatsItemTitle>
          </StatsTitleWrapper>
          {userBalanceLoading ? (
            <Loader isLightBg skeleton={[120, 26]} />
          ) : (
            <Box display="flex" flexAlignItems="center">
              <StatsItemValue>{userScrvUsdBalanceFormatted}</StatsItemValue>
              <StyledTokenIcon src={RCScrvUSDLogoSM} alt="scrvUSD" width={24} height={24} />
            </Box>
          )}
          {crvUsdRateLoading || exchangeRateLoading ? (
            <Loader isLightBg skeleton={[60, 14]} />
          ) : (
            <StatsDetailData>${userScrvUsdBalanceInUSD}</StatsDetailData>
          )}
        </StatsItem>
        <StatsItem>
          <StatsTitleWrapper>
            <StatsItemTitle>{t`Estimated APY`}</StatsItemTitle>
            <Tooltip
              showIcon
              minWidth="250px"
              tooltip={t`Annual percentage yield (APY) refers to how much interest is distributed on savings and takes compounded interest into account. 
This value is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
            />
          </StatsTitleWrapper>
          {isStatisticsLoading ? (
            <Loader isLightBg skeleton={[120, 26]} />
          ) : (
            <StatsItemValue>~{scrvUsdApyFormatted}%</StatsItemValue>
          )}
        </StatsItem>
        <StatsItem>
          <StatsTitleWrapper>
            <StatsItemTitle>{t`Your share of the vault`}</StatsItemTitle>
          </StatsTitleWrapper>
          {isStatisticsLoading ? (
            <Loader isLightBg skeleton={[120, 26]} />
          ) : (
            <StatsItemValue>{userShareOfTotalScrvUsdSupplyFormatted}%</StatsItemValue>
          )}
          {userBalanceLoading || isStatisticsLoading ? (
            <Loader isLightBg skeleton={[60, 14]} />
          ) : (
            <StatsDetailData>
              {userScrvUsdBalanceFormatted} / {totalScrvUsdSupplyFormatted}
            </StatsDetailData>
          )}
        </StatsItem>
      </StatsRow>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ chartExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--box--secondary--background-color);
  width: 100%;
  max-width: ${({ chartExpanded }) => (chartExpanded ? '100%' : MaxWidth.section)};
`

const StatsTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  @media (min-width: 26.625rem) {
    gap: var(--spacing-1);
  }
`

const Title = styled.h3`
  font-size: var(--font-size-4);
  color: var(--page--text-color);
`

const StyledTokenIcon = styled(Image)`
  margin-left: var(--spacing-1);
`

const StatsRow = styled.div<{ mobileBreakpoint: string }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  color: var(--page--text-color);
  @media (max-width: ${({ mobileBreakpoint }) => mobileBreakpoint}) {
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
`

const StatsItem = styled.div`
  display: flex;
  margin-right: auto;
  flex-direction: column;
`

const StatsItemTitle = styled.h5`
  font-size: var(--font-size-1);
  opacity: 0.5;
`

const StatsItemValue = styled.p`
  font-size: var(--font-size-5);
  font-weight: bold;
`

const StatsDetailData = styled.p`
  font-size: var(--font-size-1);
  opacity: 0.5;
  font-weight: var(--semi-bold);
`

export default UserPositionBanner
