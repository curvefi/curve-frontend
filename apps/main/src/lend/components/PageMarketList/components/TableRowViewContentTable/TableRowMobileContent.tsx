import type { Content } from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableRowMobile'
import type { TableCellProps, TableRowProps } from '@/lend/components/PageMarketList/types'

import React, { useCallback, useRef } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FilterType } from '@/lend/components/PageMarketList/utils'
import { TITLE } from '@/lend/constants'
import { _showContent } from '@/lend/utils/helpers'
import Button from '@/ui/Button'
import CellBorrowRate from '@/lend/components/SharedCellData/CellBorrowRate'
import CellLoanUserState from '@/lend/components/SharedCellData/CellLoanUserState'
import CellLoanUserHealth from '@/lend/components/SharedCellData/CellLoanUserHealth'
import CellRewards from '@/lend/components/SharedCellData/CellRewards'
import CellTotalCollateralValue from '@/lend/components/SharedCellData/CellTotalCollateralValue'
import CellUtilization from '@/lend/components/SharedCellData/CellUtilization'
import CellUserVaultShares from '@/lend/components/SharedCellData/CellUserVaultShares'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'

type Props = TableRowProps & {
  cellProps: TableCellProps
  isHideDetail: boolean
  showMyVaultCell: boolean
}

const TableRowMobileContent = ({
  cellProps,
  filterTypeKey,
  handleCellClick,
  isHideDetail,
  loanExists,
  market,
  showMyVaultCell,
  titleMapper,
  userActiveKey,
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const { borrowed_token } = market ?? {}

  const handleTransitionEnd = useCallback(() => {
    if (!contentRef.current) return
    contentRef.current.style.overflow = isHideDetail ? 'hidden' : ''
  }, [isHideDetail])

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
        { tableKey: TITLE.utilization, content: <CellUtilization {...cellProps}  isMobile /> },
        { tableKey: TITLE.totalCollateralValue, content: <CellTotalCollateralValue {...cellProps} /> }
      ],
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

  return (
    <Wrapper ref={contentRef} className={isHideDetail ? '' : 'show'} onTransitionEnd={handleTransitionEnd}>
      <WrapperContent>
        {!isHideDetail && (
          <>
            <Content onClick={(evt) => handleCellClick(evt.target)}>
              {content[filterTypeKey].map((details, idx) => {
                const key = `details-${idx}`
                const isVisible = details.some(({ show }) => _showContent(show))
                const showLine = details.some(({ showLine }) => showLine)

                return (
                  <React.Fragment key={key}>
                    {isVisible && (
                      <>
                        <ListInfoItems>
                          {details.map(({ tableKey, content, show }, idx) => {
                            const visible = _showContent(show)

                            return (
                              <React.Fragment key={`${key}info${idx}`}>
                                {visible && <ListInfoItem {...titleMapper[tableKey]}>{content}</ListInfoItem>}
                              </React.Fragment>
                            )
                          })}
                        </ListInfoItems>
                        {showLine && <hr />}
                      </>
                    )}
                  </React.Fragment>
                )
              })}
            </Content>
            <ContentActions>
              {filterTypeKey === FilterType.borrow ? (
                <Button variant="filled" onClick={() => handleCellClick()}>
                  {loanExists ? t`Manage Loan` : t`Get Loan`}
                </Button>
              ) : (
                <Button variant="filled" onClick={() => handleCellClick()}>
                  {t`Lend ${borrowed_token?.symbol ?? ''}`}
                </Button>
              )}
            </ContentActions>
          </>
        )}
      </WrapperContent>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-height: 0;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);

  &.show {
    max-height: 100rem;
    transition: max-height 1s ease-in-out;
  }
`

const WrapperContent = styled.div`
  padding-top: 0;
  padding-left: var(--spacing-narrow);
  padding-right: var(--spacing-narrow);
  padding-bottom: var(--spacing-normal);
`

const Content = styled(ListInfoItemsWrapper)`
  margin-top: var(--spacing-3);
`

const ContentActions = styled.div`
  margin-top: 1rem;
`

export default TableRowMobileContent
