import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ButtonMenu } from '@ui-kit/shared/ui/ButtonMenu'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Token } from '../../types'
import { AlertRepayDebtToIncreaseHealth } from '../alerts/AlertRepayDebtToIncreaseHealth'
import { ButtonGetCrvUsd } from '../ButtonGetCrvUsd'

const { Spacing } = SizesAndSpaces

const BUTTON_OPTIONS = [
  { id: 'approve-limited' as const, label: t`Approve limited` },
  { id: 'approve-infinite' as const, label: t`Approve infinite` },
]

type OptionId = (typeof BUTTON_OPTIONS)[number]['id']
type Status = 'idle' | 'repay' | OptionId

type ImproveHealthProps = {
  /** The token that's been borrowed that has to be paid back */
  debtToken?: Token & { amount: number }
  /** the amount of tokens the user has in his wallet to repay debt with */
  userBalance?: number
  /** Current status of the improve health operation */
  status: Status
}

type ImproveHealthCallbacks = {
  /** Callback triggered when debt balance amount changes */
  onDebtBalance: (balance: number) => void
  /** Callback triggered when repay action is initiated */
  onRepay: (debtToken: Token, debtBalance: number) => void
  /** Callback triggered when limited approval is requested */
  onApproveLimited: () => void
  /** Callback triggered when infinite approval is requested */
  onApproveInfinite: () => void
}

export type Props = ImproveHealthProps & ImproveHealthCallbacks

export const ImproveHealth = ({
  debtToken,
  userBalance,
  status = 'idle',
  onDebtBalance,
  onRepay,
  onApproveLimited,
  onApproveInfinite,
}: Props) => {
  const [isOpen, open, close] = useSwitch(false)
  const [debtBalance, setDebtBalance] = useState(0)

  const BUTTON_OPTION_CALLBACKS: Record<OptionId, () => void> = {
    'approve-limited': onApproveLimited,
    'approve-infinite': onApproveInfinite,
  }

  const maxBalance = useMemo(
    () => ({
      balance: debtToken && userBalance && Math.min(debtToken.amount, userBalance),
      symbol: debtToken?.symbol,
      showSlider: false,
    }),
    [debtToken, userBalance],
  )

  return (
    <Stack gap={Spacing.md} sx={{ padding: Spacing.md }}>
      <LargeTokenInput
        label={t`Debt to repay`}
        tokenSelector={
          <TokenLabel
            blockchainId={debtToken?.chain}
            tooltip={debtToken?.symbol}
            address={debtToken?.address}
            label={debtToken?.symbol ?? '?'}
          />
        }
        maxBalance={maxBalance}
        message={t`Repaying debt will increase your health temporarily.`}
        onBalance={balance => {
          balance ??= 0

          if (debtBalance !== balance) {
            const newBalance = Number(balance.toFixed(4))
            setDebtBalance(newBalance)
            onDebtBalance(newBalance)
          }
        }}
      />

      <AlertRepayDebtToIncreaseHealth />

      <Stack gap={Spacing.xs}>
        <ButtonMenu
          primary={status === 'idle' ? t`Repay debt & increase health` : t`Repaying debt`}
          options={BUTTON_OPTIONS}
          open={isOpen}
          executing={status === 'idle' ? false : status === 'repay' ? 'primary' : status}
          disabled={!debtToken || debtBalance === 0 || debtBalance > (userBalance ?? 0)}
          onPrimary={() => onRepay(debtToken!, debtBalance)}
          onOption={id => {
            close()
            BUTTON_OPTION_CALLBACKS[id]()
          }}
          onOpen={open}
          onClose={close}
        />

        <ButtonGetCrvUsd />
      </Stack>
    </Stack>
  )
}
