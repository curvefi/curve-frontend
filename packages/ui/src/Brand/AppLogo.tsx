import * as React from 'react'
import { Link } from 'react-router-dom'
import Image from 'next/image'
import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils/responsive'
import { LogoImg, RCLogoText } from 'ui/src/images'

export type AppLogoProps = {
  className?: string
  appName: string
  showBeta?: boolean
}

const AppLogo = ({ className = '', appName, showBeta }: AppLogoProps) => {
  return (
    <Wrapper className={className}>
      <StyledInternalLink to="/" $haveAppName={!!appName}>
        <CurveLogo src={LogoImg} alt="Curve" /> <StyledCurveLogoText />
        <AppName>{appName}</AppName>
      </StyledInternalLink>
      {showBeta && (
        <div>
          <Beta>Beta</Beta>
        </div>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;

  @media (min-width: ${breakpoints.sm}rem) {
    transform: none;
    width: auto;
  }
`

const Beta = styled.span`
  background-color: var(--warning-400);
  color: var(--black);
  font-size: var(--font-size-1);
  font-weight: bold;
  padding: var(--spacing-1) var(--spacing-2);
  margin-left: var(--spacing-1);
  margin-top: 2px;
`

const AppName = styled.span`
  color: inherit;
  font-size: var(--font-size-1);
  font-weight: bold;
  margin-left: 38px;
  margin-top: 39px;
  position: absolute;
  text-decoration: none;
  text-transform: uppercase;
`

const StyledCurveLogoText = styled(RCLogoText)`
  height: 19px;
  width: 73px;

  path.curve-logo-text_svg__curve-logo-letter {
    fill: var(--nav_logo--color);
  }
`

const CurveLogo = styled(Image)`
  width: 30px;
  height: 30px;
  margin-right: var(--spacing-2);
`

const StyledInternalLink = styled(Link)<{ $haveAppName: boolean }>`
  align-items: center;
  color: inherit;
  display: inline-flex;
  margin-right: var(--spacing-1);

  ${({ $haveAppName }) => {
    if ($haveAppName) {
      return `
          margin-bottom: 12px;
          
          ${CurveLogo} {
          margin-top: 12px;
        `
    }
  }};
`

export default AppLogo
