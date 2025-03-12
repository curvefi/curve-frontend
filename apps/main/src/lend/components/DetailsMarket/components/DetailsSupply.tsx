import { ReactNode } from 'react'
import styled from 'styled-components'
import DetailsContracts from '@/lend/components/DetailsMarket/components/DetailsContracts'
import DetailsSupplyRewards from '@/lend/components/DetailsMarket/components/DetailsSupplyRewards'
import MarketParameters from '@/lend/components/DetailsMarket/components/MarketParameters'
import { ContentWrapper, DarkContent } from '@/lend/components/DetailsMarket/styles'
import CellCap from '@/lend/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/lend/components/SharedCellData/CellLoanTotalDebt'
import CellSupplyTotalLiquidity from '@/lend/components/SharedCellData/CellSupplyTotalLiquidity'
import CellToken from '@/lend/components/SharedCellData/CellToken'
import { TITLE } from '@/lend/constants'
import { MarketListType, PageContentProps, TitleKey } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'
import { breakpoints } from '@ui/utils'

const DetailsSupply = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, market, titleMapper } = pageProps

  const cellProps = {
    rChainId,
    rOwmId,
    market,
    size: 'md' as const,
  }

  const contents: { titleKey: TitleKey; content: ReactNode }[][] = [
    [
      { titleKey: TITLE.tokenSupply, content: <CellToken {...cellProps} type="borrowed" module="supply" /> },
      { titleKey: TITLE.tokenCollateral, content: <CellToken {...cellProps} type="collateral" module="supply" /> },
    ],
    [
      { titleKey: TITLE.available, content: <CellCap {...cellProps} type="available" /> },
      { titleKey: TITLE.totalDebt, content: <CellLoanTotalDebt {...cellProps} /> },
      { titleKey: TITLE.cap, content: <CellCap {...cellProps} type="cap" /> },
      { titleKey: TITLE.totalLiquidity, content: <CellSupplyTotalLiquidity {...cellProps} /> },
    ],
  ]

  return (
    <Wrapper>
      {/* stats */}
      <ContentWrapper paddingTop>
        <ListInfoItemsWrapper>
          {contents.map((groupedContents, idx) => (
            <ListInfoItems key={`contents${idx}`}>
              {groupedContents.map(({ titleKey, content }, idx) => (
                <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
                  {content}
                </ListInfoItem>
              ))}
            </ListInfoItems>
          ))}
        </ListInfoItemsWrapper>

        <DetailsSupplyRewards rChainId={rChainId} rOwmId={rOwmId} />
      </ContentWrapper>

      <StyledDarkContent>
        <Box grid gridGap={3}>
          <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type="supply" />
          <div>
            <DetailsContracts rChainId={rChainId} market={market} type={type} />
          </div>
        </Box>
      </StyledDarkContent>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;

  @media (min-width: ${breakpoints.lg}rem) {
    grid-template-columns: 1fr auto;
  }
`

const StyledDarkContent = styled(DarkContent)`
  min-width: 18.75rem; //300px;
`

export default DetailsSupply
