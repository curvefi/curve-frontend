import { styled } from 'styled-components'
import { CopyIconButton } from '@/dao/components/CopyIconButton'
import { ExternalLinkIconButton } from '@/dao/components/ExternalLinkIconButton'
import { SmallLabel } from '@/dao/components/SmallLabel'
import { networks } from '@/dao/networks'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { Box } from '@ui/Box'
import { scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { shortenAddress } from '@ui-kit/utils'

interface TitleCompProps {
  gaugeData: GaugeFormattedData
  gaugeAddress?: string
}

export const TitleComp = ({ gaugeData, gaugeAddress }: TitleCompProps) => (
  <Wrapper>
    {gaugeData.tokens && (
      <TokenIcons blockchainId={gaugeData?.pool?.chain ?? gaugeData?.market?.chain ?? ''} tokens={gaugeData.tokens} />
    )}
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
          <GaugeAddress>{shortenAddress(gaugeAddress)}</GaugeAddress>
          <ButtonsWrapper>
            <ExternalLinkIconButton
              href={scanAddressPath(networks[1], gaugeAddress ?? '')}
              tooltip={t`View gauge on explorer`}
            />
            <CopyIconButton copyContent={gaugeAddress ?? ''} tooltip={t`Copy gauge address`} />
          </ButtonsWrapper>
        </Box>
      )}
    </Box>
  </Wrapper>
)

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
