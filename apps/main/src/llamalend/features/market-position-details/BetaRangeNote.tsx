import {
  formatCompositionLabels,
  formatPriceDistanceDescription,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import Alert, { type AlertProps } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { t } from '@ui/lib/i18n'

type Note = { title: string; body: string; severity: AlertProps['severity'] }

const rangeNote = (view: BorrowPositionView, collateralSymbol: string, borrowSymbol: string): Note | undefined => {
  const converted = formatCompositionLabels(view.composition)?.borrowed
  const inRange = t`LLAMMA converts your ${collateralSymbol} to ${borrowSymbol} as the price falls through the range, and back as it rises. Each conversion costs a little of your liquidation buffer, and the position can be liquidated once the buffer drops below 0%.`
  switch (view.status?.severity) {
    case 'near':
      return {
        title: t`Close to your liquidation range`,
        body: `${view.distance.data ? `${formatPriceDistanceDescription(view.distance.data)}. ` : ''}${inRange}`,
        severity: 'info',
      }
    case 'inRange':
      return {
        title: t`In your liquidation range`,
        body: `${converted ? t`${converted} of your collateral is now ${borrowSymbol}. ` : ''}${inRange} ${t`You can't add collateral until the price leaves the range, but repaying debt raises the buffer.`}`,
        severity: 'warning',
      }
    case 'below':
      return {
        title: t`Below your liquidation range`,
        body: t`LLAMMA has converted your ${collateralSymbol} to ${borrowSymbol}, so price moves no longer cost buffer. Conversions resume if the price comes back into the range.`,
        severity: 'warning',
      }
    case 'liquidatable':
      return {
        title: t`Your position can be liquidated`,
        body: t`The liquidation buffer is below 0%, so anyone can liquidate the position. Repay debt or close it to keep what's left.`,
        severity: 'error',
      }
    default:
      return undefined
  }
}

/** What the liquidation range does, shown only once the price is near or inside it. */
export const BetaRangeNote = ({
  view,
  collateralSymbol,
  borrowSymbol,
}: {
  view: BorrowPositionView
  collateralSymbol: string
  borrowSymbol: string
}) => {
  const note = rangeNote(view, collateralSymbol, borrowSymbol)
  return (
    note && (
      <Alert data-testid="position-range-note" variant="outlined" severity={note.severity}>
        <AlertTitle>{note.title}</AlertTitle>
        <Typography variant="bodyXsRegular">{note.body}</Typography>
      </Alert>
    )
  )
}
