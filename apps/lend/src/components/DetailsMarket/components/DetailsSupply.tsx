import React from 'react'
import { t } from '@lingui/macro'

import {
  Content,
  ContentStat,
  ContentStats,
  ContentStatTitle,
  ContentStatValue,
  DarkContent,
  Wrapper,
} from '@/components/DetailsMarket/styles'
import CellCap from '@/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellRate from '@/components/SharedCellData/CellRate'
import CellToken from '@/components/SharedCellData/CellToken'
import CellSupplyTotalLiquidity from '@/components/SharedCellData/CellSupplyTotalLiquidity'
import DetailsSupplyRewards from '@/components/DetailsMarket/components/DetailsSupplyRewards'
import DetailsContracts from '@/components/DetailsMarket/components/DetailsContracts'

const DetailsSupply = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, owmDataCachedOrApi, borrowed_token, collateral_token } = pageProps

  const cellProps = {
    rChainId,
    rOwmId,
    owmDataCachedOrApi,
    size: 'md' as const,
  }

  const details = [
    [
      { title: t`Supply token`, value: <CellToken {...cellProps} type="borrowed" /> },
      { title: t`Lend APY`, value: <CellRate {...cellProps} type="supply" /> },
      { title: 'TVL', value: <CellSupplyTotalLiquidity {...cellProps} /> },
    ],
    [
      { title: t`Available`, value: <CellCap {...cellProps} type="available" /> },
      { title: t`Total Debt`, value: <CellLoanTotalDebt {...cellProps} /> },
      { title: t`Total supplied`, value: <CellCap {...cellProps} type="cap" /> },
      { title: t`Utilization %`, value: <CellCap {...cellProps} type="utilization" /> },
    ],
  ]

  return (
    <Wrapper>
      {/* stats */}
      <Content paddingTop>
        {details.map((detailSection) => {
          return (
            <ContentStats key={detailSection[0].title}>
              {detailSection.map(({ title, value }) => {
                return (
                  <ContentStat key={`detail-${title}`}>
                    <ContentStatTitle>{title}</ContentStatTitle>
                    <ContentStatValue>{value}</ContentStatValue>
                  </ContentStat>
                )
              })}
            </ContentStats>
          )
        })}

        <DetailsSupplyRewards rChainId={rChainId} rOwmId={rOwmId} />
      </Content>

      <DarkContent>
        <DetailsContracts
          rChainId={rChainId}
          owmDataCachedOrApi={owmDataCachedOrApi}
          borrowed_token={borrowed_token}
          collateral_token={collateral_token}
          type={type}
        />
      </DarkContent>
    </Wrapper>
  )
}

export default DetailsSupply
