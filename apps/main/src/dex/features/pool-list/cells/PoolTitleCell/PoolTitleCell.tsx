import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import usePoolAlert from '@/dex/hooks/usePoolAlert'
import useTokenAlert from '@/dex/hooks/useTokenAlert'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import Icon from '@ui/Icon'
import Chip from '@ui/Typography/Chip'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Address } from '@ui-kit/utils'
import { MarketTitle } from '@ui-kit/widgets/MarketTitle'
import type { PoolListItem } from '../../types'
import { PoolAlertBadge } from './PoolAlertBadge'
import { PoolAlertTooltips } from './PoolAlertTooltips'
import { PoolTokens } from './PoolTokens'

const addressSize = '80px'

const { Spacing } = SizesAndSpaces

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
    <Stack direction="row" marginInlineEnd={addressSize}>
      {poolData.hasPosition && (
        <Chip tooltip={t`You have a balance in this pool`} tooltipProps={{ placement: 'top-start' }}>
          <StyledIcon name="CurrencyDollar" size={16} />
        </Chip>
      )}
      <Stack direction="row" alignItems="center" gap={Spacing.sm}>
        <TokenIcons blockchainId={network} tokens={tokenList} />
        <Stack direction="column">
          <Stack direction="row" alignItems="center">
            <PoolAlertTooltips poolAlert={poolAlert} tokenAlert={tokenAlert} />
            {/* isHighlightPoolName = default to true now, even if searched text is not same result */}
            {pool && <MarketTitle url={url} address={pool.address as Address} title={pool.name} />}
          </Stack>
          {pool && <PoolTokens tokenList={tokenList} filterValue={getFilterValue() as string} />}
        </Stack>
      </Stack>

      {poolAlert && <PoolAlertBadge alert={poolAlert} />}
    </Stack>
  )
}

export const StyledIcon = styled(Icon)`
  margin: var(--spacing-3) auto 0;
  color: var(--white);
`
