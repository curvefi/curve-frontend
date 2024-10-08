import styled from 'styled-components'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'

type StatsBannerProps = {
  className?: string
}

const StatsBanner: React.FC<StatsBannerProps> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <Box>
        <Title>{t`YOUR STABLECOINS COULD DO MORE.`}</Title>
        <Description>
          {t`You have `} <span>~$1.42M</span> {t` worth of stablecoin in your wallet. Earn while you hold it!`}
        </Description>
      </Box>
      <StatsRow>
        <StatsItem>
          <StatsItemTitle>{t`30 Days Projection`}</StatsItemTitle>
          <StatsItemValue>+$8.4k</StatsItemValue>
        </StatsItem>
        <StatsItem>
          <StatsItemTitle>{t`1 Year Projection`}</StatsItemTitle>
          <StatsItemValue>+$100.08k</StatsItemValue>
        </StatsItem>
        <StatsItem>
          <StatsItemTitle>{t`scrvUSD APY`}</StatsItemTitle>
          <StatsItemValue>12.14%</StatsItemValue>
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
  background-color: #d4f7e3;
  border: 1px solid #1fa25e;
`

const Title = styled.h3`
  font-size: var(--font-size-5);
`

const Description = styled.p`
  span {
    color: var(--primary-400);
    font-weight: bold;
  }
`

const StatsRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`

const StatsItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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
