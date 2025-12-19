import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { CURVE_LOGO_URL, getBackgroundUrl } from '@ui/utils'
import { isLoading, useCurve, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth } = SizesAndSpaces

export const ConnectWalletPrompt = ({ description, testId }: { description: string; testId?: string }) => {
  const { isReconnecting, connectState } = useCurve()
  const { connect } = useWallet()
  const isConnecting = isLoading(connectState) || isReconnecting
  return (
    <Stack alignItems="center" marginBlock={Spacing.lg} data-testid={testId}>
      <Stack
        padding={Spacing.xxl}
        spacing={Spacing['3xl']}
        width={MaxWidth.connectWallet}
        maxWidth="90dvw"
        sx={{
          // note: not using mui colors as the color needs to match the background image and we don't have one for chad
          backgroundColor: 'var(--table--background-color)',
        }}
      >
        <Stack
          spacing={3}
          paddingBlock={8}
          alignItems="center"
          justifyContent="center"
          sx={{
            backgroundImage: (t) => `url(${getBackgroundUrl(t.key)})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <CurveLogo src={CURVE_LOGO_URL} alt="Curve Logo" />
          <Typography variant="headingXxl">{t`Enter Curve`}</Typography>
        </Stack>
        <Stack spacing={3} alignItems="center">
          <Typography variant="bodyMRegular">{description}</Typography>
          <Button
            size="large"
            color="primary"
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
