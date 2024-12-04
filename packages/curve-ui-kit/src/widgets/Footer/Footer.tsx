import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'

import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { LlamaImg } from 'ui/src/images'

import { Description } from './Description'
import { Section } from './Section'
import { sections } from './Sections'

const LlamaImageSrc = (LlamaImg as unknown as { src: string }).src
const Llama = styled('img')({
  alt: 'Llama',
  position: 'absolute',
})

export const Footer = () => (
  <Grid
    container
    component="footer"
    data-testid="footer"
    spacing={1}
    rowGap={4}
    sx={(t) => ({
      position: 'relative',
      paddingInline: SizesAndSpaces.Spacing.lg,
      paddingBlock: SizesAndSpaces.Spacing.xl,
      backgroundColor: t.design.Layer[3].Fill,
    })}
  >
    <Grid
      size={{
        mobile: 12,
        tablet: 12,
        desktop: 3,
      }}
    >
      <Description />
    </Grid>

    {sections.map((section, i) => (
      <Grid
        key={i}
        size={{
          mobile: 12,
          tablet: 4,
          desktop: 3,
        }}
      >
        <Section key={section.title} {...section} />
      </Grid>
    ))}

    <Llama src={LlamaImageSrc} sx={{ right: SizesAndSpaces.Spacing.lg }} />
  </Grid>
)
