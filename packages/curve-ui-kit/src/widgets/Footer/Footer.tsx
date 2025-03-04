import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'

import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AppName } from '@ui-kit/shared/routes'
import { LlamaImg } from '@ui/images'

import { Description } from './Description'
import { Section } from './Section'
import { getSections } from './Sections'

const LlamaImageSrc = (LlamaImg as unknown as { src: string }).src
const Llama = styled('img')({
  alt: 'Llama',
  position: 'absolute',
})

type Props = {
  networkName: string
  appName: AppName
}

export const Footer = ({ appName, networkName }: Props) => (
  <Box
    component="footer"
    data-testid="footer"
    display="flex"
    justifyContent="center"
    sx={(t) => ({
      backgroundColor: t.design.Layer[3].Fill,
      paddingInline: SizesAndSpaces.Spacing.lg,
      paddingBlock: SizesAndSpaces.Spacing.xl,
    })}
  >
    <Grid
      container
      spacing={SizesAndSpaces.Grid.Column_Spacing}
      rowGap={SizesAndSpaces.Grid.Row_Spacing}
      sx={{
        position: 'relative',
        maxWidth: SizesAndSpaces.MaxWidth.footer,
      }}
      data-testid="footer-content"
    >
      <Grid
        size={{
          mobile: 12,
          desktop: 3,
        }}
      >
        <Description />
      </Grid>

      {getSections(appName).map((section) => (
        <Grid
          key={section.title}
          size={{
            mobile: 12,
            tablet: 4,
            desktop: 3,
          }}
        >
          <Section {...section} networkName={networkName} appName={appName} />
        </Grid>
      ))}

      <Llama
        src={LlamaImageSrc}
        sx={{
          height: SizesAndSpaces.IconSize.xxl,
          right: SizesAndSpaces.Spacing.lg,
        }}
      />
    </Grid>
  </Box>
)
