import React from 'react'
import { getBackgroundUrl } from '@ui/utils'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { LogoImg } from '@ui/images'
import { styled } from '@mui/material/styles'
import NextImage from 'next/image'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { t } from '@lingui/macro'

type ConnectWalletPromptProps = {
  description: string
  connectText: string
  loadingText: string
  isLoading: boolean
  connectWallet: () => void
}

export const ConnectWalletPrompt = ({
  description,
  connectText,
  loadingText,
  connectWallet,
  isLoading,
}: ConnectWalletPromptProps) => (
  <Stack
    padding={7}
    spacing={8}
    width={SizesAndSpaces.MaxWidth.connectWallet}
    maxWidth="90vw"
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
      <CurveLogo src={LogoImg} alt="Curve Logo" />
      <Typography variant="headingXxl">{t`Enter Curve`}</Typography>
    </Stack>
    <Stack spacing={3} alignItems="center">
      <Typography variant="bodyMRegular">{description}</Typography>
      <Button
        size="large"
        color="primary"
        onClick={connectWallet}
        loading={isLoading}
        loadingPosition="start"
        data-testid={`btn-connect-prompt${isLoading ? '-loading' : ''}`}
      >
        {isLoading ? loadingText : connectText}
      </Button>
    </Stack>
  </Stack>
)

const CurveLogo = styled(NextImage)({
  width: '3rem',
  height: '3rem',
  margin: '0 auto',
  '@media (min-width: 43.75rem)': {
    width: '5.5rem',
    height: '5.5rem',
  },
})

export const setMissingProvider = <T extends { step: string; formProcessing?: boolean; error: string }>(slice: {
  setStateByKey: (key: 'formStatus', value: T) => void
  formStatus: T
}): undefined => {
  slice.setStateByKey('formStatus', {
    ...slice.formStatus,
    step: '',
    formProcessing: false,
    error: 'error-invalid-provider',
  })
  return
}
