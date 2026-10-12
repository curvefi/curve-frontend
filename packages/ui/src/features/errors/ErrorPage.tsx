import { type ElementType, useCallback, useState } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { LlamaBox } from '@ui/components/LlamaBox'
import { RouterLink } from '@ui/components/RouterLink'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { ErrorReportModal } from '@ui/features/report-error/ErrorReportModal'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { getBoundaryErrorSubtitle } from './errors.util'

const { Spacing } = SizesAndSpaces

export const ErrorPage = ({
  title,
  subtitle,
  resetError,
  continueUrl,
  error,
  LinkComponent: Link = RouterLink,
  userAddress,
}: {
  title: string
  subtitle: string
  resetError?: () => void
  continueUrl?: string
  error?: unknown
  LinkComponent?: ElementType
  userAddress: Address | undefined
}) => {
  const [resetClicked, setResetClicked] = useState(false)
  const [isReportOpen, openReportModal, closeReportModal] = useSwitch(false)
  const onRetry = useCallback(() => {
    queryClient.clear()
    persister?.removeClient?.()
    if (resetError && !resetClicked) {
      setResetClicked(true)
      resetError()
    } else {
      // if the refresh doesn't work, reload the whole page
      window.location.reload()
    }
  }, [resetError, resetClicked])

  return (
    <LlamaBox>
      <Typography component="h1" variant="headingXxl" data-testid="error-title">
        {title}
      </Typography>
      <Typography component="h2" variant="headingXsMedium" data-testid="error-subtitle" sx={{ textTransform: 'none' }}>
        {getBoundaryErrorSubtitle(error, subtitle)}
      </Typography>
      <Stack direction="row" spacing={Spacing.sm} sx={{ margin: 2 }}>
        {continueUrl ? (
          <Button
            component={Link}
            href={continueUrl}
            variant="contained"
            data-testid="continue-button"
          >{t`Continue`}</Button>
        ) : (
          <Button
            onClick={onRetry}
            color="secondary"
            variant="contained"
            data-testid="retry-error-button"
          >{t`Try again`}</Button>
        )}
        <Button component={Link} href="/" variant="contained">
          {t`Go to homepage`}
        </Button>
        <Button onClick={openReportModal} color="secondary" data-testid="submit-error-report-button">
          {t`Submit error report`}
        </Button>
      </Stack>
      <ErrorReportModal
        isOpen={isReportOpen}
        onClose={closeReportModal}
        userAddress={userAddress}
        context={{ error, title, subtitle }}
      />
    </LlamaBox>
  )
}
