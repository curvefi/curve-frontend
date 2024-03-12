import { Link } from 'react-router-dom'
import Image from 'next/image'
import styled, { css } from 'styled-components'

import { ROUTE } from '@/constants'
import { parseLocale } from '@/lib/i18n'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { breakpoints } from '@/ui/utils/responsive'
import { LogoImg, RCLogoText } from '@/images'
import { ExternalLink } from '@/ui/Link'

type Props = {
  pathname?: string
  className?: string
}

// TODO: move to UI library
const BrandingLink = ({ pathname, className }: Props) => {
  const chainId = useStore((state) => state.api?.chainId)
  const locale = useStore((state) => state.locale)
  let updatedPathname = pathname ?? '/'

  if (!pathname && chainId) {
    const network = networks[chainId]?.id
    const parsedLocale = parseLocale(locale)

    if (network) {
      updatedPathname = parsedLocale
        ? `${parsedLocale.pathnameLocale}/${network}${ROUTE.PAGE_MARKETS}`
        : `/${network}${ROUTE.PAGE_MARKETS}`
    }
  }

  if (pathname?.startsWith('http')) {
    return (
      <StyledExternalLink $noStyles href={pathname} target="_self">
        <CurveLogo src={LogoImg} alt="Curve" /> <StyledCurveLogoText className={className} />
      </StyledExternalLink>
    )
  } else {
    return (
      <StyledInternalLink to={updatedPathname}>
        <CurveLogo src={LogoImg} alt="Curve" /> <StyledCurveLogoText className={className} />
      </StyledInternalLink>
    )
  }
}

const StyledCurveLogoText = styled(RCLogoText)`
  height: 15.63px;
  width: 60px;

  path.curve-logo-text_svg__curve-logo-letter {
    fill: var(--nav_logo--color);
  }

  @media (min-width: ${breakpoints.md}rem) {
    height: 19px;
    width: 73px;
  }
`

const CurveLogo = styled(Image)`
  width: 25px;
  height: 25px;

  margin-right: var(--spacing-2);

  @media (min-width: ${breakpoints.md}rem) {
    width: 30px;
    height: 30px;
  }
`

const LinkCss = css`
  align-items: center;
  display: inline-flex;
`

const StyledExternalLink = styled(ExternalLink)`
  ${LinkCss}
`

const StyledInternalLink = styled(Link)`
  ${LinkCss}
`

export default BrandingLink
