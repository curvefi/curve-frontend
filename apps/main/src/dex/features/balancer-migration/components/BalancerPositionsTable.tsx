import { sumBy } from 'lodash'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { Badge } from '@ui/components/Badge'
import { TokenInfo } from '@ui/components/TokenInfo'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import type { QueryProp } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { BalancerPosition } from '../api/balancer.api'
import { getBalancerIconTokens, getBalancerNetAprItems } from '../migration.utils'
import { MigrationPoolCell } from './MigrationPoolCell'
import { MigrationTableTitle } from './MigrationTableTitle'

/** Mainnet BAL, whose icon is the Balancer logo. */
const BAL_ADDRESS = '0xba100000625a3754423978a60c9317c58a424e3D'

const columnHelper = createAppColumnHelper<BalancerPosition>()

const getStakedUsd = ({ totalBalanceUsd, walletBalanceUsd }: BalancerPosition['userBalance']) =>
  totalBalanceUsd - walletBalanceUsd

const createColumns = (blockchainId: string) =>
  columnHelper.columns([
    columnHelper.accessor('name', {
      header: t`Pool`,
      cell: ({ row: { original: position } }) => (
        <MigrationPoolCell
          blockchainId={blockchainId}
          tokens={getBalancerIconTokens(position)}
          name={position.name}
          badges={
            <>
              <Badge size="extraSmall" label={t`Balancer v${position.protocolVersion}`} />
              <Badge size="extraSmall" label={position.type} />
              {getStakedUsd(position.userBalance) > 0.01 && (
                <Badge size="extraSmall" color="warning" label={t`Staked`} />
              )}
            </>
          }
        />
      ),
    }),
    columnHelper.accessor(({ userBalance }) => userBalance.totalBalanceUsd, {
      id: 'lpAmount',
      header: t`LP Amount`,
      cell: ({ row: { original: position } }) => (
        <TokenInfo
          icon={null}
          iconPosition="right"
          primary={formatNumber(Number(position.userBalance.totalBalance), 'token.balance')}
          secondary={formatNumber(position.userBalance.totalBalanceUsd, 'usd.notional')}
          boldPrimary
          sx={{ justifyContent: 'end' }}
        />
      ),
      meta: { type: 'numeric' },
    }),
    columnHelper.accessor(position => sumBy(getBalancerNetAprItems(position), 'apr'), {
      id: 'netApr',
      header: t`Net APR`,
      cell: ({ getValue, row: { original: position } }) => (
        <Tooltip
          clickable
          title={t`Net APR`}
          placement="top"
          body={
            <TooltipWrapper>
              <TooltipDescription text={t`Swap fees, yield-bearing tokens and rewards, as reported by Balancer.`} />
              <Stack>
                <TooltipItems secondary>
                  {getBalancerNetAprItems(position).map(({ title, apr }) => (
                    <TooltipItem key={title} title={title}>
                      {formatNumber(apr, 'percent.rate')}
                    </TooltipItem>
                  ))}
                </TooltipItems>
                <TooltipItems borderTop>
                  <TooltipItem variant="primary" title={t`Net total APR`}>
                    {formatNumber(getValue(), 'percent.rate')}
                  </TooltipItem>
                </TooltipItems>
              </Stack>
            </TooltipWrapper>
          }
        >
          <Typography variant="tableCellMBold">{formatNumber(getValue(), 'percent.rate')}</Typography>
        </Tooltip>
      ),
      meta: { type: 'numeric' },
    }),
  ])

export const BalancerPositionsTable = ({
  blockchainId,
  query,
  selectedId,
  onSelect,
  onReload,
}: {
  blockchainId: string
  query: QueryProp<BalancerPosition[]>
  selectedId: string | undefined
  onSelect: (position: BalancerPosition) => void
  onReload: () => Promise<unknown>
}) => {
  const table = useCurveTable({
    columns: createColumns(blockchainId),
    query,
    meta: { onRowClick: onSelect, isRowSelected: ({ id }) => id === selectedId },
    getRowId: ({ id }) => id,
    enableSorting: false,
  })
  return (
    <Stack data-testid="balancer-migration-positions">
      <MigrationTableTitle title={t`Balancer pool to migrate from`} logoToken={BAL_ADDRESS} />
      <EvmDataTable
        category="detail"
        table={table}
        emptyState={{
          title: t`No Balancer positions`,
          description: t`This wallet has no Balancer liquidity on this network.`,
        }}
        errorState={{ title: t`Couldn't load Balancer positions`, onReload }}
      />
    </Stack>
  )
}
