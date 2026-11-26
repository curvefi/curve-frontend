import { useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { ModalDialog } from '@ui/components/ModalDialog'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

const { Spacing } = SizesAndSpaces

export const LowExchangeRateModal = ({
  open,
  onClose,
  onConfirm,
  disabled,
  exchangeRate,
  expectedOutput,
  fromSymbol,
  toSymbol,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  disabled: boolean
  exchangeRate: Decimal | undefined
  expectedOutput: Decimal | undefined
  fromSymbol: string | undefined
  toSymbol: string | undefined
}) => {
  const [accepted, , resetAccepted, toggleAccepted] = useSwitch(false)
  useEffect(resetAccepted, [open, exchangeRate, expectedOutput, fromSymbol, toSymbol, resetAccepted])

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={t`Low exchange rate`}
      compact
      testId="pool-swap-low-rate-modal"
      footer={
        <Stack direction="row" sx={{ flexGrow: 1, gap: Spacing.sm }}>
          <Button color="ghost" onClick={onClose}>
            {t`Cancel`}
          </Button>
          <Button disabled={!accepted || disabled} onClick={onConfirm} data-testid="pool-swap-low-rate-confirm">
            {t`Swap anyway`}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={Spacing.md}>
        <Alert severity="warning" variant="outlined">
          {t`This swap has a low exchange rate.`}
          <Typography>{`${formatToken(1, fromSymbol)} = ${formatToken(exchangeRate, toSymbol, 'balance')}`}</Typography>
          <Typography>{`${t`Receiving`} ${formatToken(expectedOutput, toSymbol, 'balance')}.`}</Typography>
        </Alert>
        <CheckboxField
          checked={accepted}
          onChange={toggleAccepted}
          label={t`Confirm warning to proceed.`}
          testIdPrefix="pool-swap-low-rate"
        />
      </Stack>
    </ModalDialog>
  )
}
