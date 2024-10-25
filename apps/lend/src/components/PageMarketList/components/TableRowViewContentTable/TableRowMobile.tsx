import type { TableCellProps, TableRowProps } from '@/components/PageMarketList/types'

import React, { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { TITLE } from '@/constants'
import { FilterType } from '@/components/PageMarketList/utils'
import { _showContent } from '@/utils/helpers'
import useStore from '@/store/useStore'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { Tr } from '@/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import CellCap from '@/components/SharedCellData/CellCap'
import CellInPool from '@/components/SharedCellData/CellInPool'
import CellLoanUserState from '@/components/SharedCellData/CellLoanUserState'
import CellLoanUserHealth from '@/components/SharedCellData/CellLoanUserHealth'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellBorrowRate from '@/components/SharedCellData/CellBorrowRate'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellToken from '@/components/SharedCellData/CellToken'
import CellUserVaultShares from '@/components/SharedCellData/CellUserVaultShares'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import CellMaxLeverage from '@/components/SharedCellData/CellMaxLeverage'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'

type Content = {
  tableKey: TitleKey
  show?: boolean
  showLine?: boolean
  content: React.ReactNode
}

const TableRowContent = ({
  rChainId,
  api,
  owmId,
  market,
  filterTypeKey,
  loanExists,
  userActiveKey,
  titleMapper,
  handleCellClick,
}: TableRowProps) => {
  const userVaultShares = useStore((state) => state.user.marketsBalancesMapper[userActiveKey]?.vaultShares)

  const [showDetail, setShowDetail] = useState<string>('')

  const { signerAddress } = api ?? {}
  const { borrowed_token } = market ?? {}

  const isHideDetail = showDetail === owmId
  const showMyVaultCell = !!signerAddress && typeof userVaultShares !== 'undefined' && +userVaultShares > 0

  const cellProps: TableCellProps = {
    rChainId,
    rOwmId: owmId,
    owmId,
    market,
    userActiveKey,
    filterTypeKey,
    isBold: false,
    size: 'md',
  }

  // prettier-ignore
  const content: { borrow: Content[][], supply: Content[][] } = {
    [FilterType.borrow]: [
      [
        { tableKey: TITLE.myDebt, content: <CellLoanUserState userActiveKey={userActiveKey} type='debt' />, show: loanExists, showLine: true },
        { tableKey: TITLE.myHealth, content: <CellLoanUserHealth userActiveKey={userActiveKey} />, show: loanExists, showLine: true },
      ],
      [
        { tableKey: TITLE.rateBorrow, content: <CellBorrowRate {...cellProps} /> },
      ],
      [
        { tableKey: TITLE.available, content: <CellCap {...cellProps} type='available' /> },
        { tableKey: TITLE.totalDebt, content: <CellLoanTotalDebt {...cellProps} /> },
        { tableKey: TITLE.cap, content: <CellCap {...cellProps} type='cap' /> },
        { tableKey: TITLE.utilization, content: <CellCap {...cellProps} type='utilization' /> },
      ],
      [
        { tableKey: TITLE.totalCollateralValue, content: <CellTotalCollateralValue {...cellProps} /> }
      ]
    ],
    [FilterType.supply]: [
      [
        { tableKey: TITLE.myVaultShares, content: <CellUserVaultShares {...cellProps} />, show: showMyVaultCell, showLine: true }
      ],
      [
        { tableKey: TITLE.totalApr, content: <CellRewards {...cellProps} /> }
      ]
    ]
  }

  const showInMarket = filterTypeKey === 'borrow' ? loanExists : showMyVaultCell

  return (
    <TCell className="noPadding">
      <MobileLabelWrapper flexAlignItems="center" grid gridTemplateColumns={showInMarket ? '20px 1fr' : '1fr'}>
        {showInMarket && <CellInPool {...cellProps} isInMarket />}
        <MobileLabelContent>
          <Box onClick={() => handleCellClick()}>
            <StyledTokens>
              {filterTypeKey === 'borrow' ? (
                <StyledToken title={t`Collateral`}>
                  <CellToken {...cellProps} type="collateral" module="borrow" />
                </StyledToken>
              ) : (
                <StyledToken title={t`Lend`}>
                  <CellToken {...cellProps} type="borrowed" module="supply" />
                </StyledToken>
              )}
              {filterTypeKey === 'borrow' ? (
                <StyledToken title={t`Borrow`}>
                  <CellToken {...cellProps} type="borrowed" module="borrow" />
                </StyledToken>
              ) : (
                <StyledToken title={t`Collateral`}>
                  <CellToken {...cellProps} type="collateral" module="supply" />
                </StyledToken>
              )}
            </StyledTokens>
            <CellMaxLeverage {...cellProps} showTitle size="sm" />
          </Box>
          <IconButton onClick={() => setShowDetail((prevState) => (prevState === owmId ? '' : owmId))}>
            {isHideDetail ? <Icon name="ChevronDown" size={16} /> : <Icon name="ChevronUp" size={16} />}
          </IconButton>
        </MobileLabelContent>
      </MobileLabelWrapper>

      <MobileTableContentWrapper className={isHideDetail ? '' : 'show'}>
        <MobileTableContent>
          {!isHideDetail && (
            <>
              <DetailsContent onClick={(evt) => handleCellClick(evt.target)}>
                {content[filterTypeKey].map((details, idx) => {
                  const detailsKey = `details-${idx}`
                  const show = details.some(({ show }) => _showContent(show))

                  if (!show) return null

                  const showLine = details.some(({ showLine }) => showLine)

                  return (
                    <React.Fragment key={detailsKey}>
                      <ListInfoItems>
                        {details.map(({ tableKey, content, show }, idx) => {
                          if (!_showContent(show)) return null
                          return (
                            <ListInfoItem key={`info-${idx}`} {...titleMapper[tableKey]}>
                              {content}
                            </ListInfoItem>
                          )
                        })}
                      </ListInfoItems>
                      {showLine && <hr />}
                    </React.Fragment>
                  )
                })}
              </DetailsContent>
              <MobileTableActions>
                {filterTypeKey === FilterType.borrow ? (
                  <Button variant="filled" onClick={() => handleCellClick()}>
                    {loanExists ? t`Manage Loan` : t`Get Loan`}
                  </Button>
                ) : (
                  <Button variant="filled" onClick={() => handleCellClick()}>
                    {t`Lend ${borrowed_token?.symbol ?? ''}`}
                  </Button>
                )}
              </MobileTableActions>
            </>
          )}
        </MobileTableContent>
      </MobileTableContentWrapper>
    </TCell>
  )
}

const TableRowMobile = (props: TableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref)

  const isVisible = !!entry?.isIntersecting
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!isVisible || !ref.current || height !== 0) return

    setHeight(ref.current.getBoundingClientRect().height)
  }, [height, isVisible])

  return (
    <TableItem ref={ref} className={`row--info ${isVisible ? '' : 'pending'}`} rowHeight={height}>
      {isVisible && <TableRowContent {...props} />}
    </TableItem>
  )
}

const DetailsContent = styled(ListInfoItemsWrapper)`
  margin-top: var(--spacing-3);
`

const TableItem = styled(Tr)`
  border-top: 1px solid transparent;
`

const MobileLabelWrapper = styled(Box)`
  .row-in-pool {
    align-items: center;
    display: inline-flex;
    min-width: 1rem;
  }
`

const MobileLabelContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  padding: var(--spacing-1) 0 0 var(--spacing-2);
  width: 100%;
`

const MobileTableContent = styled.div`
  padding-top: 0;
  padding-left: var(--spacing-narrow);
  padding-right: var(--spacing-narrow);
  padding-bottom: var(--spacing-normal);
`

const MobileTableActions = styled.div`
  margin-top: 1rem;
`

const MobileTableContentWrapper = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);

  &.show {
    max-height: 100rem;
    transition: max-height 1s ease-in-out;
  }
`

const TCell = styled.td`
  border-bottom: 1px solid var(--border-400);
`

const StyledTokens = styled(ListInfoItems)`
  display: grid;
  grid-template-columns: 1fr 1fr;
`

const StyledToken = styled(ListInfoItem)`
  margin-bottom: 0;
`

export default TableRowMobile
