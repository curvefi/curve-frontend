import type { TableRowProps } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { TITLE } from '@/constants'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import { Item, TCellInPool } from '@/components/PageMarketList/components/TableRow'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import TokenLabel from '@/components/TokenLabel'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import TableCellUtilization from '@/components/PageMarketList/components/TableCellUtilization'
import TableCellInPool from '@/components/PageMarketList/components/TableCellInPool'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import TableCellTotalCollateral from '@/components/PageMarketList/components/TableCellTotalCollateral'
import TableCellUser from '@/components/PageMarketList/components/TableCellUser'

const TableRowMobile = ({
  className = '',
  rChainId,
  collateralId,
  collateralDataCachedOrApi,
  loanExists,
  showDetail,
  titleMapper,
  handleCellClick,
  setShowDetail,
}: TableRowProps & {
  showDetail: string
  titleMapper: TitleMapper
  setShowDetail: React.Dispatch<React.SetStateAction<string>>
}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const isVisible = !!entry?.isIntersecting
  const isShowDetail = showDetail === collateralId

  const props = { rChainId, collateralId, collateralDataCachedOrApi }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: React.ReactNode; show?: boolean; isBorder?: boolean }[][] = [
    [
      { titleKey: TITLE.myHealth, content: <TableCellUser {...props} type='health' />, show: loanExists },
      { titleKey: TITLE.myDebt, content: <TableCellUser {...props} type='debt' />, show: loanExists, isBorder: true }
    ],
    [
      { titleKey: TITLE.rate, content: <TableCellRate {...props} /> },
    ],
    [
      { titleKey: TITLE.available, content: <TableCellUtilization {...props} type='available' /> },
      { titleKey: TITLE.cap, content: <TableCellUtilization {...props} type='cap' /> },
      { titleKey: TITLE.totalBorrowed, content: <TableCellUtilization {...props} type='borrowed' /> },
    ],
    [
      { titleKey: TITLE.totalCollateral, content: <TableCellTotalCollateral {...props} /> },
    ]
  ]

  return (
    <Item ref={ref} className={`${className} row--info ${isVisible ? '' : 'pending'}`}>
      <TCell>
        <MobileLabelWrapper flex>
          {loanExists && (
            <TCellInPool as="div" className={`row-in-pool ${loanExists ? 'active' : ''} `}>
              <TableCellInPool />
            </TCellInPool>
          )}
          <MobileLabelContent>
            <Box grid gridTemplateColumns="1fr 1fr">
              <TokenLabel showAlert {...props} type="collateral" />
            </Box>
            <IconButton
              onClick={() =>
                setShowDetail((prevState) => {
                  return prevState === collateralId ? '' : collateralId
                })
              }
            >
              {isShowDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
            </IconButton>
          </MobileLabelContent>
        </MobileLabelWrapper>

        <MobileTableContentWrapper className={isShowDetail ? 'show' : ''}>
          <StyledListInfoItemsWrapper>
            {isShowDetail && (
              <>
                {contents.map((groupedTds, idx) => {
                  const shows = groupedTds.filter(({ show }) => typeof show !== 'undefined')

                  // hide section if section have show but it is false
                  if (shows.length !== 0 && shows.every(({ show }) => !show)) return null

                  return (
                    <ListInfoItems key={`contents${idx}`}>
                      {groupedTds.map(({ titleKey, content, isBorder }, idx) => (
                        <React.Fragment key={`td${idx}`}>
                          <ListInfoItem {...titleMapper[titleKey]}>{content}</ListInfoItem>
                          {isBorder && <hr />}
                        </React.Fragment>
                      ))}
                    </ListInfoItems>
                  )
                })}

                <MobileTableActions>
                  <Button variant="filled" onClick={handleCellClick}>
                    {loanExists ? t`Manage Loan` : t`Create Loan`}
                  </Button>
                </MobileTableActions>
              </>
            )}
          </StyledListInfoItemsWrapper>
        </MobileTableContentWrapper>
      </TCell>
    </Item>
  )
}

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
  padding: 4px;
  width: 100%;
`

const StyledListInfoItemsWrapper = styled(ListInfoItemsWrapper)`
  padding: var(--spacing-narrow);
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

export default TableRowMobile
