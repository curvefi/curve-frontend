import type { FormValues, DashboardTableRowProps, TableLabel } from '@/components/PageDashboard/types'
import type { Params } from 'react-router'
import type { Address } from 'viem'
import { t } from '@lingui/macro'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ROUTE } from '@/constants'
import { DashboardContextProvider } from '@/components/PageDashboard/dashboardContext'
import { breakpoints } from '@/ui/utils'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import { getPath } from '@/utils/utilsRouter'
import { isAddress } from 'viem'
import curvejsApi from '@/lib/curvejs'
import useStore from '@/store/useStore'
import ClassicPoolsOnlyDescription from '@/components/PageDashboard/components/ClassicPoolsOnlyDescription'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Summary from '@/components/PageDashboard/components/Summary'
import Table from '@/ui/Table'
import TableHead from '@/components/PageDashboard/components/TableHead'
import TableHeadMobile from '@/components/PageDashboard/components/TableHeadMobile'
import TableRow from '@/components/PageDashboard/components/TableRow'
import TableRowMobile from '@/components/PageDashboard/components/TableRowMobile'
import TableRowNoResult from '@/components/PageDashboard/components/TableRowNoResult'
import TableSortDialog from '@/components/PageDashboard/components/TableSortDialog'
import { getDashboardDataActiveKey } from '@/store/createDashboardSlice'

const Dashboard = ({
  curve,
  rChainId,
  params,
}: {
  curve: CurveApi | null
  rChainId: ChainId
  params: Readonly<Params<string>>
}) => {
  const isSubscribed = useRef(false)
  const navigate = useNavigate()

  const activeKey = useStore((state) => state.dashboard.activeKey)
  const formValues = useStore((state) => state.dashboard.formValues)
  const error = useStore((state) => state.dashboard.error)
  const dashboardDataPoolIds = useStore((state) => state.dashboard.dashboardDataPoolIds[activeKey])
  const dashboardDataActiveKey = getDashboardDataActiveKey(rChainId, formValues.walletAddress)
  const dashboardDataMapper = useStore((state) => state.dashboard.dashboardDatasMapper[dashboardDataActiveKey])
  const noResult = useStore((state) => state.dashboard.noResult)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const isLoading = useStore((state) => state.dashboard.loading)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const poolsMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const rewardsApyMapper = useStore((state) => state.pools.rewardsApyMapper[rChainId])
  const setFormValues = useStore((state) => state.dashboard.setFormValues)

  const { chainId, signerAddress } = curve ?? {}
  const { walletAddress } = formValues
  const { isLite } = useStore((state) => state.networks.networks[rChainId])
  const { userPoolBoost } = curvejsApi.wallet

  const imageBaseUrl = useMemo(() => getImageBaseUrl(rChainId), [rChainId])
  const isValidAddress = useMemo(() => isAddress(walletAddress as Address), [walletAddress])

  const TABLE_LABEL: TableLabel = {
    poolName: { name: t`Pool`, mobile: '' },
    userCrvApy: { name: 'CRV', mobile: t`Rewards tAPR (CRV)` },
    rewardBase: { name: t`Base vAPY`, mobile: '' },
    rewardOthers: { name: t`Incentives`, mobile: t`Rewards tAPR (Incentives)` },
    liquidityUsd: { name: t`Balance`, mobile: '' },
    profits: { name: t`Daily Profits`, mobile: '' },
    claimables: { name: t`Claimables`, mobile: t`Claimables` },
  }

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(rChainId, isLoadingApi ? null : curve, poolsMapper, updatedFormValues)
    },
    [curve, isLoadingApi, poolsMapper, rChainId, setFormValues],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  // curvejs change
  useEffect(() => {
    updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, isLoadingApi, haveAllPools, poolsMapper])

  // signerAddress
  useEffect(() => {
    if (signerAddress) {
      updateFormValues({ walletAddress: signerAddress })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress])

  const updatePath = useCallback(
    (poolId: string) => {
      const encodePoolId = encodeURIComponent(poolId)
      navigate(getPath(params, `${ROUTE.PAGE_POOLS}/${encodePoolId}${ROUTE.PAGE_POOL_DEPOSIT}`))
    },
    [navigate, params],
  )

  const colSpan = isXSmDown ? 1 : 5

  return (
    <DashboardContextProvider
      value={{
        rChainId,
        isLite,
        curve,
        chainId,
        signerAddress,
        activeKey,
        formValues,
        isLoading,
        isValidAddress,
        dashboardDataMapper,
        dashboardDataPoolIds,
        updateFormValues,
      }}
    >
      <Summary />
      <TableWrapper>
        <TableTitleWrapper>
          <TableSortDialog className="table-sort-dialog" tableLabel={TABLE_LABEL} />
        </TableTitleWrapper>
        <StyledTable>
          {isXSmDown ? <TableHeadMobile /> : <TableHead tableLabel={TABLE_LABEL} />}
          <tbody>
            {noResult || !!error || !isValidAddress ? (
              <TableRowNoResult colSpan={colSpan} noResult={noResult} error={error} />
            ) : dashboardDataPoolIds?.length > 0 ? (
              <>
                {dashboardDataPoolIds.map((poolId) => {
                  const poolData = poolsMapper?.[poolId]
                  const dashboardData = dashboardDataMapper?.[poolId]

                  if (!poolData || !dashboardData) return null

                  const tableRowProps: DashboardTableRowProps = {
                    rChainId,
                    isLite,
                    imageBaseUrl,
                    tableLabel: TABLE_LABEL,
                    fetchBoost: {
                      fetchUserPoolBoost: rChainId === 1 ? () => userPoolBoost(poolData.pool, walletAddress) : null,
                    },
                    formValues,
                    poolData,
                    poolRewardsApy: rewardsApyMapper?.[poolId],
                    dashboardData,
                    updatePath,
                  }

                  return isXSmDown ? (
                    <TableRowMobile key={poolId} {...tableRowProps} />
                  ) : (
                    <TableRow key={poolId} {...tableRowProps} />
                  )
                })}
              </>
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
      </TableWrapper>
      <ClassicPoolsOnlyDescription />
    </DashboardContextProvider>
  )
}

const StyledTable = styled(Table)`
  thead tr > th:first-child,
  tbody tr td:first-child {
    padding-left: 1rem;
  }

  th,
  th button {
    align-items: flex-end;
    vertical-align: bottom;
    font-size: var(--font-size-2);
    font-family: var(--table_head--font);
    font-weight: bold;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    tr.row--info {
      border-bottom: 1px solid var(--border-400);
    }

    tr.row--info td,
    th {
      padding: 0.75rem;
      height: 1px;
      line-height: 1;

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

    tr.row--info td:not(.row-in-pool),
    th {
      &:first-of-type {
        padding-left: 1rem;
      }

      &:last-of-type {
        padding-right: 1rem;
      }
    }
  }
`

const TableTitleWrapper = styled.div`
  margin: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 0;

    .table-sort-dialog {
      padding: 0 1rem;
    }
  }

  @media (min-width: ${breakpoints.md}rem) {
    padding-bottom: 0;

    .table-sort-dialog {
      display: none;
    }
  }
`

const TableWrapper = styled.div`
  padding: 1rem 0 5rem 0;
  background-color: var(--table--background-color);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 2rem 0 1rem 0;
  }

  @media (min-width: ${breakpoints.md}rem) {
    padding: 2rem 1rem 1rem 1rem;
  }
`

export default Dashboard
