import type { Meta } from '@storybook/react'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { StandardCSSProperties } from '@mui/system/styleFunctionSx/StandardCssProperties'
import Typography from '@mui/material/Typography'

const PaletteStory = () => {
  const { palette } = useTheme()
  return (
    <Box>
      {Object.entries(palette)
        .filter(([, options]) => Object.values(options).filter((o) => typeof o === 'string').length)
        .map(([type, options]) => (
          <Box>
            <Typography variant="headingMBold">{type}</Typography>
            <Box display="flex" flexDirection="row" maxWidth="100%" flexWrap="wrap">
              {Object.entries(options)
                .filter(([, color]) => typeof color == 'string')
                .map(([key, color]) => (
                  <Box title={`${type}.${key}`} key={`${type}.${key}`}>
                    <Box maxWidth={100} textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                      {key}
                    </Box>
                    <Box
                      width={100}
                      height={100}
                      border={1}
                      bgcolor={color as StandardCSSProperties['backgroundColor']}
                    />
                  </Box>
                ))}
            </Box>
          </Box>
        ))}
    </Box>
  )
}

const meta: Meta = {
  title: 'UI Kit/Primitives/Palette',
  component: PaletteStory,
}

export const Palette = {}
export default meta
