import { type MouseEvent, useEffect } from 'react'
import { WagmiProviderNotFoundError, useConnection } from 'wagmi'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type ContactMethod, type ErrorContext, useErrorReportForm } from './useErrorReportForm'

const { Spacing } = SizesAndSpaces
const contactCopyByMethod: Record<ContactMethod, { label: string; placeholder: string }> = {
  email: { label: t`Email address`, placeholder: t`johnthellama@email.com` },
  telegram: { label: t`Telegram`, placeholder: '@johnthellama' },
  discord: { label: t`Discord`, placeholder: '@johnthellama' },
}

type ErrorReportModalProps = {
  isOpen: boolean
  onClose: () => void
  context: ErrorContext
}

/*** Returns the connected wallet address when wagmi context is available. */
const useTryConnection = () => {
  try {
    return useConnection()
  } catch (error) {
    // Error boundaries can render before the WagmiProvider mounts. In that case, wagmi throws WagmiProviderNotFoundError,
    // which we swallow so the modal can still render and users can submit reports without a prefilled address.
    if (error instanceof WagmiProviderNotFoundError) return
    throw error
  }
}

export const ErrorReportModal = ({ isOpen, onClose, context }: ErrorReportModalProps) => {
  const { address: userAddress } = useTryConnection() ?? {}
  const {
    form,
    values: { address, contact, contactMethod, description },
    onSubmit,
  } = useErrorReportForm(context, onClose)
  const { update: updateForm } = form
  const { label, placeholder } = contactCopyByMethod[contactMethod]

  useEffect(() => {
    if (isOpen && userAddress) updateForm({ address: userAddress }, { automated: true })
  }, [isOpen, updateForm, userAddress])

  return (
    <ModalDialog
      open={isOpen}
      onClose={onClose}
      title={t`Submit error report`}
      compact
      footer={
        <Button
          fullWidth
          // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
          onClick={onSubmit}
          data-testid="submit-error-report-submit"
          variant="contained"
          disabled={!form.formState.isValid}
        >
          {t`Submit report`}
        </Button>
      }
      width="xl"
    >
      <Stack data-testid="submit-error-report-modal" sx={{ gap: Spacing.md, overflowY: 'auto', height: '100%' }}>
        <Stack>
          <Typography variant="bodyMBold" sx={{ color: 'text.primary' }}>
            {t`Seems like there's been an error T_T.`}
          </Typography>
          <Typography variant="bodySRegular" sx={{ color: 'text.secondary' }}>
            {t`We're on it. Want to speed things up? Share what happened below.`}
          </Typography>
        </Stack>

        <FormControl fullWidth>
          <FormLabel>{t`Address`}</FormLabel>
          <TextField
            fullWidth
            placeholder={t`0xab4ed...`}
            value={address}
            onChange={event => updateForm({ address: event.target.value })}
            slotProps={{ htmlInput: { 'data-testid': 'submit-error-report-address' } }}
          />
          <FormHelperText>{t`Submit your address so we can reproduce the issue`}</FormHelperText>
        </FormControl>

        <ToggleButtonGroup
          exclusive
          value={contactMethod}
          onChange={(_event: MouseEvent<HTMLElement>, nextValue: ContactMethod | null) => {
            if (!nextValue) return // ToggleButtonGroup sets null when clicking the selected value; keep the current selection.
            updateForm({ contactMethod: nextValue })
          }}
          size="small"
          data-testid="submit-error-report-contact-method"
          aria-label={t`Contact method`}
        >
          <ToggleButton value="email">{t`Email`}</ToggleButton>
          <ToggleButton value="telegram">{t`Telegram`}</ToggleButton>
          <ToggleButton value="discord">{t`Discord`}</ToggleButton>
        </ToggleButtonGroup>

        <FormControl fullWidth>
          <FormLabel>{label}</FormLabel>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={contact}
            onChange={event => updateForm({ contact: event.target.value })}
            slotProps={{
              htmlInput: {
                'data-testid': 'submit-error-report-contact',
                'aria-label': label || t`Contact`,
              },
            }}
          />
          <FormHelperText>{t`We will only reach out if needed`}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>{t`What happened?`}</FormLabel>
          <TextField
            fullWidth
            multiline
            minRows={8}
            placeholder={t`I clicked on "X" and then hit "confirm"...`}
            value={description}
            onChange={event => updateForm({ description: event.target.value })}
            slotProps={{ htmlInput: { 'data-testid': 'submit-error-report-description' } }}
          />
        </FormControl>

        <Typography variant="bodySRegular" sx={{ color: 'text.tertiary' }}>
          {t`Error reports help us improve the product for everyone.`}
        </Typography>
      </Stack>
    </ModalDialog>
  )
}
