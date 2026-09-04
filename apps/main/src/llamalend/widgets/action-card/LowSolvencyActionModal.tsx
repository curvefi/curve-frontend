import { useEffect } from 'react'
import { ModalDialog } from '@evm-ui/shared/ui/ModalDialog'
import { CheckboxField } from '@evm-ui/widgets/DetailPageLayout/CheckboxField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

type LowSolvencyAction = 'borrow' | 'deposit' | 'stake'

const getLowSolvencyModalCopy = ({
  action,
  tokenSymbol,
}: {
  action: LowSolvencyAction
  tokenSymbol: string | null | undefined
}) => {
  const token = tokenSymbol ?? t`this asset`
  return {
    deposit: {
      title: t`Confirm deposit`,
      content: t`I understand that this market has bad debt and that depositing ${token} may result in delayed, restricted, or unavailable withdrawals.`,
      checkboxLabel: t`I understand, let me deposit ${token}`,
      buttonText: t`Deposit`,
    },
    stake: {
      title: t`Confirm stake`,
      content: t`I understand that this market has bad debt and that staking ${token} may result in delayed, restricted, or unavailable withdrawals.`,
      checkboxLabel: t`I understand, let me stake ${token}`,
      buttonText: t`Stake`,
    },
    borrow: {
      title: t`Confirm borrow`,
      content: t`I understand that this market has bad debt and that opening a new borrow position with ${token} collateral in this market carries elevated risk.`,
      checkboxLabel: t`I understand, let me borrow against ${token}`,
      buttonText: t`Borrow`,
    },
  }[action]
}

export const LowSolvencyActionModal = ({
  action,
  onClose,
  onConfirm,
  open,
  tokenSymbol,
}: {
  action: LowSolvencyAction
  onClose: () => void
  onConfirm: () => void
  open: boolean
  tokenSymbol: string | null | undefined
}) => {
  const [accepted, , unsetAccepted, toggleAccepted] = useSwitch(false)
  const { title, content, checkboxLabel, buttonText } = getLowSolvencyModalCopy({ action, tokenSymbol })
  useEffect(() => {
    if (!open) unsetAccepted()
  }, [open, unsetAccepted])

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Stack sx={{ flexGrow: 1 }}>
          <Button disabled={!accepted} onClick={onConfirm} data-testid="low-solvency-action-submit-button">
            {buttonText}
          </Button>
        </Stack>
      }
      compact
    >
      <Stack spacing={Spacing.md}>
        <Typography>{content}</Typography>
        <CheckboxField
          checked={accepted}
          label={checkboxLabel}
          onChange={toggleAccepted}
          testIdPrefix="low-solvency-action"
        />
      </Stack>
    </ModalDialog>
  )
}
