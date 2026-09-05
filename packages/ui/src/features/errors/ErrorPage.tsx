import { type ElementType, useCallback, useState } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { useLayoutStore } from '@ui/features/layout/layout'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { ErrorReportModal } from '@ui/features/report-error'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { ERROR_IMAGE_URL } from '@ui/lib/resource.constants'
import { getBoundaryErrorSubtitle } from './errors.util'

const { MinHeight, MaxWidth, Spacing } = SizesAndSpaces

const [IMAGE_WIDTH, IMAGE_HEIGHT] = [1280, 720]

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
  error?: Error | string
  LinkComponent?: ElementType
  userAddress: Address | undefined
}) => {
  const navHeight = useLayoutStore(state => state.navHeight)
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
    <Stack
      spacing={Spacing.md}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: MinHeight.pageContent,

        '& img': {
          objectFit: 'cover',
          opacity: 0.8,
          position: 'absolute',
          top: t => `calc(${t.spacing(4)} + ${navHeight}px)`,
          width: '100%',
          maxWidth: MaxWidth.banner,
          zIndex: -1,
        },
      }}
    >
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
      <img src={ERROR_IMAGE_URL} alt={title} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
      <ErrorReportModal
        isOpen={isReportOpen}
        onClose={closeReportModal}
        userAddress={userAddress}
        context={{ error, title, subtitle }}
      />
    </Stack>
  )
}
