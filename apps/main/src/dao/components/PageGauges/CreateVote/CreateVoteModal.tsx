import { useState } from 'react'
import { zeroAddress } from 'viem'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { EXTERNAL_LINKS } from '@ui/utils'
import { FormProvider } from '@ui-kit/features/forms'
import { usePinataJwt } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useCreateVoteForm } from './useCreateVoteForm'

const { Spacing } = SizesAndSpaces

type CreateVoteModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const CreateVoteModal = ({ isOpen, onClose }: CreateVoteModalProps) => {
  const {
    form,
    values: { gaugeAddress, description, pinataJwt },
    isPending,
    isDisabled,
    onSubmit,
    gaugeAddressError,
    descriptionError,
    pinataJwtError,
    createVoteError,
    formErrors,
  } = useCreateVoteForm({ onSuccess: onClose })

  const [showPinataJwt, setShowPinataJwt] = useState(false)
  const [, setStoredJwt] = usePinataJwt()

  return (
    <ModalDialog
      title={t`Create a gauge vote`}
      width="xl"
      compact
      open={isOpen}
      onClose={onClose}
      formProps={{ onSubmit }}
      footer={
        <Button
          fullWidth
          color="primary"
          type="submit"
          disabled={isDisabled}
          loading={isPending}
          data-testid="create-gauge-vote-submit"
        >
          {t`Create vote`}
        </Button>
      }
    >
      <FormProvider {...form}>
        <Stack spacing={Spacing.lg}>
          <Stack spacing={Spacing.xs}>
            <Typography variant="bodySBold">{t`Requirements:`}</Typography>

            <Typography variant="bodySRegular">
              {t`1. New gauge votes are encouraged to have a proposal on the governance forum`}{' '}
              <InlineLink to={EXTERNAL_LINKS.curve.gov} hideIcon>{t`at this address`}</InlineLink>
            </Typography>

            <Typography variant="bodySRegular">
              {t`2. You must have a minimum of 2,500 veCRV to create this vote`}
            </Typography>
          </Stack>

          <FormControl fullWidth error={!!gaugeAddressError}>
            <FormLabel>{t`Gauge Address`}</FormLabel>
            <TextField
              fullWidth
              placeholder={zeroAddress}
              value={gaugeAddress}
              onChange={e => form.update({ gaugeAddress: e.target.value })}
            />
            <FormHelperText>{gaugeAddressError ?? t`Enter the gauge contract address`}</FormHelperText>
          </FormControl>

          <FormControl fullWidth error={!!descriptionError}>
            <FormLabel>{t`Vote Description`}</FormLabel>
            <TextField fullWidth value={description} onChange={e => form.update({ description: e.target.value })} />
            <FormHelperText>{descriptionError ?? t`A few words describing what this gauge is for`}</FormHelperText>
          </FormControl>

          <FormControl fullWidth error={!!pinataJwtError}>
            <FormLabel>{t`Pinata JWT`}</FormLabel>
            <TextField
              fullWidth
              type={showPinataJwt ? 'text' : 'password'}
              placeholder={t`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              value={pinataJwt}
              onChange={e => setStoredJwt(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button color="ghost" size="small" onClick={() => setShowPinataJwt(!showPinataJwt)}>
                        {showPinataJwt ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormHelperText>
              {pinataJwtError ?? (
                <>
                  {t`The vote description is uploaded to IPFS via Pinata. You need a Pinata API key to proceed.`}{' '}
                  <InlineLink to="https://docs.pinata.cloud/account-management/api-keys" hideIcon>
                    {t`Here's an explanation on how to create one`}
                  </InlineLink>
                  <br />
                  <br />
                  <Box component="span" sx={{ color: t => t.palette.warning.main }}>
                    {t`IMPORTANT: You must enable the "pinFileToIPFS" legacy endpoint when creating your API key, otherwise it will not work.`}
                  </Box>
                </>
              )}
            </FormHelperText>
          </FormControl>

          <FormAlerts
            error={createVoteError}
            formErrors={formErrors}
            handledErrors={['gaugeAddress', 'description', 'pinataJwt']}
          />
        </Stack>
      </FormProvider>
    </ModalDialog>
  )
}
