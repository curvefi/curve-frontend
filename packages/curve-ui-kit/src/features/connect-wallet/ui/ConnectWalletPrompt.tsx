import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { CURVE_LOGO_URL, getBackgroundUrl } from '@ui/utils/utilsConstants'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { isLoading, useCurve } from '../lib/CurveContext'
import { useWallet } from '../lib/useWallet'

const { Spacing, MaxWidth } = SizesAndSpaces

export const ConnectWalletPrompt = ({ description, testId }: { description: string; testId?: string }) => {
  const { isInitialized, connectState } = useCurve()
  const { connect } = useWallet()
  const isConnecting = isLoading(connectState) || !isInitialized
  return (
    <Stack data-testid={testId} sx={{ alignItems: 'center', marginBlock: Spacing.lg }}>
      <Stack
        spacing={Spacing['3xl']}
        sx={{
          padding: Spacing.xxl,
          width: MaxWidth.connectWallet,
          maxWidth: '90dvw',

          // note: not using mui colors as the color needs to match the background image and we don't have one for chad
          backgroundColor: 'var(--table--background-color)',
        }}
      >
        <Stack
          spacing={3}
          sx={{
            paddingBlock: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: t => `url(${getBackgroundUrl(t.key)})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <CurveLogo src={CURVE_LOGO_URL} alt="Curve Logo" />
          <Typography variant="headingXxl">{t`Enter Curve`}</Typography>
        </Stack>
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="bodyMRegular">{description}</Typography>
          <Button
            size="large"
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
            onClick={() => connect()}
            loading={isConnecting}
            loadingPosition="start"
            data-testid={`btn-connect-prompt${isConnecting ? '-loading' : ''}`}
          >
            {isConnecting ? t`Connecting` : t`Connect`}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}

const CurveLogo = styled('img')({
  width: '3rem',
  height: '3rem',
  margin: '0 auto',
  '@media (min-width: 43.75rem)': {
    width: '5.5rem',
    height: '5.5rem',
  },
})
