import { styled } from 'styled-components'
import Chip from 'ui/src/Typography/Chip'
import PoolLabel from '@/dex/components/PoolLabel'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import Icon from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'
import type { PoolListItem } from '../types'

const addressSize = '80px'

export const PoolNameCell = ({ row: { original: poolData } }: CellContext<PoolListItem, string>) => (
  <Stack direction="row" marginInlineEnd={addressSize}>
    {poolData.hasPosition && (
      <Chip tooltip={t`You have a balance in this pool`} tooltipProps={{ placement: 'top-start' }}>
        <StyledIcon name="CurrencyDollar" size={16} />
      </Chip>
    )}
    <PoolLabel isVisible blockchainId={poolData.network} poolData={poolData} />
  </Stack>
)

export const StyledIcon = styled(Icon)`
  margin: var(--spacing-3) auto 0;
  color: var(--white);
`
