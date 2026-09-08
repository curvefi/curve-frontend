import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ReleaseChannelDialog } from '@ui/features/user-profile/settings/ReleaseChannelDialog'
import { useIsTiny } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { LlamaImg } from '@ui/images'
import { ReleaseChannel } from '@ui/lib/env'
import { Description } from './Description'
import { type FooterSection } from './footer-sections.util'
import { Section } from './Section'

const Llama = styled('img')({ alt: 'Llama', position: 'absolute' })

type FooterProps = { sections: FooterSection[] }

export const Footer = ({ sections }: FooterProps) => {
  const [isBetaModalOpen, openBetaModal, closeBetaModal] = useSwitch()
  const isTiny = useIsTiny()
  return (
    <Box
      component="footer"
      data-testid="footer"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: t => t.design.Layer[3].Fill,
        paddingInline: SizesAndSpaces.Spacing.lg,
        paddingBlock: SizesAndSpaces.Spacing.xl,
      }}
    >
      <Grid
        container
        spacing={SizesAndSpaces.Grid.Column_Spacing}
        data-testid="footer-content"
        sx={{ rowGap: SizesAndSpaces.Grid.Row_Spacing, position: 'relative', maxWidth: SizesAndSpaces.MaxWidth.footer }}
      >
        <Grid
          size={{
            mobile: 12,
            desktop: 3,
          }}
        >
          <Description />
        </Grid>

        {sections.map(section => (
          <Grid key={section.title} size={{ mobile: 12, tablet: 4, desktop: 3 }}>
            <Section {...section} isTiny={isTiny} />
          </Grid>
        ))}

        <Llama
          src={LlamaImg}
          sx={{ height: SizesAndSpaces.IconSize.xxl, right: SizesAndSpaces.Spacing.lg, cursor: 'pointer' }}
          onClick={openBetaModal}
        />
        {isBetaModalOpen != null && (
          <ReleaseChannelDialog open={isBetaModalOpen} onClose={closeBetaModal} channel={ReleaseChannel.Beta} />
        )}
      </Grid>
    </Box>
  )
}
