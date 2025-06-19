import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ButtonMenu } from '@ui-kit/shared/ui/ButtonMenu'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Token } from '../../types'
import { AlertCollateralAtRisk } from '../AlertCollateralAtRisk'

const { Spacing } = SizesAndSpaces

const BUTTON_OPTIONS = [
  { id: 'approve-limited' as const, label: t`Approve limited` },
  { id: 'approve-infinite' as const, label: t`Approve infinite` },
]

type OptionId = (typeof BUTTON_OPTIONS)[number]['id']
type Status = 'idle' | 'repay' | OptionId

type ClosePositionProps = {
  /** The token that's been borrowed that has to be paid back */
  debtToken: Token
  /** The token that's been used as collateral for the loan */
  collateralToken: Token
  /** Current operation status */
  status: Status
}

type ClosePositionCallbacks = {
  /** Called when close action is triggered */
  onClose: (debtToken: Token, collateralToken: Token) => void
  /** Called when limited approval is requested */
  onApproveLimited: () => void
  /** Called when infinite approval is requested */
  onApproveInfinite: () => void
}

export type Props = ClosePositionProps & ClosePositionCallbacks

export const ClosePosition = ({
  debtToken,
  collateralToken,
  status = 'idle',
  onClose: onRepay,
  onApproveLimited,
  onApproveInfinite,
}: Props) => {
  const [isOpen, open, close] = useSwitch(false)

  const BUTTON_OPTION_CALLBACKS: Record<OptionId, () => void> = {
    'approve-limited': onApproveLimited,
    'approve-infinite': onApproveInfinite,
  }

  return (
    <Stack gap={Spacing.md} sx={{ padding: Spacing.md }}>
      <Stack direction="row" gap={Spacing.xs} justifyContent="space-around">
        <Metric
          label={t`Debt to repay`}
          value={2650000}
          valueOptions={{ decimals: 1, unit: { symbol: debtToken.symbol, position: 'suffix', abbreviate: true } }}
          notional={{ value: 26539422, unit: { symbol: ' ETH', position: 'suffix', abbreviate: false } }}
          alignment="center"
          size="large"
        />

        <Metric
          label={t`Collateral to recover`}
          value={650450}
          valueOptions={{ decimals: 2, unit: 'dollar' }}
          notional={[
            { value: 26539422, unit: { symbol: ' ETH', position: 'suffix', abbreviate: false } },
            { value: 12450, unit: { symbol: ' crvUSD', position: 'suffix', abbreviate: true } },
          ]}
          alignment="center"
          size="large"
        />
      </Stack>

      <AlertCollateralAtRisk />

      <ButtonMenu
        primary={t`Repay debt & close position`}
        options={BUTTON_OPTIONS}
        open={isOpen}
        executing={status === 'idle' ? false : status === 'repay' ? 'primary' : status}
        onPrimary={() => onRepay(debtToken, collateralToken)}
        onOption={(id) => {
          close()
          BUTTON_OPTION_CALLBACKS[id]()
        }}
        onOpen={open}
        onClose={close}
      />
    </Stack>
  )
}
