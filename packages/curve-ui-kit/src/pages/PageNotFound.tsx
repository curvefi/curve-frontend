'use client'
import { useLayoutStore } from 'curve-ui-kit/src/features/layout'
import { NOT_FOUND_IMAGE_URL } from 'ui/src/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight, MaxWidth } = SizesAndSpaces

const [imageWidth, imageHeight] = [1280, 720]

export const PageNotFound = () => {
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
    >
      <Typography variant="headingXxl">404</Typography>
      <Typography variant="headingMLight">{t`Page not found`}</Typography>
      <img src={NOT_FOUND_IMAGE_URL} alt="404" width={imageWidth} height={imageHeight} />
    </Stack>
  )
}
