import lodash from 'lodash'
import { useMemo } from 'react'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { t } from '@evm-ui/lib/i18n'
import { CopyIconButton } from '@evm-ui/shared/ui/CopyIconButton'
import {
  CLICKABLE_IN_ROW_CLASS,
  DESKTOP_ONLY_HOVER_CLASS,
  type CurveTableFeatures,
} from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TableRowTitle } from '@evm-ui/shared/ui/DataTable/TableRowTitle'
import { UserPositionIndicator } from '@evm-ui/shared/ui/DataTable/UserPositionIndicator'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import type { LegacyPoolRow } from '../../types'
import { PoolAlertBadge } from './PoolAlertBadge'
import { PoolAlertIcons } from './PoolAlertIcons'
import { PoolTokens } from './PoolTokens'

const { Spacing, Height } = SizesAndSpaces

export const LegacyPoolTitleCell = ({
  row: { original: poolData },
  column,
}: CellContext<CurveTableFeatures, LegacyPoolRow, string>) => {
  const { tokenAddresses, tokens, tokenAddressesAll, pool, url, network } = poolData
  const tokenList = useMemo(
    () => lodash.zip(tokens, tokenAddresses).map(([symbol, address]) => ({ symbol: symbol!, address: address! })),
    [tokens, tokenAddresses],
  )
  const poolAlert = usePoolAlert({
    blockchainId: network,
    poolAddress: pool.address,
    hasVyperVulnerability: poolData.hasVyperVulnerability,
  })
  const tokenAlert = useTokenAlert(tokenAddressesAll)

  return (
    <Stack direction="row" sx={{ height: Height.row }}>
      {poolData.hasPosition && <UserPositionIndicator tooltipTitle={t`You have a balance in this pool`} />}
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
        <TokenIcons blockchainId={network} tokens={tokenList} />
        <Stack direction="column">
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <PoolAlertIcons poolAlert={poolAlert} tokenAlert={tokenAlert} />
            <TableRowTitle url={url} title={pool.name} testId={pool.address} />
            <CopyIconButton
              className={`${DESKTOP_ONLY_HOVER_CLASS} ${CLICKABLE_IN_ROW_CLASS}`}
              label={t`Copy pool address`}
              copyText={pool.address}
              confirmationText={t`Pool address copied`}
            />
          </Stack>
          <PoolTokens tokenList={tokenList} filterValue={column.getFilterValue() as string} />
        </Stack>
      </Stack>
      {poolAlert && <PoolAlertBadge alert={poolAlert} />}
    </Stack>
  )
}
