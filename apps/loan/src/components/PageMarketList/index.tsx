


import Box from '@/ui/Box'
import Button from '@/ui/Button'
import ExternalLink from '@/ui/Link/ExternalLink'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Table from '@/ui/Table'
import { breakpoints } from '@/ui/utils/responsive'
import { t } from '@lingui/macro'
import cloneDeep from 'lodash/cloneDeep'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import DialogSortContent from '@/components/PageMarketList/components/DialogSortContent'
import TableHead from '@/components/PageMarketList/components/TableHead'
import TableHeadMobile from '@/components/PageMarketList/components/TableHeadMobile'
import TableRow from '@/components/PageMarketList/components/TableRow'
import TableRowMobile from '@/components/PageMarketList/components/TableRowMobile'
import type { FormValues, PageCollateralList, TableRowProps } from '@/components/PageMarketList/types'
import { REFRESH_INTERVAL } from '@/constants'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useTitleMapper from '@/hooks/useTitleMapper'
import { DEFAULT_FORM_VALUES, getCollateralDatasCached } from '@/store/createCollateralListSlice'
import useStore from '@/store/useStore'
import { getLoanCreatePathname, getLoanManagePathname } from '@/utils/utilsRouter'

const CollateralList = ({ pageLoaded, params, rChainId }: PageCollateralList) => {
  const navigate = useNavigate()
  const settingsRef = useRef<HTMLDivElement>(null)
  const titleMapper = useTitleMapper()

  const curve = useStore((state) => state.curve)
  const activeKey = useStore((state) => state.collateralList.activeKey)
  const formStatus = useStore((state) => state.collateralList.formStatus)
  const formValues = useStore((state) => state.collateralList.formValues)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const collateralDatasCachedMapper = useStore((state) => state.storeCache.collateralDatasMapper[rChainId])
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const collateralDatas = useStore((state) => state.collaterals.collateralDatas[rChainId])
  const result = useStore((state) => state.collateralList.result[activeKey])
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const loanExistsMapper = useStore((state) => state.loans.existsMapper)
  const fetchLoansDetails = useStore((state) => state.loans.fetchLoansDetails)
  const fetchUserLoanPartialDetails = useStore((state) => state.loans.fetchUserLoanPartialDetails)
  const setFormValues = useStore((state) => state.collateralList.setFormValues)

  const [showDetail, setShowDetail] = useState<string>('')

  const { signerAddress } = curve || {}
  const collateralDatasCached = getCollateralDatasCached(collateralDatasCachedMapper)
  const collateralDatasCachedOrApi = collateralDatas ?? collateralDatasCached
  const isReady = collateralDatasCachedOrApi.length > 0

  const loansDetailsMapperState = useMemo(() => {
    return Object.keys(loansDetailsMapper).join(',')
  }, [loansDetailsMapper])

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(pageLoaded, rChainId, updatedFormValues, collateralDatasCachedOrApi, loansDetailsMapper)
    },
    [pageLoaded, rChainId, collateralDatasCachedOrApi, loansDetailsMapper, setFormValues]
  )

  usePageVisibleInterval(
    () => {
      //  re-fetch data
      if (curve && collateralDatas) {
        fetchLoansDetails(curve, collateralDatas)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible
  )

  // init
  useEffect(() => {
    let updatedFormValues: FormValues = {
      ...cloneDeep(formValues),
      filterKey: formValues.filterKey || 'all',
      sortBy: formValues.sortBy || 'rate',
      sortByOrder: formValues.sortByOrder || 'desc',
    }
    updateFormValues(updatedFormValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rChainId, isReady, isLoadingApi, loansDetailsMapperState])

  // fetch partial user loan details
  const someLoanExists = useMemo(() => {
    if (!signerAddress) return false

    let loansExists = false

    if (result?.length > 0 && curve && loanExistsMapper && collateralDatasMapper && !isLoadingApi) {
      result.map((collateralId) => {
        const collateralData = collateralDatasMapper?.[collateralId]

        if (collateralData) {
          const loanExists = loanExistsMapper[collateralId]?.loanExists
          if (loanExists) {
            loansExists = true
            fetchUserLoanPartialDetails(curve, collateralData.llamma)
          }
        }
      })
    }
    return loansExists
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve, collateralDatasMapper, isLoadingApi, loanExistsMapper, result])

  let colSpan = isMdUp ? 7 : 4
  const showMobileView = !isMdUp

  return (
    <>
      {showMobileView && (
        <Box ref={settingsRef} grid gridRowGap={2}>
          <TableFilterSettings>
            <Box flex gridColumnGap={2} margin="1rem 0 0 0.25rem">
              <DialogSortContent
                formValues={formValues}
                someLoanExists={someLoanExists}
                titleMapper={titleMapper}
                updateFormValues={updateFormValues}
              />
            </Box>
          </TableFilterSettings>
        </Box>
      )}
      <StyledTable cellPadding={0} cellSpacing={0}>
        {showMobileView ? (
          <TableHeadMobile />
        ) : (
          <TableHead
            formValues={formValues}
            isReadyDetail={!!loanExistsMapper && pageLoaded}
            someLoanExists={someLoanExists}
            titleMapper={titleMapper}
            updateFormValues={updateFormValues}
          />
        )}
        <tbody>
          {formStatus.noResult ? (
            <tr>
              <TableRowNotFound colSpan={colSpan}>
                {formValues.searchText.length > 0 ? (
                  formValues.filterKey === 'all' ? (
                    <>
                      {t`Didn't find what you're looking for?`}{' '}
                      <ExternalLink $noStyles href="https://t.me/curvefi">
                        {t`Join the Telegram`}
                      </ExternalLink>
                    </>
                  ) : (
                    <>
                      {t`No collateral found for "${formValues.searchText}". Feel free to search other tabs, or`}{' '}
                      <Button variant="text" onClick={() => updateFormValues(DEFAULT_FORM_VALUES)}>
                        {t`view all collateral.`}
                      </Button>
                    </>
                  )
                ) : (
                  <>{t`No collateral found in this category`}</>
                )}
              </TableRowNotFound>
            </tr>
          ) : result ? (
            result.map((collateralId: string) => {
              const loanExists = loanExistsMapper[collateralId]?.loanExists

              const handleCellClick = () => {
                if (loanExists) {
                  navigate(getLoanManagePathname(params, collateralId, 'loan'))
                } else {
                  navigate(getLoanCreatePathname(params, collateralId))
                }
              }

              const collateralDataCached = collateralDatasCachedMapper?.[collateralId]
              const collateralData = collateralDatasMapper?.[collateralId]

              const tableRowProps: TableRowProps = {
                rChainId,
                collateralId,
                collateralDataCachedOrApi: collateralData ?? collateralDataCached,
                loanDetails: loansDetailsMapper[collateralId],
                loanExists,
                handleCellClick,
              }

              return showMobileView ? (
                <TableRowMobile
                  key={collateralId}
                  {...tableRowProps}
                  showDetail={showDetail}
                  titleMapper={titleMapper}
                  setShowDetail={setShowDetail}
                />
              ) : (
                <TableRow key={collateralId} {...tableRowProps} someLoanExists={someLoanExists} />
              )
            })
          ) : (
            <tr>
              <td colSpan={colSpan}>
                <SpinnerWrapper>
                  <Spinner />
                </SpinnerWrapper>
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </>
  )
}

const TableRowNotFound = styled.td`
  padding: var(--spacing-5);
  text-align: center;
`

const TableFilterSettings = styled(Box)`
  align-items: flex-start;
  display: grid;
  margin: 1rem;
  grid-row-gap: var(--spacing-2);

  @media (min-width: ${breakpoints.lg}rem) {
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

const StyledTable = styled(Table)`
  background-color: var(--table--background-color);

  th,
  th button {
    align-items: flex-end;
    vertical-align: bottom;
    font-size: var(--font-size-2);
  }

  thead {
    border-bottom: 1px solid var(--border-400);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    tr.row--info {
      border-bottom: 1px solid var(--border-400);
    }

    tr:not(.disabled):not(.row-in-pool) > td {
      cursor: pointer;
    }

    tr.row--info td,
    th {
      height: 1px;
      line-height: 1;

      &.row-in-pool {
        padding-left: 0.375rem; //6px
        padding-right: 0.375rem; //6px
        padding-top: inherit;
        padding-bottom: inherit;
      }

      &.center {
        text-align: center;
      }

      &.left {
        justify-content: left;
        text-align: left;
      }

      &.right {
        justify-content: right;
        text-align: right;

        > div,
        > div button {
          justify-content: right;
          text-align: right;
        }
      }
    }
  }

  @media (min-width: ${breakpoints.md}rem) {
    tr.row--info td,
    th {
      padding: 0.75rem;
    }

    tr.row--info td:not(.row-in-pool),
    th {
      &:first-of-type {
        padding-left: 1rem;
      }

      &:last-of-type {
        padding-right: 1rem;
      }
    }

    .border-right {
      border-right: 1px solid var(--border-400);
    }
  }
`

export default CollateralList
