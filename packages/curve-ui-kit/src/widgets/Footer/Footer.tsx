import { FormControlLabel } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { LlamaImg } from '@ui/images'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { AppName } from '@ui-kit/shared/routes'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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

export const Footer = ({ appName, networkName }: Props) => {
  const [isBetaModalOpen, openBetaModal, closeBetaModal] = useSwitch()
  const [isBeta, setIsBeta] = useLocalStorage<boolean>('beta')
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
          onClick={openBetaModal}
        />
        {isBetaModalOpen != null && (
          <ModalDialog open={isBetaModalOpen} title={t`Enable Beta UI Features`} onClose={closeBetaModal}>
            <Typography color="textSecondary">{t`You are enabling beta features that are still in development.`}</Typography>
            <Typography color="textSecondary">{t`These features may not be fully functional.`}</Typography>
            <Typography color="textSecondary">{t`Please provide us feedback if you find any problems.`}</Typography>

            <Box display="inline-flex" alignItems="center" paddingBlock={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isBeta ?? false}
                    onChange={() => setIsBeta(!isBeta)}
                    inputProps={{ 'aria-label': t`Beta Features` }}
                    size="small"
                  />
                }
                label={t`Beta Features`}
                sx={{ marginLeft: 2 }}
              />
            </Box>
          </ModalDialog>
        )}
      </Grid>
    </Box>
  )
}
