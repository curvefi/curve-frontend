import { ComponentPropsWithoutRef } from 'react'
import { styled } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const { IconSize } = SizesAndSpaces

const Icon = styled('img')({})

export type BadgeIconProps = Omit<ComponentPropsWithoutRef<'img'>, 'size'> & {
  src: string
  alt: string
  size?: keyof typeof IconSize
  disabled?: boolean
  testId?: string
  border?: boolean
  sx?: SxProps
}

/** Renders a small image-sized badge icon */
export const BadgeIcon = ({ border, size = 'sm', sx, testId, disabled = false, ...imgProps }: BadgeIconProps) => {
  // width and height are required, but overridden by responsive design tokens
  const defaultSize = parseFloat(IconSize[size].mobile) * 16 // convert rem to px
  return (
    <Icon
      data-testid={testId}
      loading="lazy"
      width={defaultSize}
      height={defaultSize}
      {...imgProps}
      sx={applySxProps(
        {
          width: IconSize[size],
          height: IconSize[size],
          ...(border && {
            border: (t) => `1px solid ${t.design.Badges.Border.Highlight}`,
            padding: '1px',
            borderRadius: '100%',
            backgroundColor: (t) => t.design.Badges.Fill.Highlight,
          }),
          ...(disabled && {
            filter: 'saturate(0)',
          }),
        },
        sx,
      )}
    />
  )
}
