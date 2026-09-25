import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ModalDialog } from '@ui/components/ModalDialog'
import { ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const LeverageDelegationModal = ({
  open,
  gas,
  onClose,
  onConfirm,
}: {
  open: boolean
  gas: EstimatedTxCostProps['gas']
  onClose: () => void
  onConfirm: () => void
}) => (
  <ModalDialog
    title={t`Approve leverage delegation`}
    open={open}
    onClose={onClose}
    compact
    testId="leverage-delegation-modal"
    footer={
      <Stack sx={{ flexGrow: 1 }}>
        <Button onClick={onConfirm} data-testid="leverage-delegation-approve">
          {t`Approve delegation & Continue`}
        </Button>
      </Stack>
    }
  >
    <Stack spacing={Spacing.md}>
      <Typography variant="bodyMRegular">
        {t`Enable Zap V2 to make the borrow and repay calls needed for leveraged operations in this market. This one-time market approval has no amount limit.`}
      </Typography>
      <Typography variant="bodyMRegular">{t`Token spending approval is a separate transaction.`}</Typography>
      <Typography variant="bodySRegular" color="textTertiary">
        {t`Delegations need to be done once per market when using leverage.`}
      </Typography>
      <ActionInfoGasEstimate gas={gas} label={t`Estimated tx cost`} />
    </Stack>
  </ModalDialog>
)
