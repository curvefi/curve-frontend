import { useCallback } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTryNewLlamalend } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const TryNewLlamalendModal = () => {
  const [, setTryNewLlamalend] = useTryNewLlamalend()
  return (
    <ModalDialog
      open
      title={t`Try the new loan management`}
      footer={
        <Stack direction="row" justifyContent="space-between" flexGrow={1}>
          <Button
            color="secondary"
            onClick={useCallback(() => setTryNewLlamalend(false), [setTryNewLlamalend])}
          >{t`No, thanks`}</Button>
          <Button
            color="primary"
            onClick={useCallback(() => setTryNewLlamalend(true), [setTryNewLlamalend])}
          >{t`Sure, let's do it`}</Button>
        </Stack>
      }
      compact
    >
      <Stack spacing={Spacing.sm}>
        <Typography>{t`We have been working hard to make Llamalend easier to use. `}</Typography>
        <Typography>{t`Would you like to try the new forms for managing your loans? `}</Typography>
        <Typography>{t`You can always go back to the legacy implementation if you don't like it. `}</Typography>
        <Typography>{t`Please let us know if you have any feedback!`}</Typography>
      </Stack>
    </ModalDialog>
  )
}
