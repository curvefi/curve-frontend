import { useMemo, useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import { TokenSelector, type TokenOption } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ButtonMenu } from '@ui-kit/shared/ui/ButtonMenu'
import { LargeTokenInput, type LargeTokenInputRef } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TOKEN_SELECT_WIDTH } from '../../lib/constants'
import { AlertCollateralAtRisk } from '../AlertCollateralAtRisk'

const { Spacing } = SizesAndSpaces

const BUTTON_OPTIONS = [
  { id: 'approve-limited' as const, label: t`Approve limited` },
  { id: 'approve-infinite' as const, label: t`Approve infinite` },
]

type OptionId = (typeof BUTTON_OPTIONS)[number]['id']
type Status = 'idle' | 'repay' | OptionId

type ImproveHealthProps = {
  /** Array of available debt tokens that can be selected for repayment */
  debtTokens: TokenOption[]
  /** Currently selected debt token with its balance, undefined if none selected */
  selectedDebtToken: (TokenOption & { balance: number }) | undefined
  /** Current status of the improve health operation */
  status: Status
}

type ImproveHealthCallbacks = {
  /** Callback triggered when a debt token is selected */
  onDebtToken: (token: TokenOption) => void
  /** Callback triggered when debt balance amount changes */
  onDebtBalance: (balance: number) => void
  /** Callback triggered when repay action is initiated */
  onRepay: (debtToken: TokenOption, debtBalance: number) => void
  /** Callback triggered when limited approval is requested */
  onApproveLimited: () => void
  /** Callback triggered when infinite approval is requested */
  onApproveInfinite: () => void
}

export type Props = ImproveHealthProps & ImproveHealthCallbacks

export const ImproveHealth = ({
  debtTokens,
  selectedDebtToken,
  status = 'idle',
  onDebtToken,
  onDebtBalance,
  onRepay,
  onApproveLimited,
  onApproveInfinite,
}: Props) => {
  const [isOpen, open, close] = useSwitch(false)
  const [debtBalance, setDebtBalance] = useState(0)

  const repayInputRef = useRef<LargeTokenInputRef>(null)

  const BUTTON_OPTION_CALLBACKS: Record<OptionId, () => void> = {
    'approve-limited': onApproveLimited,
    'approve-infinite': onApproveInfinite,
  }

  const maxBalance = useMemo(() => ({ ...selectedDebtToken, showSlider: false }), [selectedDebtToken])

  return (
    <Stack gap={Spacing.md} sx={{ padding: Spacing.md }}>
      <LargeTokenInput
        ref={repayInputRef}
        label={t`Debt to repay`}
        tokenSelector={
          <TokenSelector
            selectedToken={selectedDebtToken}
            tokens={debtTokens}
            showSearch={false}
            showManageList={false}
            compact
            onToken={(newToken) => {
              onDebtToken(newToken)
              repayInputRef.current?.resetBalance()
            }}
            sx={{ minWidth: TOKEN_SELECT_WIDTH }}
          />
        }
        maxBalance={maxBalance}
        message={t`Repaying debt will increase your health temporarily.`}
        onBalance={(balance) => {
          balance ??= 0

          if (debtBalance !== balance) {
            const newBalance = Number(balance.toFixed(4))
            setDebtBalance(newBalance)
            onDebtBalance(newBalance)
          }
        }}
      />

      <AlertCollateralAtRisk />

      <ButtonMenu
        primary={t`Repay debt & increase health`}
        options={BUTTON_OPTIONS}
        open={isOpen}
        executing={status === 'idle' ? false : status === 'repay' ? 'primary' : status}
        disabled={!selectedDebtToken || debtBalance === 0}
        onPrimary={() => onRepay(selectedDebtToken!, debtBalance)}
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
