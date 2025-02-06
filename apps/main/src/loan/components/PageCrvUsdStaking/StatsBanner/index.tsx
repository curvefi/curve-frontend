import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/loan/store/useStore'
import { isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import { formatNumber } from '@ui/utils'

import Box from '@ui/Box'
import Loader from '@ui/Loader'
import Tooltip from '@ui/Tooltip'
import { Sizing, Greens } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

type StatsBannerProps = {
  className?: string
}

const StatsBanner: React.FC<StatsBannerProps> = ({ className }) => {
  const pricesYieldData = useStore((state) => state.scrvusd.pricesYieldData)

  const exampleBalance = 100000

  const isLoadingPricesYieldData = !isReady(pricesYieldData.fetchStatus)

  const scrvUsdApy = pricesYieldData.data?.proj_apr || 0
  const oneMonthProjYield = formatNumber((scrvUsdApy / 100 / 12) * exampleBalance, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const oneYearProjYield = formatNumber((scrvUsdApy / 100) * exampleBalance, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Wrapper className={className}>
      <Box>
        <Title>{t`Your stablecoins could do more`}</Title>
        <Description>{t`With $100k of scrvUSD held you could get`}</Description>
      </Box>
      <StatsRow>
        <StatsItem>
          <StatsTitleWrapper>
            <StatsItemTitle>{t`30 Days Projection`}</StatsItemTitle>
            <Tooltip
              showIcon
              minWidth="250px"
              tooltip={t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
            />
          </StatsTitleWrapper>
          {isLoadingPricesYieldData ? (
            <Loader isLightBg skeleton={[120, 26]} />
          ) : (
            <StatsItemValue>~${oneMonthProjYield}</StatsItemValue>
          )}
        </StatsItem>
        <StatsItem>
          <StatsTitleWrapper>
            <StatsItemTitle>{t`1 Year Projection`}</StatsItemTitle>
            <Tooltip
              showIcon
              minWidth="250px"
              tooltip={t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
            />
          </StatsTitleWrapper>
          {isLoadingPricesYieldData ? (
            <Loader isLightBg skeleton={[120, 26]} />
          ) : (
            <StatsItemValue>~${oneYearProjYield}</StatsItemValue>
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
          {isLoadingPricesYieldData ? (
            <Loader isLightBg skeleton={[120, 26]} />
          ) : (
            <StatsItemValue>
              ~{formatNumber(scrvUsdApy, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </StatsItemValue>
          )}
        </StatsItem>
      </StatsRow>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  margin: 0 auto;
  background-color: ${Greens[100]};
  border: 1px solid ${Greens[500]};
  align-self: flex-start;
  width: 100%;
  max-width: calc(${MaxWidth.actionCard} + ${Sizing[200]} + ${MaxWidth.section}); // action card + gap + section
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
  font-size: var(--font-size-5);
  color: var(--black-100);
`

const Description = styled.p`
  color: var(--black-100);
  span {
    font-weight: bold;
  }
`

const StatsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  color: var(--black-100);
`

const StatsItem = styled.div`
  display: flex;
  margin-right: auto;
  flex-direction: column;
  min-width: 240px;
`

const StatsItemTitle = styled.h5`
  font-size: var(--font-size-1);
  opacity: 0.5;
`

const StatsItemValue = styled.p`
  font-size: var(--font-size-5);
  font-weight: bold;
`

export default StatsBanner
