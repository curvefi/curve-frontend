import styled from 'styled-components'
import { t } from '@lingui/macro'

import { shortenTokenAddress } from '@/ui/utils'
import networks from '@/networks'
import Box from '@/ui/Box'
import TokenIcons from '@/components/TokenIcons'
import SmallLabel from '@/components/SmallLabel'
import CopyIconButton from '@/components/CopyIconButton'
import ExternalLinkIconButton from '@/components/ExternalLinkIconButton'

interface TitleCompProps {
  gaugeData: GaugeFormattedData
  imageBaseUrl: string
  gaugeAddress?: string
}

const TitleComp = ({ gaugeData, imageBaseUrl, gaugeAddress }: TitleCompProps) => {
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
        {gaugeAddress && (
          <Box flex flexGap="var(--spacing-1)">
            <GaugeAddress>{shortenTokenAddress(gaugeAddress)}</GaugeAddress>
            <ButtonsWrapper>
              <ExternalLinkIconButton
                href={networks[1].scanAddressPath(gaugeAddress ?? '')}
                tooltip={t`View gauge on explorer`}
              />
              <CopyIconButton copyContent={gaugeAddress ?? ''} tooltip={t`Copy gauge address`} />
            </ButtonsWrapper>
          </Box>
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

const GaugeAddress = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  margin-left: var(--spacing-2);
  @media (min-width: 33.125rem) {
    margin: 0 0 0 0.25rem;
  }
`

const ButtonsWrapper = styled.div`
  display: flex;
  gap: var(--spacing-1);
`

export default TitleComp
