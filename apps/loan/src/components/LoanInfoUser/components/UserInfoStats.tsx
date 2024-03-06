import type { PropsWithChildren } from 'react'
import type { TooltipProps } from '@/ui/Tooltip/types'

import styled from 'styled-components'

import { Chip } from '@/ui/Typography'
import Icon from '@/ui/Icon'
import TextCaption from '@/ui/TextCaption'

type Props = {
  title: string
  tooltip?: string
  tooltipProps?: TooltipProps
}

const UserInfoStats = ({ title, children, tooltip, tooltipProps, ...props }: PropsWithChildren<Props>) => {
  return (
    <div {...props}>
      {tooltip ? (
        <StyledChip tooltip={tooltip} tooltipProps={tooltipProps} isBlock isBold>
          <span className="label">{title}</span> <Icon className="svg-tooltip" size={16} name="InformationSquare" />
        </StyledChip>
      ) : (
        <TextCaption className="label" isBlock isBold isCaps>
          {title}
        </TextCaption>
      )}
      {children ?? '-'}
    </div>
  )
}

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
