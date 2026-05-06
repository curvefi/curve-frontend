import { FormProvider } from 'react-hook-form'
import { zeroAddress } from 'viem'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useCreateVoteForm } from './useCreateVoteForm'

const { Spacing } = SizesAndSpaces

type CreateVoteModalProps = {
  isOpen: boolean
  onClose: () => void
  gauge?: string
}

export const CreateVoteModal = ({ isOpen, onClose, gauge = '' }: CreateVoteModalProps) => {
  const {
    form,
    values: { gaugeAddress, description },
    isPending,
    isDisabled,
    onSubmit,
    gaugeAddressError,
    descriptionError,
    createVoteError,
    formErrors,
  } = useCreateVoteForm({ gauge, onSuccess: onClose })

  return (
    <ModalDialog
      title={t`Create a gauge vote`}
      width="xl"
      compact
      open={isOpen}
      onClose={onClose}
      footer={
        <Button
          fullWidth
          color="primary"
          onClick={onSubmit}
          disabled={isDisabled}
          loading={isPending}
          data-testid="create-gauge-vote-submit"
        >
          {t`Create vote`}
        </Button>
      }
    >
      <FormProvider {...form}>
        <Stack component="form" spacing={Spacing.lg} onSubmit={onSubmit}>
          <Stack spacing={Spacing.xs}>
            <Typography variant="bodySBold">{t`Requirements:`}</Typography>

            <Typography variant="bodySRegular">
              {t`1. New gauge votes must have a vote on the governance forum`}{' '}
              <InlineLink to="https://gov.curve.finance/" hideIcon>{t`at this address`}</InlineLink>
            </Typography>

            <Typography variant="bodySRegular">
              {t`2. You must have a minimum of 2,500 veCRV to create this vote`}
            </Typography>
          </Stack>

          <TextField
            label={t`Gauge Address`}
            placeholder={zeroAddress}
            value={gaugeAddress}
            onChange={e => updateForm(form, { gaugeAddress: e.target.value })}
            error={!!gaugeAddressError}
            helperText={gaugeAddressError}
            fullWidth
          />

          <TextField
            label={t`Vote Description`}
            value={description}
            onChange={e => updateForm(form, { description: e.target.value })}
            error={!!descriptionError}
            helperText={descriptionError ?? t`A few words describing what this gauge is for`}
            fullWidth
          />

          <FormAlerts error={createVoteError} formErrors={formErrors} handledErrors={['gaugeAddress', 'description']} />
        </Stack>
      </FormProvider>
    </ModalDialog>
  )
}
