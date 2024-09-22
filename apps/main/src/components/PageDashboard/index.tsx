import type { FormValues } from '@/components/PageDashboard/types'
import type { Params } from 'react-router'

import { t } from '@lingui/macro'
import { Fragment, useCallback, useEffect, useRef } from 'react'
import networks from '@/networks'
import styled from 'styled-components'

import { REFRESH_INTERVAL } from '@/constants'
import { breakpoints, shortenAccount } from '@/ui/utils'
import { sleep } from '@/utils'
import useStore from '@/store/useStore'

import { ExternalLink } from '@/ui/Link'
import Table from '@/ui/Table'
import TableHead from '@/components/PageDashboard/components/TableHead'
import TableRow from '@/components/PageDashboard/components/TableRow'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Summary from '@/components/PageDashboard/components/Summary'
import TableSortDialog from '@/components/PageDashboard/components/TableSortDialog'
import ConnectWallet from '@/components/ConnectWallet'

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
  const formValuesWalletAddressRef = useRef('')

  const activeKey = useStore((state) => state.dashboard.activeKey)
  const isValidWalletAddress = useStore((state) => state.dashboard.isValidWalletAddress[activeKey])
  const dashboardError = useStore((state) => state.dashboard.error)
  const dashboardLoading = useStore((state) => state.dashboard.loading)
  const formValues = useStore((state) => state.dashboard.formValues)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const poolsMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const result = useStore((state) => state.dashboard.walletPoolDatas[activeKey])
  const resultRewardsCrvCount = useStore((state) => state.dashboard.resultRewardsCrvCount)
  const resultRewardsOtherCount = useStore((state) => state.dashboard.resultRewardsOtherCount)
  const setFormValues = useStore((state) => state.dashboard.setFormValues)
  const provider = useStore((state) => state.wallet.getProvider(''))

  const { chainId, signerAddress } = curve ?? {}
  const haveBoost = networks[rChainId].forms.indexOf('BOOSTING') !== -1

  const TABLE_LABEL = {
    poolName: { name: t`Pool`, mobile: '' },
    baseApy: { name: t`Base vAPY`, mobile: '' },
    userCrvApy: { name: 'CRV', mobile: t`Rewards tAPR (CRV)` },
    incentivesRewardsApy: { name: t`Incentives`, mobile: t`Rewards tAPR (Incentives)` },
    liquidityUsd: { name: t`Balance`, mobile: '' },
    baseProfit: { name: t`USD Profits`, mobile: '' },
    crvProfit: { name: t`CRV Profits`, mobile: '' },
    claimableCrv: { name: t`Claimable Tokens`, mobile: '' },
  }

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(curve, isLoadingApi, rChainId, poolsMapper, updatedFormValues)
    },
    [curve, isLoadingApi, poolsMapper, rChainId, setFormValues]
  )

  // wallet address ref
  useEffect(() => {
    formValuesWalletAddressRef.current = formValues.walletAddress
  })

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

  const updateFormValuesWalletAddress = useCallback(async () => {
    await sleep(REFRESH_INTERVAL['1m'])
    if (!formValuesWalletAddressRef.current && curve?.signerAddress) {
      updateFormValues({ walletAddress: curve.signerAddress })
    }
  }, [curve?.signerAddress, updateFormValues])

  // if form address is empty, check and replace with wallet address
  useEffect(() => {
    if (!formValues.walletAddress) {
      updateFormValuesWalletAddress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.walletAddress])

  const colSpan = isXSmDown ? 1 : 5
  const haveMissingPools = networks[rChainId].missingPools?.length > 0

  return !provider ? (
    <ConnectWalletWrapper>
      <ConnectWallet
        description="Connect wallet to view dashboard"
        connectText="Connect Wallet"
        loadingText="Connecting"
      />
    </ConnectWalletWrapper>
  ) : (
    <>
      <Summary
        activeKey={activeKey}
        curve={curve}
        rChainId={rChainId}
        updateFormValues={updateFormValues}
        params={params}
      />
      <TableWrapper>
        <TableTitleWrapper>
          <TableSortDialog className="table-sort-dialog" tableLabel={TABLE_LABEL} updateFormValues={updateFormValues} />
        </TableTitleWrapper>
        <StyledTable>
          <TableHead
            tableLabel={TABLE_LABEL}
            loading={dashboardLoading}
            resultRewardsCrvCount={resultRewardsCrvCount}
            resultRewardsOtherCount={resultRewardsOtherCount}
            updateFormValues={updateFormValues}
          />
          <tbody>
            {dashboardLoading ? (
              <tr>
                <td colSpan={colSpan}>
                  <SpinnerWrapper>
                    <Spinner />
                  </SpinnerWrapper>
                </td>
              </tr>
            ) : !formValues.walletAddress || !provider ? (
              <tr>
                <td colSpan={colSpan}>
                  <SpinnerWrapper>{t`Please connect wallet or enter a wallet address to view active pools.`}</SpinnerWrapper>
                </td>
              </tr>
            ) : dashboardError ? (
              <tr>
                <td colSpan={colSpan}>
                  <SpinnerWrapper>{t`Unable to get pool list`}</SpinnerWrapper>
                </td>
              </tr>
            ) : !isValidWalletAddress || (isValidWalletAddress && result?.length === 0) ? (
              <tr>
                <td colSpan={colSpan}>
                  <StyledSpinnerWrapper>
                    {t`No active pool found for`}{' '}
                    {formValues.walletAddress ? shortenAccount(formValues.walletAddress) : ''}
                  </StyledSpinnerWrapper>
                </td>
              </tr>
            ) : result?.length > 0 ? (
              result.map((data) => {
                const poolId = data?.poolId
                const poolData = poolsMapper?.[poolId]
                return poolData ? (
                  <TableRow
                    key={poolId}
                    rChainId={rChainId}
                    poolData={poolData}
                    haveBoost={haveBoost}
                    tableLabel={TABLE_LABEL}
                    walletAddress={formValues.walletAddress}
                    walletPoolData={data}
                  />
                ) : null
              })
            ) : null}
          </tbody>
        </StyledTable>

        {!!signerAddress && haveMissingPools && (
          <MissingPoolDescription>
            {t`*This UI does not support the following pools:`}{' '}
            {networks[rChainId].missingPools.map((pool, idx) => {
              return (
                <Fragment key={pool.name}>
                  {idx === 0 ? '' : ', '}
                  <ExternalLink $noStyles href={pool.url}>
                    {pool.name}
                  </ExternalLink>
                </Fragment>
              )
            })}
            {t`. Please click on the pool name to view them on`} {networks[rChainId].orgUIPath}{' '}
          </MissingPoolDescription>
        )}
      </TableWrapper>
    </>
  )
}

const ConnectWalletWrapper = styled.div`
  padding-top: var(--spacing-5);
  margin: 0 auto auto;
  display: flex;
  justify-content: center;
  align-items: center;
`

const MissingPoolDescription = styled.p`
  padding: 1rem;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: var(--spacing-5) 0;
  width: calc(100% - 1rem);
`

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
