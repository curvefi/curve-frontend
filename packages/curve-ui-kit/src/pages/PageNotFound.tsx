'use client'
import { useLayoutStore } from 'curve-ui-kit/src/features/layout'
import Image from 'next/image'
import { NOT_FOUND_IMAGE_URL } from 'ui/src/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight } = SizesAndSpaces

const [imageWidth, imageHeight] = [1280, 720]

export const PageNotFound = () => (
  <Stack
    sx={{
      minHeight: MinHeight.pageContent,
      '& img': {
        objectFit: 'cover',
        opacity: 0.8,
        position: 'absolute',
        top: useLayoutStore((state) => state.navHeight),
        width: '100%',
        zIndex: -1,
      },
      margin: {
        desktop: '1.5rem',
      },
      backgroundImage: NOT_FOUND_IMAGE_URL,
    }}
    alignItems="center"
    justifyContent="center"
  >
    <Typography variant="headingXxl">404</Typography>
    <Typography variant="headingMLight">{t`Page not found`}</Typography>
    <Image src={NOT_FOUND_IMAGE_URL} alt="404" width={imageWidth} height={imageHeight} />
  </Stack>
)
