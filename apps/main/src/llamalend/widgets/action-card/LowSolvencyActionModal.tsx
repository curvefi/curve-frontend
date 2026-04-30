import { useEffect } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CheckboxField } from '@ui-kit/widgets/DetailPageLayout/CheckboxField'

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
      cta: t`Deposit`,
    },
    stake: {
      title: t`Confirm stake`,
      content: t`I understand that this market has bad debt and that staking ${token} may result in delayed, restricted, or unavailable withdrawals.`,
      checkboxLabel: t`I understand, let me stake ${token}`,
      cta: t`Stake`,
    },
    borrow: {
      title: t`Confirm borrow`,
      content: t`I understand that this market has bad debt and that opening a new borrow position with ${token} collateral in this market carries elevated risk.`,
      checkboxLabel: t`I understand, let me borrow against ${token}`,
      cta: t`Borrow`,
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
  const [accepted, , , toggleAccepted, setAccepted] = useSwitch(false)
  const copy = getLowSolvencyModalCopy({ action, tokenSymbol })

  useEffect(() => {
    if (!open) setAccepted(false)
  }, [open, setAccepted])

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        <Stack flexGrow={1}>
          <Button disabled={!accepted} onClick={onConfirm} data-testid="low-solvency-action-submit-button">
            {copy.cta}
          </Button>
        </Stack>
      }
      compact
    >
      <Stack spacing={Spacing.md}>
        <Typography>{copy.content}</Typography>
        <CheckboxField
          checked={accepted}
          label={copy.checkboxLabel}
          onChange={toggleAccepted}
          testIdPrefix="low-solvency-action"
        />
      </Stack>
    </ModalDialog>
  )
}
