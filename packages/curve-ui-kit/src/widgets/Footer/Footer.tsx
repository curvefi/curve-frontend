import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { LlamaImg } from '@ui/images'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { AppName } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'
import { ReleaseChannelDialog } from '../../features/user-profile/settings/ReleaseChannelDialog'
import { showReleaseChannelSnackbar } from '../../features/user-profile/settings/settings.util'
import { Description } from './Description'
import { Section } from './Section'
import { getSections } from './Sections'

const Llama = styled('img')({
  alt: 'Llama',
  position: 'absolute',
})

type FooterProps = {
  networkId: string
  appName: AppName
}

export const Footer = ({ appName, networkId }: FooterProps) => {
  const [isBetaModalOpen, openBetaModal, closeBetaModal] = useSwitch()
  const isTiny = useIsTiny()
  return (
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

        {getSections().map((section) => (
          <Grid
            key={section.title}
            size={{
              mobile: 12,
              tablet: 4,
              desktop: 3,
            }}
          >
            <Section {...section} networkId={networkId} appName={appName} isTiny={isTiny} />
          </Grid>
        ))}

        <Llama
          src={LlamaImg}
          sx={{
            height: SizesAndSpaces.IconSize.xxl,
            right: SizesAndSpaces.Spacing.lg,
            cursor: 'pointer',
          }}
          onClick={openBetaModal}
        />
        {isBetaModalOpen != null && (
          <ReleaseChannelDialog
            open={isBetaModalOpen}
            onClose={closeBetaModal}
            channel={ReleaseChannel.Beta}
            onChanged={(newChannel, oldChannel) => {
              showReleaseChannelSnackbar(
                ReleaseChannel.Beta,
                (newChannel === ReleaseChannel.Stable ? oldChannel : newChannel) as
                  | ReleaseChannel.Beta
                  | ReleaseChannel.Legacy,
              )
            }}
          />
        )}
      </Grid>
    </Box>
  )
}
