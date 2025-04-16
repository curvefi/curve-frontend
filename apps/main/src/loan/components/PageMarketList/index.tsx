import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import TableHead from '@/loan/components/PageMarketList/components/TableHead/TableHead'
import TableHeadMobile from '@/loan/components/PageMarketList/components/TableHead/TableHeadMobile'
import TableRowNoResult from '@/loan/components/PageMarketList/components/TableRow/TableRowNoResult'
import TableRowResult from '@/loan/components/PageMarketList/components/TableRow/TableRowResult'
import TableSettings from '@/loan/components/PageMarketList/components/TableSettings/TableSettings'
import type { PageCollateralList, TableLabel } from '@/loan/components/PageMarketList/types'
import { TITLE } from '@/loan/constants'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import { getActiveKey } from '@/loan/store/createCollateralListSlice'
import useStore from '@/loan/store/useStore'
import { useStablecoinConnection } from '@/loan/temp-lib'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import Table, { Tbody, Tr } from '@ui/Table'
import { breakpoints } from '@ui/utils'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const CollateralList = (pageProps: PageCollateralList) => {
  const { pageLoaded, rChainId, searchParams, updatePath } = pageProps

  const titleMapper = useTitleMapper()

  const activeKey = getActiveKey(rChainId, searchParams)
  const { lib: curve = null } = useStablecoinConnection()
  const prevActiveKey = useStore((state) => state.collateralList.activeKey)
  const formStatus = useStore((state) => state.collateralList.formStatus)
  const initialLoaded = useStore((state) => state.collateralList.initialLoaded)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const collateralDatas = useStore((state) => state.collaterals.collateralDatas[rChainId])
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const results = useStore((state) => state.collateralList.result)
  const resultCached = useStore((state) => state.storeCache.collateralList[activeKey])
  const loanExistsMapper = useStore((state) => state.loans.existsMapper)
  const fetchLoansDetails = useStore((state) => state.loans.fetchLoansDetails)
  const fetchUserLoanPartialDetails = useStore((state) => state.loans.fetchUserLoanPartialDetails)
  const setFormValues = useStore((state) => state.collateralList.setFormValues)

  const [showDetail, setShowDetail] = useState<string>('')

  const { signerAddress } = curve || {}

  const parsedResult =
    results[activeKey] ?? resultCached ?? (activeKey.charAt(0) === prevActiveKey.charAt(0) && results[prevActiveKey])

  const updateFormValues = useCallback(
    (shouldRefetch?: boolean) => {
      void setFormValues(rChainId, pageLoaded ? curve : null, shouldRefetch)
    },
    [setFormValues, rChainId, pageLoaded, curve],
  )

  // fetch partial user loan details
  const someLoanExists = useMemo(() => {
    if (!signerAddress) return false

    let loansExists = false

    if (parsedResult?.length > 0 && curve && loanExistsMapper && collateralDatasMapper && pageLoaded) {
      parsedResult.map((collateralId) => {
        const collateralData = collateralDatasMapper?.[collateralId]

        if (collateralData) {
          const loanExists = loanExistsMapper[collateralId]?.loanExists
          if (loanExists) {
            loansExists = true
            void fetchUserLoanPartialDetails(curve, collateralData.llamma)
          }
        }
      })
    }
    return loansExists
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve, collateralDatasMapper, pageLoaded, loanExistsMapper, parsedResult])

  useEffect(() => {
    if (pageLoaded && isPageVisible && initialLoaded) updateFormValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (pageLoaded && isPageVisible && !initialLoaded) {
      updateFormValues(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isPageVisible])

  usePageVisibleInterval(
    () => {
      //  re-fetch data
      if (curve && collateralDatas) {
        void fetchLoansDetails(curve, collateralDatas)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  // prettier-ignore
  const tableLabels: TableLabel[] = [
    { titleKey: TITLE.isInMarket, show: someLoanExists, className: 'left', width: '21px' },
    { titleKey: TITLE.name, className: 'left', width: '150px', indicatorPlacement: 'right' },
    { titleKey: TITLE.myHealth, show: someLoanExists, className: 'right', width: '120px' },
    { titleKey: TITLE.myDebt, show: someLoanExists, className: 'right', width: '120px' },
    { titleKey: TITLE.rate, className: 'right' },
    { titleKey: TITLE.totalBorrowed, className: 'right', width: '120px' },
    { titleKey: TITLE.cap, className: 'right', width: '120px' },
    { titleKey: TITLE.available, className: 'right', width: '120px' },
    { titleKey: TITLE.totalCollateral, className: 'right', width: '260px' },
  ]

  const colSpan = isMdUp ? 9 : 4

  return (
    <Wrapper>
      {/* MARKET LIST SETTINGS */}
      <TableSettings {...pageProps} tableLabels={tableLabels} someLoanExists={someLoanExists} />

      {/* MARKET LIST */}
      <Table cellPadding={0} cellSpacing={0}>
        {!isMdUp ? (
          <TableHeadMobile />
        ) : (
          <TableHead
            someLoanExists={someLoanExists}
            tableLabels={tableLabels}
            titleMapper={titleMapper}
            updatePath={updatePath}
          />
        )}
        <Tbody $borderBottom>
          {formStatus.noResult ? (
            <TableRowNoResult colSpan={colSpan} updatePath={updatePath} />
          ) : parsedResult ? (
            parsedResult.map((collateralId: string) => (
              <TableRowResult
                key={collateralId}
                {...pageProps}
                collateralId={collateralId}
                showDetail={showDetail}
                someLoanExists={someLoanExists}
                setShowDetail={setShowDetail}
              />
            ))
          ) : (
            <Tr>
              <td colSpan={colSpan}>
                <SpinnerWrapper>
                  <Spinner />
                </SpinnerWrapper>
              </td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding-bottom: var(--spacing-wide);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-bottom: 0;
  }
`

export default CollateralList
