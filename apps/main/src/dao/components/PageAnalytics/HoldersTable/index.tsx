import { useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { Column, PaginatedTable } from '@/dao/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/dao/components/PaginatedTable/TableRow'
import { useVeCrvHoldersQuery, type VeCrvHolder } from '@/dao/entities/vecrv-holders'
import type { AllHoldersSortBy } from '@/dao/types/dao.types'
import { formatHolderName, getEthPath } from '@/dao/utils'
import Stack from '@mui/material/Stack'
import { sortBy } from '@primitives/array.utils'
import { maybe } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { formatNumber } from '@ui-kit/utils'

type HoldersSort = {
  key: AllHoldersSortBy
  order: 'asc' | 'desc'
}

const getSortableHolderValue = (holder: VeCrvHolder, key: AllHoldersSortBy) =>
  key === 'unlockTime' ? (holder.unlockTime ?? 0) : Number(holder[key])

export const TopHoldersTable = () => {
  const {
    data: veCrvHolders = [],
    isLoading: holdersLoading,
    isError: holdersError,
    isSuccess: holdersSuccess,
    refetch: refetchHolders,
  } = useVeCrvHoldersQuery({})
  const [allHoldersSortBy, setAllHoldersSortBy] = useState<HoldersSort>({
    key: 'weightRatio',
    order: 'desc',
  })

  const tableMinWidth = 41.875

  const holdersArray = useMemo(
    () => sortBy(veCrvHolders, holder => getSortableHolderValue(holder, allHoldersSortBy.key), allHoldersSortBy.order),
    [allHoldersSortBy, veCrvHolders],
  )

  const HOLDERS_LABELS: Column<VeCrvHolder>[] = [
    { key: 'user', label: 'Holder', disabled: true },
    { key: 'weight', label: 'veCRV' },
    { key: 'locked', label: 'CRV Locked' },
    { key: 'weightRatio', label: '% veCRV' },
    { key: 'unlockTime', label: 'Unlock Time' },
  ]

  return (
    <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <PaginatedTable
        data={holdersArray}
        minWidth={tableMinWidth}
        isLoading={holdersLoading}
        isError={holdersError}
        isSuccess={holdersSuccess}
        columns={HOLDERS_LABELS}
        sortBy={allHoldersSortBy}
        errorMessage={t`An error occurred while veCRV holders data.`}
        setSortBy={key =>
          setAllHoldersSortBy(current => ({
            key: key as AllHoldersSortBy,
            order: current.key === key && current.order === 'desc' ? 'asc' : 'desc',
          }))
        }
        getData={() => void refetchHolders()}
        noDataMessage={t`No veCRV holders found.`}
        renderRow={(holder, index) => (
          <TableRowWrapper key={holder.user} columns={HOLDERS_LABELS.length}>
            <StyledTableDataLink className="align-left" href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${holder.user}`)}>
              <span>{index + 1}.</span>
              <span style={{ textDecoration: 'underline' }}>{formatHolderName(holder.user)}</span>
            </StyledTableDataLink>
            <TableData className={allHoldersSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}>
              {formatNumber(holder.weight, 'token.compact')}
            </TableData>
            <TableData className={allHoldersSortBy.key === 'locked' ? 'sortby-active right-padding' : 'right-padding'}>
              {formatNumber(holder.locked, 'token.compact')}
            </TableData>
            <TableData
              className={allHoldersSortBy.key === 'weightRatio' ? 'sortby-active right-padding' : 'right-padding'}
            >
              {formatNumber(holder.weightRatio, 'percent.value')}
            </TableData>
            <TableData
              className={allHoldersSortBy.key === 'unlockTime' ? 'sortby-active right-padding' : 'right-padding'}
            >
              {maybe(holder.unlockTime, formatDate) ?? 'N/A'}
            </TableData>
          </TableRowWrapper>
        )}
      />
    </Stack>
  )
}

const StyledTableDataLink = styled(TableDataLink)`
  text-decoration: none;
`
