import { useState } from 'react'
import Stack from '@mui/material/Stack'
import { TokenSelector, type TokenOption } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { ButtonMenu } from '@ui-kit/shared/ui/ButtonMenu'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TOKEN_SELECT_WIDTH } from '../../lib/constants'
import { AlertCollateralAtRisk } from '../AlertCollateralAtRisk'

const { Spacing, IconSize } = SizesAndSpaces

const BUTTON_OPTIONS = [
  { id: 'approve-limited' as const, label: t`Approve limited` },
  { id: 'approve-infinite' as const, label: t`Approve infinite` },
]

type OptionId = (typeof BUTTON_OPTIONS)[number]['id']
type Status = 'idle' | 'repay' | OptionId

type WithdrawProps = {
  /** Available debt tokens for selection */
  debtTokens: TokenOption[]
  /** Available collateral tokens for selection */
  collateralTokens: TokenOption[]
  /** Currently selected debt token with balance information */
  selectedDebtToken: (TokenOption & { balance: number }) | undefined
  /** Currently selected collateral token with balance information */
  selectedCollateralToken: (TokenOption & { balance: number }) | undefined
  /** Current operation status */
  status: Status
}

type WithdrawCallbacks = {
  /** Called when a debt token is selected */
  onDebtToken: (token: TokenOption) => void
  /** Called when a collateral token is selected */
  onCollateralToken: (token: TokenOption) => void
  /** Called when debt balance amount changes */
  onDebtBalance: (balance: number) => void
  /** Called when collateral balance amount changes */
  onCollateralBalance: (balance: number) => void
  /** Called when repay action is triggered */
  onRepay: (
    debtToken: TokenOption,
    collateralToken: TokenOption,
    debtBalance: number,
    collateralBalance: number,
  ) => void
  /** Called when limited approval is requested */
  onApproveLimited: () => void
  /** Called when infinite approval is requested */
  onApproveInfinite: () => void
}

export type Props = WithdrawProps & WithdrawCallbacks

export const Withdraw = ({
  debtTokens,
  collateralTokens,
  selectedDebtToken,
  selectedCollateralToken,
  status = 'idle',
  onDebtToken,
  onCollateralToken,
  onDebtBalance,
  onCollateralBalance,
  onRepay,
  onApproveLimited,
  onApproveInfinite,
}: Props) => {
  const [isOpen, open, close] = useSwitch(false)
  const [debtBalance, setDebtBalance] = useState(0)
  const [collateralBalance, setCollateralBalance] = useState(0)

  const BUTTON_OPTION_CALLBACKS: Record<OptionId, () => void> = {
    'approve-limited': onApproveLimited,
    'approve-infinite': onApproveInfinite,
  }

  return (
    <Stack gap={Spacing.md} sx={{ padding: Spacing.md }}>
      <Stack>
        <LargeTokenInput
          label={t`Debt to repay`}
          tokenSelector={
            <TokenSelector
              selectedToken={selectedDebtToken}
              tokens={debtTokens}
              showSearch={false}
              showManageList={false}
              compact
              onToken={onDebtToken}
              sx={{ minWidth: TOKEN_SELECT_WIDTH }}
            />
          }
          maxBalance={{ ...selectedDebtToken, showSlider: false }}
          message={t`Recover collateral by repaying debt.`}
          onBalance={(balance) => {
            if (debtBalance !== balance) {
              setDebtBalance(balance)
              onDebtBalance(balance)
            }
          }}
        />

        <ArrowDownIcon
          sx={{
            width: IconSize.lg,
            height: IconSize.lg,
            alignSelf: 'center',
          }}
        />

        <LargeTokenInput
          label={t`Collateral to withdraw`}
          tokenSelector={
            <TokenSelector
              selectedToken={selectedCollateralToken}
              tokens={collateralTokens}
              showSearch={false}
              showManageList={false}
              compact
              onToken={onCollateralToken}
              sx={{ minWidth: TOKEN_SELECT_WIDTH }}
            />
          }
          maxBalance={{ ...selectedCollateralToken, showBalance: false }}
          message={t`Collateral value: something something`}
          onBalance={(balance) => {
            if (collateralBalance !== balance) {
              setCollateralBalance(balance)
              onCollateralBalance(balance)
            }
          }}
        />
      </Stack>

      <AlertCollateralAtRisk />

      <ButtonMenu
        primary={t`Repay debt & withdraw collateral`}
        options={BUTTON_OPTIONS}
        open={isOpen}
        executing={status === 'idle' ? false : status === 'repay' ? 'primary' : status}
        disabled={!selectedDebtToken || !selectedCollateralToken || debtBalance === 0 || collateralBalance === 0}
        onPrimary={() => onRepay(selectedDebtToken!, selectedCollateralToken!, debtBalance, collateralBalance)}
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
