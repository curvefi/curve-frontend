import lodash from 'lodash'
import { useMemo, type ReactElement } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import type { CellContext } from '@tanstack/react-table'
import { Icon } from '@ui/Icon'
import type { IconProps } from '@ui/Icon/Icon'
import { t } from '@ui-kit/lib/i18n'
import { UserPositionIndicator } from '@ui-kit/shared/ui/DataTable/UserPositionIndicator'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Address } from '@ui-kit/utils'
import { MarketTitle } from '@ui-kit/widgets/MarketTitle'
import type { PoolListItem } from '../../types'
import { PoolAlertBadge } from './PoolAlertBadge'
import { PoolAlertIcons } from './PoolAlertIcons'
import { PoolTokens } from './PoolTokens'

const { Spacing, Height } = SizesAndSpaces

const UserPositionTooltip = ({ children }: { children: ReactElement }) => (
  <Tooltip title={t`You have a balance in this pool`}>{children}</Tooltip>
)

export const PoolTitleCell = ({
  row: { original: poolData },
  column: { getFilterValue },
}: CellContext<PoolListItem, string>) => {
  const { tokenAddresses, tokens, tokenAddressesAll, pool, url, network } = poolData
  const tokenList = useMemo(
    () => lodash.zip(tokens, tokenAddresses).map(([symbol, address]) => ({ symbol: symbol!, address: address! })),
    [tokens, tokenAddresses],
  )
  const poolAlert = usePoolAlert(poolData)
  const tokenAlert = useTokenAlert(tokenAddressesAll)

  return (
    <Stack direction="row" sx={{ height: Height.row }}>
      {poolData.hasPosition && <UserPositionIndicator Tooltip={UserPositionTooltip} sx={{ alignSelf: 'stretch' }} />}
      <Stack direction="row" alignItems="center" gap={Spacing.sm}>
        <TokenIcons blockchainId={network} tokens={tokenList} />
        <Stack direction="column">
          <Stack direction="row" alignItems="center" gap={Spacing.xs}>
            <PoolAlertIcons poolAlert={poolAlert} tokenAlert={tokenAlert} />
            <MarketTitle url={url} address={pool.address as Address} title={pool.name} />
          </Stack>
          <PoolTokens tokenList={tokenList} filterValue={getFilterValue() as string} />
        </Stack>
      </Stack>

      {poolAlert && <PoolAlertBadge alert={poolAlert} />}
    </Stack>
  )
}

export const StyledIcon: IStyledComponent<'web', IconProps> = styled(Icon)`
  margin: var(--spacing-3) auto 0;
  color: var(--white);
`
