import type {
  PageMarketList,
  TableCellProps,
  TableRowProps,
  TableLabelsMapper,
} from '@/components/PageMarketList/types'

import React, { useRef, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

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
import CellRate from '@/components/SharedCellData/CellRate'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellToken from '@/components/SharedCellData/CellToken'
import CellUserVaultShares from '@/components/SharedCellData/CellUserVaultShares'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import TextCaption from '@/ui/TextCaption'

type Content = {
  sortIdKey: keyof TableLabelsMapper | ''
  label: string
  labels?: { sortIdKey: keyof TableLabelsMapper; label: string }[]
  show?: boolean
  showLine?: boolean
  content: React.ReactNode
}

const TableRowMobile = ({
  rChainId,
  api,
  owmId,
  owmDataCachedOrApi,
  isBorrow,
  loanExists,
  tableLabelsMapper,
  userActiveKey,
  handleCellClick,
}: Pick<PageMarketList, 'tableLabelsMapper'> & TableRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const userVaultShares = useStore((state) => state.user.marketsBalancesMapper[userActiveKey]?.vaultShares)

  const [showDetail, setShowDetail] = useState<string>('')

  const { signerAddress } = api ?? {}
  const { borrowed_token } = owmDataCachedOrApi?.owm ?? {}

  const isVisible = !!entry?.isIntersecting
  const isHideDetail = showDetail === owmId

  const cellProps: TableCellProps = {
    rChainId,
    rOwmId: owmId,
    owmId,
    owmDataCachedOrApi,
    userActiveKey,
    isBorrow,
    isBold: false,
    size: 'md',
  }

  const userHaveLoan = !!signerAddress && !!loanExists
  const someLoanExists = !!signerAddress && loanExists

  // prettier-ignore
  const content: { borrow: Content[][], supply: Content[][] } = {
    borrow: [
      [
        { sortIdKey: 'myDebt', label: tableLabelsMapper.myDebt.name, content: <CellLoanUserState userActiveKey={userActiveKey} type='debt' />, show: someLoanExists, showLine: true },
        { sortIdKey: 'myHealth', label: tableLabelsMapper.myHealth.name, content: <CellLoanUserHealth userActiveKey={userActiveKey} />, showLine: true, show: someLoanExists },
      ],
      [
        { sortIdKey: 'rateBorrow', label: tableLabelsMapper.rateBorrow.name, content: <CellRate {...cellProps} type='borrow' /> },
      ],
      [
        { sortIdKey: 'available', label: tableLabelsMapper.available.name, content: <CellCap {...cellProps} type='available' /> },
        { sortIdKey: 'totalDebt', label: tableLabelsMapper.totalDebt.name, content: <CellLoanTotalDebt {...cellProps} /> },
      ],
      [
        { sortIdKey: 'cap', label: tableLabelsMapper.cap.name, content: <CellCap {...cellProps} type='cap' /> },
        { sortIdKey: 'cap', label: tableLabelsMapper.utilization.name, content: <CellCap {...cellProps} type='utilization' /> },
      ],
      [
        { sortIdKey: 'totalCollateralValue', label: tableLabelsMapper.totalCollateralValue.name, content: <CellTotalCollateralValue {...cellProps} /> },
      ]
    ],
    supply: [
      [
        { sortIdKey: 'myVaultShares', label: tableLabelsMapper.myVaultShares.name, content: <CellUserVaultShares {...cellProps} />, show: !!signerAddress && typeof userVaultShares !== 'undefined' && +userVaultShares > 0, showLine: true }
      ],
      [
        { sortIdKey: 'tokenSupply', label: tableLabelsMapper.tokenSupply.name, content: <CellToken {...cellProps} type='borrowed' hideIcon /> },
      ],
      [
        { sortIdKey: '', label: t`Total APR`, content: <CellRewards {...cellProps} type='crv-other' /> }
      ]
    ]
  }

  return (
    <TableItem ref={ref} className={`row--info ${isVisible ? '' : 'pending'}`}>
      <TCell>
        <MobileLabelWrapper flexAlignItems="center" grid gridTemplateColumns={userHaveLoan ? '20px 1fr' : '1fr'}>
          {userHaveLoan && <CellInPool {...cellProps} isInMarket />}
          <MobileLabelContent>
            <Box flex gridGap={3} onClick={(evt) => handleCellClick()}>
              <Box>
                <TextCaption isBold isCaps>
                  Collateral
                </TextCaption>{' '}
                <CellToken {...cellProps} type="collateral" />
              </Box>
              <Box>
                <TextCaption isBold isCaps>
                  Borrow
                </TextCaption>{' '}
                <CellToken {...cellProps} type="borrowed" />
              </Box>
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
                  {content[isBorrow ? 'borrow' : 'supply'].map((details, idx) => {
                    const detailsKey = `details-${idx}`
                    const show = details.some(({ show }) => _showContent(show))
                    const showLine = details.some(({ showLine }) => showLine)
                    return (
                      show && (
                        <React.Fragment key={detailsKey}>
                          <DetailContent key={details[0].label}>
                            {details.map(({ label, labels, content, show }, idx) => {
                              const key = `detail-${label}-${idx}`
                              const detailsLength = details.length
                              const isLast = detailsLength - 1 === idx
                              return (
                                _showContent(show) && (
                                  <DetailWrapper key={key} detailsLength={detailsLength} isLast={isLast}>
                                    {typeof labels !== 'undefined' ? (
                                      <Box flex flexDirection="column">
                                        <TextCaption isBold isCaps>
                                          {label}
                                        </TextCaption>
                                        <TextCaption isBold isCaps>
                                          {labels.map(({ label }, idx) => {
                                            const isNotLast = idx !== labels.length - 1
                                            return (
                                              <React.Fragment key={`${key}-${label}`}>
                                                {label}
                                                {isNotLast && '+'}
                                              </React.Fragment>
                                            )
                                          })}
                                        </TextCaption>
                                      </Box>
                                    ) : (
                                      <TextCaption isBold isCaps>
                                        {label}
                                      </TextCaption>
                                    )}
                                    {content}
                                  </DetailWrapper>
                                )
                              )
                            })}
                          </DetailContent>
                          {showLine && <hr />}
                        </React.Fragment>
                      )
                    )
                  })}
                </DetailsContent>
                <MobileTableActions>
                  {isBorrow ? (
                    <Button variant="filled" onClick={(evt) => handleCellClick()}>
                      {loanExists ? t`Manage Loan` : t`Get Loan`}
                    </Button>
                  ) : (
                    <Button variant="filled" onClick={(evt) => handleCellClick()}>
                      {t`Supply ${borrowed_token?.symbol ?? ''}`}
                    </Button>
                  )}
                </MobileTableActions>
              </>
            )}
          </MobileTableContent>
        </MobileTableContentWrapper>
      </TCell>
    </TableItem>
  )
}

const DetailWrapper = styled.div<{ detailsLength: number; isLast: boolean }>`
  display: grid;
  grid-gap: var(--spacing-1);
  ${({ detailsLength }) => detailsLength === 1 && 'width: 100%'};
  ${({ isLast }) => !isLast && `margin-right: var(--spacing-narrow)`};
`

const DetailContent = styled.div`
  display: flex;
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

export default TableRowMobile
