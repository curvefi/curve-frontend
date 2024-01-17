import { Link } from 'react-router-dom'
import Image from 'next/image'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { curveProps } from '@/lib/utils'
import { getPath } from '@/utils/utilsRouter'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { LogoImg, RCLogoText } from '@/images'

export const CurveLogoLink = ({ className, hideLabel }: { className?: string; hideLabel?: boolean }) => {
  const curve = useStore((state) => state.curve)
  const locale = useStore((state) => state.locale)

  const { chainId } = curveProps(curve)
  let updatedPathname = '/'

  if (chainId) {
    const network = networks[chainId]?.id

    if (network) {
      const endPathname = 'PAGE_SWAP' in networks[chainId]?.excludeRoutes ? ROUTE.PAGE_POOLS : ROUTE.PAGE_SWAP
      updatedPathname = getPath({ locale, network }, endPathname)
    }
  }

  return (
    <StyledInternalLink to={updatedPathname}>
      <CurveLogoImg src={LogoImg} alt="Curve" /> {!hideLabel && <StyledCurveLogoText className={className} />}
    </StyledInternalLink>
  )
}

const StyledCurveLogoText = styled(RCLogoText)`
  height: 15.63px;
  width: 60px;

  path.curve-logo-text_svg__curve-logo-letter {
    fill: var(--nav_logo--color);
  }

  @media (min-width: ${breakpoints.md}) {
    height: 19px;
    width: 73px;
  }
`

const CurveLogoImg = styled(Image)`
  width: 25px;
  height: 25px;

  margin-right: var(--spacing-2);

  @media (min-width: ${breakpoints.md}) {
    width: 30px;
    height: 30px;
  }
`

const StyledInternalLink = styled(Link)`
  align-items: center;
  display: inline-flex;
`

export default CurveLogoLink
