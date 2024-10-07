import React from 'react'
import styled from 'styled-components'

import Icon from 'ui/src/Icon'
import { Chip } from 'ui/src/Typography'

const IntegrationAppTag = ({
  integrationTag,
}: {
  integrationTag: { displayName: string; color: string } | undefined
}) => {
  const { displayName, color } = integrationTag ?? {}
  return (
    <>
      <FilterIcon size={16} name="StopFilledAlt" fill={color} strokeWidth="1px" stroke="white" />
      <Chip size="xs">{displayName}</Chip>
    </>
  )
}

const FilterIcon = styled(Icon)`
  position: relative;
  top: 4px;
`

export default IntegrationAppTag
