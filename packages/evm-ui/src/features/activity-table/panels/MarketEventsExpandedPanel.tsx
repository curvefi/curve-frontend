import Stack from '@mui/material/Stack'
import { shortenString } from '@primitives/string.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { ActivityUsdValue } from '../cells/ActivityUsdValue'
import { LlammaTokenAmount } from '../cells/LlammaTokenAmount'
import type { MarketEventRow } from '../types'

export const MarketEventsExpandedPanel: ExpandedPanelComponent<MarketEventRow> = ({
  row: {
    original: { deposit, withdrawal, provider, blockchainId, collateralToken, borrowToken, timestamp },
  },
}) => (
  <Stack>
    {deposit && (
      <ActionInfo
        label={t`Amount`}
        valueColor="success"
        value={
          <LlammaTokenAmount amount={deposit.amount} blockchainId={blockchainId} token={collateralToken} showSymbol />
        }
        valueRight={<ActivityUsdValue amount={deposit.amount} amountUsd={deposit.amountUsd} timestamp={timestamp} />}
      />
    )}
    {withdrawal && (
      <>
        {!!withdrawal.amountCollateral && (
          <ActionInfo
            label={t`Collateral`}
            valueColor="error"
            value={
              <LlammaTokenAmount
                amount={withdrawal.amountCollateral}
                blockchainId={blockchainId}
                token={collateralToken}
                showSymbol
              />
            }
            valueRight={
              <ActivityUsdValue
                amount={withdrawal.amountCollateral}
                amountUsd={withdrawal.amountCollateralUsd}
                timestamp={timestamp}
              />
            }
          />
        )}
        {!!withdrawal.amountBorrowed && (
          <ActionInfo
            label={t`Borrowed`}
            valueColor="error"
            value={
              <LlammaTokenAmount
                amount={withdrawal.amountBorrowed}
                blockchainId={blockchainId}
                token={borrowToken}
                showSymbol
              />
            }
            valueRight={
              <ActivityUsdValue
                amount={withdrawal.amountBorrowed}
                amountUsd={withdrawal.amountBorrowedUsd}
                timestamp={timestamp}
              />
            }
          />
        )}
      </>
    )}
    <ActionInfo label={t`User`} value={shortenString(provider)} />
  </Stack>
)
