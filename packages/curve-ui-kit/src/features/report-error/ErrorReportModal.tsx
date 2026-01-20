import { type MouseEvent, useEffect } from 'react'
import { useConnection } from 'wagmi'
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
import { setValueOptions, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { type ErrorContext, type ContactMethod, useErrorReportForm } from './useErrorReportForm'

const { Spacing } = SizesAndSpaces
const contactCopyByMethod = {
  email: { label: t`Email address`, placeholder: t`johnthellama@email.com` },
  telegram: { label: t`Telegram`, placeholder: '@johnthellama' },
  discord: { label: t`Discord`, placeholder: '@johnthellama' },
}

type ErrorReportModalProps = {
  isOpen: boolean
  onClose: () => void
  context: ErrorContext
}

export const ErrorReportModal = ({ isOpen, onClose, context }: ErrorReportModalProps) => {
  const { address: userAddress } = useConnection()
  const {
    form,
    values: { address, contact, contactMethod, description },
    onSubmit,
  } = useErrorReportForm(context)
  const { label, placeholder } = contactCopyByMethod[contactMethod]
  const errors = useFormErrors(form.formState)
  useEffect(() => {
    if (isOpen && userAddress) form.setValue('address', userAddress, setValueOptions)
  }, [form, isOpen, userAddress])
  return (
    <ModalDialog
      open={isOpen}
      onClose={onClose}
      title={t`Submit error report`}
      titleColor="textSecondary"
      compact
      footer={
        <Button
          fullWidth
          onClick={onSubmit}
          data-testid="submit-error-report-submit"
          variant="contained"
          disabled={errors.length > 0}
        >
          {t`Submit report`}
        </Button>
      }
      width="xl"
    >
      <Stack data-testid="submit-error-report-modal" gap={Spacing.md} sx={{ overflowY: 'auto', height: '100%' }}>
        <Stack>
          <Typography variant="bodyMBold" color="text.primary">
            {t`Seems like there's been an error T_T.`}
          </Typography>
          <Typography variant="bodySRegular" color="text.secondary">
            {t`We're on it. Want to speed things up? Share what happened below.`}
          </Typography>
        </Stack>

        <FormControl fullWidth>
          <FormLabel>{t`Address`}</FormLabel>
          <TextField
            fullWidth
            placeholder={t`0xab4ed...`}
            value={address}
            onChange={(event) => form.setValue('address', event.target.value)}
            slotProps={{ htmlInput: { 'data-testid': 'submit-error-report-address' } }}
          />
          <FormHelperText>{t`Submit your address so we can reproduce the issue`}</FormHelperText>
        </FormControl>

        <ToggleButtonGroup
          exclusive
          value={contactMethod}
          onChange={(_event: MouseEvent<HTMLElement>, nextValue: ContactMethod | null) => {
            if (!nextValue) return // ToggleButtonGroup sets null when clicking the selected value; keep the current selection.
            form.setValue('contactMethod', nextValue, { shouldDirty: true })
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
            onChange={(event) => form.setValue('contact', event.target.value)}
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
            onChange={(event) => form.setValue('description', event.target.value)}
            slotProps={{ htmlInput: { 'data-testid': 'submit-error-report-description' } }}
          />
        </FormControl>

        <Typography variant="bodySRegular" color="text.tertiary">
          {t`Error reports help us improve the product for everyone.`}
        </Typography>
      </Stack>
    </ModalDialog>
  )
}
