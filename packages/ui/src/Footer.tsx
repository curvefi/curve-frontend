import styled, { css } from 'styled-components'
import Image from 'next/image'
import { type RefObject } from 'react'
import { breakpoints, sizes } from './utils'
import { RCDiscordLogo, RCGithubLogo, RCTelegramLogo, RCTwitterLogo } from '@/images'
import Box from './Box'
import { ExternalLink } from './Link'
import { NavigationSection } from 'curve-common/src/widgets/Header/types'

const Footer = ({ sections, footerRef }: { sections: NavigationSection[], footerRef: RefObject<HTMLDivElement> }) => (
  <FooterWrapper ref={footerRef}>
    <FooterInnerWrapper grid gridAutoFlow="column" gridColumnGap={3} flexAlignItems="start">
      <div>
        <FooterLogoWrapper>
          <CurveLogo priority src={require('@/images/logo-white.png')} alt="Curve" />
        </FooterLogoWrapper>
        <Box flex padding="1rem 0">
          <LlamaImg src={require('@/images/llama.png')} alt="Llama" />{' '}
          <ExternalLinkButton href="https://twitter.com/CurveFinance" size="small" variant="contained">
            <RCTwitterLogo />
          </ExternalLinkButton>
          <ExternalLinkButton href="https://t.me/curvefi" size="small" variant="contained">
            <RCTelegramLogo />
          </ExternalLinkButton>
          <ExternalLinkButton href="https://github.com/curvefi" size="small" variant="contained">
            <RCGithubLogo />
          </ExternalLinkButton>
          <ExternalLinkButton href="https://discord.gg/9uEHakc" size="small" variant="contained">
            <RCDiscordLogo />
          </ExternalLinkButton>
        </Box>
      </div>

      <InfoBox grid gridAutoFlow="column">
        {sections.map((section) => (
          <Section key={section.title} title={section.title}>
            {section.links.map(({ label, route }) => (
              <SectionItem key={route}>
                <StyledExternalLink href={route}>{label}</StyledExternalLink>
              </SectionItem>
            ))}
          </Section>
        ))}
      </InfoBox>
    </FooterInnerWrapper>
  </FooterWrapper>
)

interface SectionProps {
  className?: string
  columnCount?: number
  title: React.ReactNode
}

const Section = ({ className, title, children }: React.PropsWithChildren<SectionProps>) => (
  <SectionWrapper className={className} as="article">
    <Header>{title}</Header>
    <SectionChildrenWrapper>{children}</SectionChildrenWrapper>
  </SectionWrapper>
)

const SectionChildrenWrapper = styled.ul`
  @media (min-width: ${breakpoints.md}rem) { column-count: 2 }
  @media (min-width: ${breakpoints.lg}rem) { column-count: 3 }
`

const FooterLogoWrapper = styled.div`
  width: 160px;
`

const InfoBox = styled(Box)`
  grid-column-gap: 1rem;
`

const StyledExternalLink = styled(ExternalLink)`
  font-size: 0.875rem;
  text-decoration: none;
  text-transform: initial;

  color: inherit;

  :hover {
    color: var(--footer--hover-color);
  }
`

const LlamaImg = styled(Image)`
  height: 1.875rem; // 30px
  width: 1.875rem;
  margin-right: 1.25rem; // 20px
`

const SectionItem = styled.li``

const Header = styled.header`
  margin-bottom: var(--spacing-narrow);

  font-size: var(--font-size-4);
  font-weight: var(--font-weight--bold);
`

const SectionWrapper = styled.div`
  li:not(:last-of-type) {
    margin-bottom: var(--spacing-1);
  }
`

const FooterInnerWrapper = styled(Box)`
  margin: 0 auto;
  max-width: var(--width);

  @media (min-width: ${breakpoints.md}rem) {
    align-items: flex-start;
    display: grid;
    padding: 2rem 1rem;
    grid-gap: 3rem;
  }
`

const FooterWrapper = styled.footer`
  color: var(--footer--color);
  background: var(--footer--background-color);
`

const linkStyles = css`
  align-items: center;
  display: flex;
  height: 100%;
  margin-right: 0.25rem;

  color: inherit;

  :hover {
    color: inherit;
    background-color: inherit;
  }

  svg {
    height: ${sizes['md']};
    width: ${sizes['md']};
    fill: currentColor;
    user-select: none;
    vertical-align: middle;
  }
`

const ExternalLinkButton = styled(ExternalLink)`
  ${linkStyles};
`

const CurveLogo = styled(Image)`
  width: 160px;
  height: 41.59px;
`

export default Footer
