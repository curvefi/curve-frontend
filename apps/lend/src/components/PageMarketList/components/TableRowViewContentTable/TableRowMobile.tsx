import type { TableCellProps, TableRowProps } from '@/components/PageMarketList/types'

import React, { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FilterType, SortId } from '@/components/PageMarketList/utils'
import { _showContent } from '@/utils/helpers'
import { breakpoints } from '@/ui/utils'
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
import CellRate from '@/components/SharedCellData/CellRate'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellToken from '@/components/SharedCellData/CellToken'
import CellUserVaultShares from '@/components/SharedCellData/CellUserVaultShares'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import CellMaxLeverage from '@/components/SharedCellData/CellMaxLeverage'
import TextCaption from '@/ui/TextCaption'

type Content = {
  sortIdKey: SortId
  show?: boolean
  showLine?: boolean
  content: React.ReactNode
}

const TableRowContent = ({
  rChainId,
  api,
  owmId,
  owmDataCachedOrApi,
  filterTypeKey,
  loanExists,
  userActiveKey,
  handleCellClick,
  tableLabelsMapper,
}: TableRowProps) => {
  const userVaultShares = useStore((state) => state.user.marketsBalancesMapper[userActiveKey]?.vaultShares)

  const [showDetail, setShowDetail] = useState<string>('')

  const { signerAddress } = api ?? {}
  const { borrowed_token } = owmDataCachedOrApi?.owm ?? {}

  const isHideDetail = showDetail === owmId
  const showMyVaultCell = !!signerAddress && typeof userVaultShares !== 'undefined' && +userVaultShares > 0

  const cellProps: TableCellProps = {
    rChainId,
    rOwmId: owmId,
    owmId,
    owmDataCachedOrApi,
    userActiveKey,
    filterTypeKey,
    isBold: false,
    size: 'md',
  }

  // prettier-ignore
  const content: { borrow: Content[][], supply: Content[][] } = {
    [FilterType.borrow]: [
      [
        { sortIdKey: SortId.myDebt, content: <CellLoanUserState userActiveKey={userActiveKey} type='debt' />, show: loanExists, showLine: true },
        { sortIdKey: SortId.myHealth, content: <CellLoanUserHealth userActiveKey={userActiveKey} />, show: loanExists, showLine: true },
      ],
      [
        { sortIdKey: SortId.rateBorrow, content: <CellRate {...cellProps} type='borrow' /> }
      ],
      [
        { sortIdKey: SortId.available, content: <CellCap {...cellProps} type='available' /> },
        { sortIdKey: SortId.totalDebt, content: <CellLoanTotalDebt {...cellProps} /> },
      ],
      [
        { sortIdKey: SortId.cap, content: <CellCap {...cellProps} type='cap' /> },
        { sortIdKey: SortId.cap, content: <CellCap {...cellProps} type='utilization' /> },
      ],
      [
        { sortIdKey: SortId.totalCollateralValue, content: <CellTotalCollateralValue {...cellProps} /> }
      ]
    ],
    [FilterType.supply]: [
      [
        { sortIdKey: SortId.myVaultShares, content: <CellUserVaultShares {...cellProps} />, show: showMyVaultCell, showLine: true }
      ],
      [
        { sortIdKey: SortId.totalApr, content: <CellRewards {...cellProps} type='crv-other' /> }
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
            <TokensWrapper>
              <Box>
                {filterTypeKey === 'borrow' ? (
                  <>
                    <TextCaption isBold isCaps>
                      Collateral
                    </TextCaption>{' '}
                    <CellToken {...cellProps} type="collateral" module="borrow" />
                  </>
                ) : (
                  <>
                    <TextCaption isBold isCaps>
                      Lend
                    </TextCaption>{' '}
                    <CellToken {...cellProps} type="borrowed" module="supply" />
                  </>
                )}
              </Box>
              <Box>
                {filterTypeKey === 'borrow' ? (
                  <>
                    <TextCaption isBold isCaps>
                      Borrow
                    </TextCaption>{' '}
                    <CellToken {...cellProps} type="borrowed" module="borrow" />
                  </>
                ) : (
                  <>
                    <TextCaption isBold isCaps>
                      Collatleral
                    </TextCaption>{' '}
                    <CellToken {...cellProps} type="collateral" module="supply" />
                  </>
                )}
              </Box>
            </TokensWrapper>
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
                      <DetailContent $detailsLength={details.length}>
                        {details.map(({ sortIdKey, content, show }, idx) => {
                          if (!_showContent(show)) return null

                          const label = tableLabelsMapper[sortIdKey]?.name ?? ''
                          const key = `detail-${label}-${idx}`
                          const detailsLength = details.length
                          const isLast = detailsLength - 1 === idx

                          return (
                            <DetailWrapper key={key} detailsLength={detailsLength} isLast={isLast}>
                              <TextCaption isBold isCaps>
                                {label}
                              </TextCaption>
                              {content}
                            </DetailWrapper>
                          )
                        })}
                      </DetailContent>
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

const DetailWrapper = styled.div<{ detailsLength: number; isLast: boolean }>`
  display: grid;
  grid-gap: var(--spacing-1);
  ${({ detailsLength }) => detailsLength === 1 && 'width: 100%'};
  ${({ isLast }) => !isLast && `margin-right: var(--spacing-narrow)`};
`

const DetailContent = styled.div<{ $detailsLength: number }>`
  display: grid;
  grid-template-columns: ${({ $detailsLength }) => `repeat(${$detailsLength}, 1fr)`};
  grid-gap: var(--spacing-1);
  margin-top: var(--spacing-2);
`

const DetailsContent = styled.div`
  margin-top: var(--spacing-3);

  > ${DetailContent}:not(:last-child) {
    margin-bottom: var(--spacing-3);
  }
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

const TokensWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: var(--spacing-1);

  @media (min-width: ${breakpoints.sm}rem) {
    grid-template-columns: 1fr 1fr;
  }
`

export default TableRowMobile
