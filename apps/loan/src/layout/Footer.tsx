import type { Locale } from '@/lib/i18n'

import { t, Trans } from '@lingui/macro'
import styled, { css } from 'styled-components'
import Image from 'next/image'
import React, { useRef } from 'react'

import { breakpoints } from '@/ui/utils/responsive'
import { sizes } from 'main/src/globalStyle'
import networks from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import { RCDiscordLogo, RCGithubLogo, RCTelegramLogo, RCTwitterLogo } from '@/images'
import Box from '@/ui/Box'
import { ExternalLink, InternalLink } from '@/ui/Link'

type InnerSectionProps = {
  className?: string
}

export const CommunitySection = ({ className, locale }: { locale: Locale['value'] } & InnerSectionProps) => (
  <CommunityWrapper className={className}>
    <SectionItem>
      <StyledExternalLink href="https://twitter.com/curvefinance">{t`Twitter`}</StyledExternalLink>
    </SectionItem>
    <SectionItem>
      <StyledExternalLink href="https://t.me/curvefi">{t`Telegram`}</StyledExternalLink>
      {locale !== 'en' && (
        <>
          {` EN | `}
          <StyledExternalLink href="https://t.me/curveficn">{t`CN`}</StyledExternalLink>
        </>
      )}
    </SectionItem>
    {(locale === 'zh-Hans' || locale === 'zh-Hant') && (
      <SectionItem>
        <StyledExternalLink href="https://imdodo.com/s/147186?inv=7J46">{t`Dodo`}</StyledExternalLink> 
      </SectionItem>
    )}
    <SectionItem>
      <StyledExternalLink href="https://discord.gg/rgrfS7W">{t`Discord`}</StyledExternalLink>
    </SectionItem>
    <SectionItem>
      <StyledExternalLink href="https://www.youtube.com/c/CurveFinance">{t`YouTube`}</StyledExternalLink>
      {locale !== 'en' && (
        <>
          {` EN | `}
          <StyledExternalLink href="https://www.youtube.com/watch?v=FtzDlWdcou8&list=PLh7yM-DPEDYgP-vyEOCIboD3xg_TgJmkj">
            {t`CN`}
          </StyledExternalLink>
        </>
      )}
    </SectionItem>
    {(locale === 'zh-Hans' || locale === 'zh-Hant') && (
      <SectionItem>
        <StyledExternalLink href="https://www.curve.wiki/">{t`Wiki CN`}</StyledExternalLink>
      </SectionItem>
    )}
    <SectionItem>
      <StyledExternalLink href="https://dune.com/mrblock_buidl/Curve.fi">{t`Dune Analytics`}</StyledExternalLink>
    </SectionItem>
    <SectionItem>
      <StyledExternalLink href="https://curvemonitor.com">{t`Curve Monitor`}</StyledExternalLink>
    </SectionItem>
  </CommunityWrapper>
)

CommunitySection.defaultProps = {
  className: '',
}

interface ResourcesSectionProps extends InnerSectionProps {
  chainId: ChainId | null
}

export const ResourcesSection = ({ className, chainId }: ResourcesSectionProps) => {
  const orgUIPath = chainId ? networks[chainId]?.orgUIPath : ''

  return (
    <ResourcesWrapper className={className}>
      <SectionItem>
        <StyledExternalLink href="https://github.com/curvefi/curve-stablecoin/blob/master/doc/curve-stablecoin.pdf">{t`Whitepaper`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href="https://docs.curve.fi/references/audits/audits_pdf/">{t`Audits`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href="https://docs.curve.fi/references/deployed-contracts/">{t`Contracts`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href={`${orgUIPath}/bugbounty`}>{t`Bug Bounty`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href={`${orgUIPath}/rootfaq`}>{t`FAQ`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledInternalLink href="/integrations">
          <Trans>Integrations</Trans>
        </StyledInternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href="https://docs.curve.fi">{t`Developer Docs`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href="https://news.curve.fi/">{t`News`}</StyledExternalLink>
      </SectionItem>
      <SectionItem>
        <StyledExternalLink href="https://resources.curve.fi/">{t`Resources`}</StyledExternalLink>
      </SectionItem>

      {/* section 3 */} 
      <SectionItem>
        <StyledExternalLink href="https://github.com/curvefi/curve-stablecoin">{t`Github`}</StyledExternalLink>
      </SectionItem>
    </ResourcesWrapper>
  )
}

ResourcesSection.defaultProps = {
  className: '',
}

const Footer = ({ chainId }: { chainId: ChainId }) => {
  const footerRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(footerRef, 'footer')

  const locale = useStore((state) => state.locale)

  return (
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
          <Section title="Community">
            <CommunitySection locale={locale} />
          </Section>
          <Section title="Resources">
            <ResourcesSection chainId={chainId} />
          </Section>
        </InfoBox>
      </FooterInnerWrapper>
    </FooterWrapper>
  )
}

interface SectionProps extends InnerSectionProps {
  title: React.ReactNode
}

const Section = ({ className, title, children }: React.PropsWithChildren<SectionProps>) => {
  return (
    <SectionWrapper className={className} as="article">
      <Header>{title}</Header>
      {children}
    </SectionWrapper>
  )
}

const ResourcesWrapper = styled.ul`
  @media (min-width: ${breakpoints.md}rem) {
    column-count: 3;
  }
`

const CommunityWrapper = styled.ul`
  @media (min-width: ${breakpoints.md}rem) {
    min-width: 15rem; //240px
    column-count: 2;
  }
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

const StyledInternalLink = styled(InternalLink)`
  ${linkStyles};
  text-transform: inherit;
  text-decoration: none;
`

const CurveLogo = styled(Image)`
  width: 160px;
  height: 41.59px;
`

export default Footer
