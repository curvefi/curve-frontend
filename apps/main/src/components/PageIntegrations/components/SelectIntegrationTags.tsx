import Icon from '@/ui/Icon'
import type { IntegrationTag } from '@/ui/Integration/types'

import Select from '@/ui/Select'
import { t } from '@lingui/macro'
import React from 'react'
import { Item } from 'react-stately'
import styled from 'styled-components'

import type { FormStatus } from '@/components/PageIntegrations/types'

const SelectIntegrationTags = ({
  integrationsTagsList,
  filterKey,
  formStatus,
  updatePath,
}: {
  integrationsTagsList: IntegrationTag[]
  filterKey: string
  formStatus: FormStatus
  updatePath({ filterKey, filterNetworkId }: { filterKey?: React.Key; filterNetworkId?: React.Key }): void
}) => {
  return (
    <Select
      aria-label={t`Select tag`}
      items={integrationsTagsList}
      loading={formStatus.isLoading}
      minWidth="200px"
      selectedKey={filterKey}
      onSelectionChange={(filterKey) => updatePath({ filterKey })}
      onSelectionDelete={filterKey !== 'all' ? () => updatePath({ filterKey: 'all' }) : undefined}
    >
      {({ id, displayName, color = 'transparent' }: IntegrationTag) => {
        const opacity = id === 'all' ? 0 : 1
        return (
          <Item key={id} textValue={id}>
            {color && (
              <IconWrapper>
                <Icon
                  size={16}
                  name="StopFilledAlt"
                  fill={color}
                  fillOpacity={opacity}
                  strokeWidth="1px"
                  stroke="white"
                  strokeOpacity={opacity}
                />
              </IconWrapper>
            )}
            <strong>{displayName}</strong>
          </Item>
        )
      }}
    </Select>
  )
}

SelectIntegrationTags.displayName = 'SelectIntegrationTags'

const IconWrapper = styled.span`
  margin-right: 0.25rem;

  svg {
    position: relative;
    top: 2px;
  }
`

export default SelectIntegrationTags
