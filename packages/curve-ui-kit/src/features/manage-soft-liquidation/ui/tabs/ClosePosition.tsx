import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Token } from '../../types'
import { AlertClosePosition } from '../AlertClosePosition'

const { Spacing } = SizesAndSpaces

type Status = 'idle' | 'close'

type ClosePositionProps = {
  /** The token that's been borrowed that has to be paid back */
  debtToken: Token
  /** The tokens the user gets when closing his position */
  collateralToRecover: (Token & { usd: number })[]
  /** Current operation status */
  status: Status
}

type ClosePositionCallbacks = {
  /** Called when close action is triggered */
  onClose: (
    debtToken: ClosePositionProps['debtToken'],
    collateralToRecover: ClosePositionProps['collateralToRecover'],
  ) => void
}

export type Props = ClosePositionProps & ClosePositionCallbacks

export const ClosePosition = ({ debtToken, collateralToRecover, status = 'idle', onClose }: Props) => (
  <Stack gap={Spacing.md} sx={{ padding: Spacing.md }}>
    <Stack direction="row" gap={Spacing.xs} justifyContent="space-around">
      <Metric
        label={t`Debt to repay`}
        value={debtToken.balance}
        valueOptions={{ decimals: 2, unit: { symbol: debtToken.symbol, position: 'suffix' }, abbreviate: true }}
        alignment="center"
        size="large"
      />

      <Metric
        label={t`Collateral to recover`}
        value={collateralToRecover.reduce((acc, x) => acc + x.usd, 0)}
        valueOptions={{ decimals: 2, unit: 'dollar' }}
        notional={collateralToRecover
          .filter((x) => x.balance ?? 0 > 0)
          .map((x) => ({
            value: x.balance!,
            unit: { symbol: ` ${x.symbol}`, position: 'suffix' },
            abbreviate: true,
          }))}
        alignment="center"
        size="large"
      />
    </Stack>

    <AlertClosePosition />

    <Button
      disabled={status === 'close'}
      onClick={() => onClose(debtToken, collateralToRecover)}
      sx={{ position: 'relative' }}
    >
      {t`Repay debt & close position`}
      {status === 'close' && <Spinner sx={{ position: 'absolute', right: Spacing.lg }} />}
    </Button>
  </Stack>
)
