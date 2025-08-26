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
}: {
  title: string
  subtitle: string
  resetError?: () => void
}) => {
  const navHeight = useLayoutStore((state) => state.navHeight)
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
      <Typography variant="headingXxl">{title}</Typography>
      <Typography variant="headingXsMedium">{subtitle}</Typography>
      <Stack direction="row" spacing={2} margin={2}>
        <Button onClick={resetError} variant="contained">{t`Try again`}</Button>
        <Button component={RouterLink} href="/" variant="contained">
          {t`Go to homepage`}
        </Button>
      </Stack>
      <img src={ERROR_IMAGE_URL} alt={title} width={imageWidth} height={imageHeight} />
    </Stack>
  )
}
