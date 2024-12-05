import type { Meta } from '@storybook/react'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { StandardCSSProperties } from '@mui/system/styleFunctionSx/StandardCssProperties'
import Typography from '@mui/material/Typography'

const PaletteStory = () => {
  const {
    palette,
    design: { Color, Text },
  } = useTheme()
  return (
    <Box>
      {Object.entries({ palette, Color, Text }).map(([palette, p]) => (
        <Box key={palette}>
          {Object.entries(p)
            .filter(([, options]) => Object.values(options).some((o) => `${o}`.startsWith('#')))
            .map(([type, options]) => (
              <Box key={type} sx={{ marginY: 7 }}>
                <Typography variant="headingMLight">
                  {palette}.{type}
                </Typography>
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
