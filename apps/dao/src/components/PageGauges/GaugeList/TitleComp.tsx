import styled from 'styled-components'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import TokenIcons from '@/components/TokenIcons'

interface TitleCompProps {
  gaugeData: GaugeFormattedData
  imageBaseUrl: string
}

const TitleComp = ({ gaugeData, imageBaseUrl }: TitleCompProps) => {
  return (
    <Wrapper>
      {gaugeData.tokens && <TokenIcons imageBaseUrl={imageBaseUrl} tokens={gaugeData.tokens} />}
      <Box flex flexColumn flexGap={'var(--spacing-1)'}>
        <BoxedDataComp>
          {gaugeData.is_killed && <BoxedData isKilled>{t`Killed`}</BoxedData>}
          {gaugeData.platform && <BoxedData>{gaugeData.platform}</BoxedData>}
          {gaugeData.pool?.chain && <BoxedData className="network">{gaugeData.pool.chain}</BoxedData>}
          {gaugeData.market?.chain && <BoxedData>{gaugeData.market.chain}</BoxedData>}
        </BoxedDataComp>
        <Title>{gaugeData.title}</Title>
        {gaugeData.tokens && (
          <SymbolsWrapper>
            {gaugeData.tokens.map((token) => (
              <TokenSymbol>{token.symbol}</TokenSymbol>
            ))}
          </SymbolsWrapper>
        )}
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-2);
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-1);
  grid-row: 1 / 2;
  margin-left: auto;
  margin-right: var(--spacing-2);
  @media (min-width: 33.125rem) {
    display: flex;
    flex-direction: row;
    margin-left: 0;
  }
`

const Title = styled.h3`
  font-size: var(--font-size-4);
  font-weight: var(--bold);
  margin: auto 0 0;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  margin-left: var(--spacing-2);
  @media (min-width: 33.125rem) {
    margin: auto 0 0 0.25rem;
  }
`

const SymbolsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-1);
  margin-left: var(--spacing-2);
  @media (min-width: 33.125rem) {
    margin: auto 0 0 0.25rem;
  }
`

const TokenSymbol = styled.p`
  font-size: var(--font-size-2);
`

const BoxedData = styled.p<{ isKilled?: boolean }>`
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
  margin: auto 0 0;
  border: 1px solid ${({ isKilled }) => (isKilled ? 'var(--chart-red)' : 'var(--gray-500);')};
  border-radius: 0.75rem;
  color: ${({ isKilled }) => (isKilled ? 'var(--chart-red)' : 'inherit')};
  @media (min-width: 33.125rem) {
    margin: 0;
  }
  &.network {
    color: var(--primary-400);
    border: 1px solid var(--primary-400);
  }
`

export default TitleComp
