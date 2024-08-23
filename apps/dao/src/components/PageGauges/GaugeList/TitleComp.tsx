import styled from 'styled-components'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import TokenIcons from '@/components/TokenIcons'
import SmallLabel from '@/components/SmallLabel'

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
          {gaugeData.is_killed && <SmallLabel description={t`Killed`} isKilled />}
          {gaugeData.platform && <SmallLabel description={gaugeData.platform} />}
          {gaugeData.pool?.chain && <SmallLabel description={gaugeData.pool.chain} isNetwork />}
          {gaugeData.market?.chain && <SmallLabel description={gaugeData.market.chain} isNetwork />}
        </BoxedDataComp>
        <Title>{gaugeData.title}</Title>
        {gaugeData.tokens && (
          <SymbolsWrapper>
            {gaugeData.tokens.map((token, index) => (
              <TokenSymbol key={`${token.symbol}-${index}`}>{token.symbol}</TokenSymbol>
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
  margin-left: var(--spacing-2);
  @media (min-width: 33.125rem) {
    margin: auto 0 0 0.25rem;
  }
`

const SymbolsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-left: var(--spacing-2);
  @media (min-width: 33.125rem) {
    margin: auto 0 0 0.25rem;
  }
`

const TokenSymbol = styled.p`
  font-size: var(--font-size-2);
`

export default TitleComp
