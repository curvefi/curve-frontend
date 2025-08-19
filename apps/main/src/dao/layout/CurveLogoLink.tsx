import { styled } from 'styled-components'
import { LogoImg, RCLogoText } from '@ui/images'
import { breakpoints } from '@ui/utils/responsive'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'

export const CurveLogoLink = ({ className, hideLabel }: { className?: string; hideLabel?: boolean }) => (
  <StyledInternalLink href="/">
    <CurveLogoImg src={LogoImg} alt="Curve" /> {!hideLabel && <StyledCurveLogoText className={className} />}
  </StyledInternalLink>
)

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

const CurveLogoImg = styled.img`
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
