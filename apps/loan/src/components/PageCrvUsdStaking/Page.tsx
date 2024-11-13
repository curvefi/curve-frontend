import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import Image from 'next/image'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'

import { RCScrvUSDLogoSM } from 'ui/src/images'

import DocumentHead from '@/layout/DocumentHead'
import ExternalLink from '@/ui/Link/ExternalLink'
import Box from '@/ui/Box'
import Settings from '@/layout/Settings'

import CrvUsdStaking from '@/components/PageCrvUsdStaking'

const mobileBreakpoint = '47.5rem'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  usePageOnMount(params, location, navigate) // handles connecting wallet

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Savings crvUSD`} />
      <Container>
        <HeaderContainer mobileBreakpoint={mobileBreakpoint}>
          <Image height={55} src={RCScrvUSDLogoSM} alt="crvUSD logo" />
          <Box flex flexColumn>
            <Title>{t`Savings crvUSD`}</Title>
            <Description>{t`Let your idle crvUSD do more for you.`}</Description>
          </Box>
        </HeaderContainer>
        <CrvUsdStaking mobileBreakpoint={mobileBreakpoint} />
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`

const HeaderContainer = styled.div<{ mobileBreakpoint: string }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  padding: var(--spacing-3) 0;
  gap: var(--spacing-3);
  @media (max-width: ${({ mobileBreakpoint }) => mobileBreakpoint}) {
    padding: var(--spacing-3);
  }
`

const Description = styled.p``

const Title = styled.h1`
  font-size: var(--font-size-7);
  text-transform: uppercase;
`

export default Page
