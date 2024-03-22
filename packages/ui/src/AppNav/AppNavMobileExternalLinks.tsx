import React from 'react'
import styled from 'styled-components'

import Box from 'ui/src/Box'
import ExternalLink from 'ui/src/Link/ExternalLink'

const AppNavMobileExternalLinks = ({
  links,
  comp: Comp,
}: {
  links?: { id: string; href: string; label: string }[]
  comp?: React.ReactNode
}) => {
  return (
    <>
      {links ? (
        <Box grid gridGap={2} margin="var(--spacing-2) 0 0 0">
          {links.map(({ id, href, label }) => {
            return (
              <StyledExternalLink key={id} href={href}>
                {label}
              </StyledExternalLink>
            )
          })}
        </Box>
      ) : (
        Comp
      )}
    </>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  align-items: center;
  display: flex;
  font-weight: inherit;
  min-height: 1.125rem;
`

export default AppNavMobileExternalLinks
