import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { LlamaImg } from '@ui/images'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { AppName } from '@ui-kit/shared/routes'
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
          <Dialog open={isBetaModalOpen} onClose={closeBetaModal}>
            <Card
              sx={{ width: SizesAndSpaces.ModalWidth.md, maxWidth: '100vw', display: 'flex', flexDirection: 'column' }}
            >
              <CardHeader
                action={
                  <IconButton onClick={closeBetaModal} size="extraSmall">
                    <CloseIcon />
                  </IconButton>
                }
                title={
                  <Typography variant="headingXsBold" color="textSecondary">
                    {isBeta ? t`Enable Beta Features` : t`Disable Beta Features`}
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {[
                  t`Get early access to upcoming features and UI experiments before they go live.`,
                  t`These are work-in-progress tools meant for testing, feedback, and iteration. You might experience minor bugs or visual inconsistencies — but your funds remain safe, and core functionality is unaffected.`,
                  t`By enabling beta mode, you help shape the future of the Curve interface.`,
                  t`You can turn this off at any time.`,
                ].map((p) => (
                  <Typography color="textSecondary" key={p} paddingBlock={4}>
                    {p}
                  </Typography>
                ))}
              </CardContent>
              <CardActions>
                <Button
                  color={isBeta ? 'secondary' : 'primary'}
                  onClick={() => setIsBeta(!isBeta)}
                  sx={{ width: '100%' }}
                >
                  {isBeta ? t`Disable Beta Features` : t`Enable Beta Features`}
                </Button>
              </CardActions>
            </Card>
          </Dialog>
        )}
      </Grid>
    </Box>
  )
}
