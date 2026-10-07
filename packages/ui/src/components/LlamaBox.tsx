import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { useLayoutStore } from '@ui/features/layout/store'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ERROR_IMAGE_URL } from '@ui/lib/resource.constants'

const { MinHeight, MaxWidth, Spacing } = SizesAndSpaces

const [IMAGE_WIDTH, IMAGE_HEIGHT] = [1280, 720]

export const LlamaBox = ({ children }: { children: ReactNode }) => {
  const navHeight = useLayoutStore(state => state.navHeight)

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
      {children}
      <img src={ERROR_IMAGE_URL} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
    </Stack>
  )
}
