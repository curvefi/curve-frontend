import { useUserProfileStore } from '@ui-kit/features/user-profile'
import React from 'react'
import { getBackgroundUrl } from '@ui/utils'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { LogoImg } from '@ui/images'
import { styled } from '@mui/material/styles'
import NextImage from 'next/image'
import Typography from '@mui/material/Typography'

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
    sx={{
      backgroundColor: 'var(--table--background-color)',
      maxWidth: '50rem',
    }}
  >
    <Box display="flex" position="relative" width="100%">
      <Box
        component="img"
        src={getBackgroundUrl(useUserProfileStore((state) => state.theme))}
        alt="Curve Logo"
        width="1400px"
        maxWidth="100%"
        height="100%"
        sx={{ objectFit: 'contain' }}
      />
      <Stack
        position="absolute"
        alignItems="center"
        width="100%"
        top="50%"
        left="50%"
        sx={{ transform: 'translate(-50%, -50%)' }}
        spacing={3}
      >
        <CurveLogo src={LogoImg} alt="Curve Logo" />
        <Typography variant="headingXxl">Enter Curve</Typography>
      </Stack>
    </Box>
    <Stack gap={3} alignItems="center" width="100%" margin="0 auto">
      <Typography variant="bodyMRegular">{description}</Typography>
      <Button size="large" color="primary" onClick={connectWallet} loading={isLoading} loadingPosition="start">
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
