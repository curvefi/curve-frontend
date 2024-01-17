import type { PageCollateralList, TableLabel } from '@/components/PageMarketList/types'
import type { TableRowProps } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React, { useRef } from 'react'
import styled from 'styled-components'

import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'
import useStore from '@/store/useStore'

import { Item, TCellInPool } from '@/components/PageMarketList/components/TableRow'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import CollateralLabel from '@/components/CollateralLabel'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import TableCellAvailable from '@/components/PageMarketList/components/TableCellAvailable'
import TableCellCap from '@/components/PageMarketList/components/TableCellCap'
import TableCellInPool from '@/components/PageMarketList/components/TableCellInPool'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import TableCellTotalCollateral from '@/components/PageMarketList/components/TableCellTotalCollateral'
import TableCellTotalBorrowed from '@/components/PageMarketList/components/TableCellTotalBorrowed'
import TableCellUserDebt from '@/components/PageMarketList/components/TableCellUserDebt'
import TableCellUserHealth from '@/components/PageMarketList/components/TableCellUserHealth'

const TableRowMobile = ({
  className,
  rChainId,
  collateralId,
  collateralData,
  collateralDataCachedOrApi,
  loanDetails,
  loanExists,
  showDetail,
  tableLabel,
  handleCellClick,
  setShowDetail,
}: Pick<PageCollateralList, 'rChainId'> &
  TableRowProps & {
    showDetail: string
    tableLabel: TableLabel
    setShowDetail: React.Dispatch<React.SetStateAction<string>>
  }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const userDetails = useStore((state) => state.loans.userDetailsMapper[collateralId])

  const isVisible = !!entry?.isIntersecting
  const isShowDetail = showDetail === collateralId

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
            <CollateralLabel
              chainId={rChainId}
              isVisible={isVisible}
              collateralData={collateralDataCachedOrApi}
              tableListProps={{
                onClick: handleCellClick,
              }}
            />
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
          <MobileTableContent>
            {isShowDetail && (
              <>
                {loanExists && (
                  <>
                    <div>
                      <span>{tableLabel.myDebt.name}</span>
                      <span>
                        <TableCellUserHealth userHealth={userDetails?.userHealth} />
                      </span>
                    </div>
                    <div>
                      <span>{tableLabel.myHealth.name}</span>
                      <span>
                        <TableCellUserDebt userDebt={userDetails?.userState?.debt} />
                      </span>
                    </div>
                    <hr />
                  </>
                )}
                <div>
                  <span>{tableLabel.rate.name}</span>
                  <span>
                    <TableCellRate parameters={loanDetails?.parameters} />
                  </span>
                </div>
                <div>
                  <span>{tableLabel.totalBorrowed.name}</span>
                  <span>
                    <TableCellTotalBorrowed totalDebt={loanDetails?.totalDebt} />
                  </span>
                </div>
                <div>
                  <span>{tableLabel.cap.name}</span>
                  <span>
                    <TableCellCap cap={loanDetails?.capAndAvailable?.cap} />
                  </span>
                </div>
                <div>
                  <span>{tableLabel.available.name}</span>
                  <span>
                    <TableCellAvailable available={loanDetails?.capAndAvailable?.available} />
                  </span>
                </div>
                <div>
                  <span>{tableLabel.totalCollateral.name}</span>
                  <span>
                    <TableCellTotalCollateral llamma={collateralData?.llamma} loanDetails={loanDetails} />
                  </span>
                </div>
                <MobileTableActions>
                  <Button variant="filled" onClick={handleCellClick}>
                    {loanExists ? t`Manage Loan` : t`Create Loan`}
                  </Button>
                </MobileTableActions>
              </>
            )}
          </MobileTableContent>
        </MobileTableContentWrapper>
      </TCell>
    </Item>
  )
}

TableRowMobile.defaultProps = {
  className: '',
}

const MobileLabelWrapper = styled(Box)`
  .row-in-pool {
    align-items: center;
    display: inline-flex;
    min-width: 1rem;
  }
`

const MobileLabelContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px;
  width: 100%;
`

const MobileTableContent = styled.div`
  min-height: 150px;
  padding: 1rem 1rem 0.75rem 1rem;

  > div {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
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
