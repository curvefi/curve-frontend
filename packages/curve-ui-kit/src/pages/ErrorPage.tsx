import { useCallback, useState } from 'react'
import { ERROR_IMAGE_URL } from 'ui/src/utils'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutStore } from '@ui-kit/features/layout'
import { t } from '@ui-kit/lib/i18n'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight, MaxWidth } = SizesAndSpaces

const [imageWidth, imageHeight] = [1280, 720]

export const ErrorPage = ({
  title,
  subtitle,
  resetError,
  hideRetry,
}: {
  title: string
  subtitle: string
  resetError?: () => void
  hideRetry?: boolean
}) => {
  const navHeight = useLayoutStore((state) => state.navHeight)
  const [resetClicked, setResetClicked] = useState(false)
  const onClick = useCallback(() => {
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
      sx={{
        minHeight: MinHeight.pageContent,
        '& img': {
          objectFit: 'cover',
          opacity: 0.8,
          position: 'absolute',
          top: (t) => `calc(${t.spacing(4)} + ${navHeight}px)`,
          width: '100%',
          maxWidth: MaxWidth.banner,
          zIndex: -1,
        },
      }}
      alignItems="center"
      justifyContent="center"
      spacing={2}
    >
      <Typography component="h1" variant="headingXxl" data-testid="error-title">
        {title}
      </Typography>
      <Typography component="h2" variant="headingXsMedium" data-testid="error-subtitle">
        {subtitle}
      </Typography>
      <Stack direction="row" spacing={2} margin={2}>
        {!hideRetry && (
          <Button onClick={onClick} variant="contained" data-testid="retry-error-button">{t`Try again`}</Button>
        )}
        <Button component={RouterLink} href="/" variant="contained">
          {t`Go to homepage`}
        </Button>
      </Stack>
      <img src={ERROR_IMAGE_URL} alt={title} width={imageWidth} height={imageHeight} />
    </Stack>
  )
}
