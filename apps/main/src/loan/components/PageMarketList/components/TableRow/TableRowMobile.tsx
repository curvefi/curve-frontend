import type { TableRowProps } from '@/loan/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { TITLE } from '@/loan/constants'
import useIntersectionObserver from '@ui/hooks/useIntersectionObserver'

import { Tr, CellInPool } from '@ui/Table'
import Box from '@ui/Box'
import Button from '@ui/Button'
import TokenLabel from '@/loan/components/TokenLabel'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'
import TableCellUtilization from '@/loan/components/SharedCells/TableCellUtilization'
import TableCellRate from '@/loan/components/SharedCells/TableCellRate'
import TableCellTotalCollateral from '@/loan/components/SharedCells/TableCellTotalCollateral'
import TableCellUser from '@/loan/components/SharedCells/TableCellUser'

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
    <Tr ref={ref} className={`${className} row--info ${isVisible ? '' : 'pending'}`}>
      <td>
        <MobileLabelWrapper grid gridTemplateColumns={loanExists ? 'auto 1fr' : '1fr'}>
          {loanExists && (
            <CellInPool as="div" isMobile isIn type="market" tooltip={t`You have a balance in this market`} />
          )}
          <Box grid gridTemplateColumns="1fr auto" fillWidth padding="0 0 0 var(--spacing-narrow)">
            <TokenLabel showAlert {...props} type="collateral" onClick={handleCellClick} />
            <IconButton onClick={() => setShowDetail((prevState) => (prevState === collateralId ? '' : collateralId))}>
              {isShowDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
            </IconButton>
          </Box>
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
      </td>
    </Tr>
  )
}

const MobileLabelWrapper = styled(Box)`
  min-height: 50px;
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

export default TableRowMobile
