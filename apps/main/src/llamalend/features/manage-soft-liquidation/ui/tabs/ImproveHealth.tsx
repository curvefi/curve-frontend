import { useState } from 'react'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ButtonMenu } from '@ui-kit/shared/ui/ButtonMenu'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import type { Token } from '../../types'
import { AlertRepayBalanceTooHigh } from '../alerts/AlertRepayBalanceTooHigh'
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
  debtToken?: Token & { amount: Decimal }
  /** the amount of tokens the user has in his wallet to repay debt with */
  userBalance?: Decimal
  /** Current status of the improve health operation */
  status: Status
}

type ImproveHealthCallbacks = {
  /** Callback triggered when debt balance amount changes */
  onDebtBalance: (balance: Decimal) => void
  /** Callback triggered when repay action is initiated */
  onRepay: (debtBalance: Decimal) => void
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
  const [debtBalance, setDebtBalance] = useState<Decimal>('0')

  const BUTTON_OPTION_CALLBACKS: Record<OptionId, () => void> = {
    'approve-limited': onApproveLimited,
    'approve-infinite': onApproveInfinite,
  }

  const maxBalance = {
    balance: decimal(debtToken && userBalance && Math.min(+debtToken.amount, +userBalance)),
    chips: 'max' as const,
  }

  const repayBalanceTooHigh = debtToken && +debtBalance > +(maxBalance.balance ?? 0)
  // todo: add useRepayIsAvailable() to disable repay when not available
  const cantRepay =
    status !== 'idle' || !debtToken || +debtBalance === 0 || +debtBalance > +(userBalance ?? 0) || repayBalanceTooHigh

  return (
    <FormContent>
      <LargeTokenInput
        label={t`Debt to repay`}
        name="debtBalance"
        tokenSelector={
          <TokenLabel
            blockchainId={debtToken?.chain}
            tooltip={debtToken?.symbol}
            address={debtToken?.address}
            label={debtToken?.symbol ?? '?'}
          />
        }
        walletBalance={{ balance: userBalance, symbol: debtToken?.symbol, loading: !userBalance }}
        maxBalance={maxBalance}
        message={t`Repaying debt will increase your health temporarily.`}
        disabled={status !== 'idle'}
        onBalance={(balance) => {
          balance ??= '0'

          if (+debtBalance !== +balance) {
            setDebtBalance(balance)
            onDebtBalance(balance)
          }
        }}
      />

      <AlertRepayDebtToIncreaseHealth />

      {repayBalanceTooHigh && (
        <AlertRepayBalanceTooHigh
          symbol={debtToken.symbol}
          input={debtBalance}
          userBalance={userBalance}
          debt={debtToken?.amount}
        />
      )}

      <Stack gap={Spacing.xs}>
        <ButtonMenu
          primary={status === 'idle' ? t`Repay debt & increase health` : t`Repaying debt`}
          options={BUTTON_OPTIONS}
          open={isOpen}
          executing={status === 'idle' ? false : status === 'repay' ? 'primary' : status}
          disabled={cantRepay}
          onPrimary={() => onRepay(debtBalance)}
          onOption={(id) => {
            close()
            BUTTON_OPTION_CALLBACKS[id]()
          }}
          onOpen={open}
          onClose={close}
        />

        <ButtonGetCrvUsd />
      </Stack>
    </FormContent>
  )
}
