import styled from 'styled-components'
import React from 'react'
import Image from 'next/image'
import Button from '@mui/material/Button'
import Spinner from '../Spinner'

import { LogoImg } from '../images'
import { getBackgroundUrl } from 'ui/src/utils'

type ConnectWalletPromptProps = {
  connectWallet: () => void
  isLoading: boolean
  description: string
  connectText: string
  loadingText: string
  theme: 'light' | 'dark'
}

const ConnectWalletPrompt: React.FC<ConnectWalletPromptProps> = ({
  connectWallet,
  isLoading,
  description,
  connectText,
  loadingText,
  theme = 'light',
}) => {
  const BackgroundSvg = getBackgroundUrl(theme)
  return (
    <Wrapper>
      <ImageWrapper>
        <StyledBackground src={BackgroundSvg} alt="Curve Logo" />
        <OverlayWrapper>
          <CurveLogo src={LogoImg} alt="Curve Logo" />
          <OverlayText>Enter Curve</OverlayText>
        </OverlayWrapper>
      </ImageWrapper>
      <ContentWrapper>
        <p>{description}</p>
        {isLoading ? (
          <Button disabled size="large" color="primary" endIcon={<Spinner isDisabled size={15} />}>
            {loadingText}
          </Button>
        ) : (
          <Button size="large" color="primary" onClick={connectWallet} data-testid="btn-connect-prompt">
            {connectText}
          </Button>
        )}
      </ContentWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4);
  background-color: var(--table--background-color);
  max-width: 50rem;
  width: 100%;
  flex: 1;
`

const CurveLogo = styled(Image)`
  width: 3rem;
  height: 3rem;
  margin: 0 auto;
  @media (min-width: 43.75rem) {
    width: 5.5rem;
    height: 5.5rem;
  }
`

const ImageWrapper = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  flex: 1;
`

const OverlayWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const StyledBackground = styled.img`
  width: 1400px;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
`

const OverlayText = styled.p`
  font-size: 2.5rem;
  font-weight: bold;
  color: inherit;
  @media (min-width: 43.75rem) {
    font-size: 4rem;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  margin: 0 auto;
`

export default ConnectWalletPrompt
