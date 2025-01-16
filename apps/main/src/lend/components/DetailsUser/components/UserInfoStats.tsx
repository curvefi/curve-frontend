import type { PropsWithChildren } from 'react'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BoxProps } from '@ui/Box/types'

import styled from 'styled-components'

import { Chip } from '@ui/Typography'
import Icon from '@ui/Icon'
import TextCaption from '@ui/TextCaption'

type Props = {
  title: string
  tooltip?: string
  tooltipProps?: TooltipProps
}

const UserInfoStats = ({ title, children, tooltip, tooltipProps, ...props }: PropsWithChildren<Props & BoxProps>) => (
  <span {...props}>
    {tooltip ? (
      <StyledChip tooltip={tooltip} tooltipProps={tooltipProps} isBlock isBold>
        {title} <Icon className="svg-tooltip" size={16} name="InformationSquare" />
      </StyledChip>
    ) : (
      <TextCaption isBlock isBold isCaps>
        {title}
      </TextCaption>
    )}
    {children ?? '-'}
  </span>
)

const StyledChip = styled(Chip)`
  display: block;
  font-size: var(--font-size-1);
  margin-bottom: -3px;
  position: relative;
  top: -4px;
  text-transform: uppercase;

  .svg-tooltip {
    top: 3px;
  }
`

export default UserInfoStats
