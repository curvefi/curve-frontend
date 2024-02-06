import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import Box from '@/ui/Box'

export function ErrorVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  return (
    <Container variant="secondary">
      <Video ref={videoRef} autoPlay muted poster="/images/error-404.jpg">
        <source src="/images/error-404.mp4" type="video/mp4" />
        <source src="/images/error-404.webm" type="video/webm" />
      </Video>
      <Title>404</Title>
      <Description>Page not found</Description>
    </Container>
  )
}

const Video = styled.video`
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Description = styled.p`
  font-size: 2rem;
  z-index: 1;
  opacity: 0.9;
`

const Title = styled.h2`
  font-size: 9rem;
  line-height: 1;
  z-index: 1;
  opacity: 0.9;

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: 10rem;
  }
`

const Container = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: calc(100vh - var(--header-height));
  justify-content: center;
  border: none;

  @media (min-width: ${breakpoints.md}rem) {
    margin: 1.5rem;
    min-height: 56vh;
  }
`

export default ErrorVideo
