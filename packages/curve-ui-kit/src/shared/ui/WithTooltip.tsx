import { default as Tooltip, TooltipProps } from '@mui/material/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'

/**
 * A component that wraps children with a Tooltip when a title is provided.
 * Useful for when you want to use the same child and don't know whether a tooltip is needed.
 * The `title` passed to the Tooltip component is used to determine whether the tooltip should be rendered.
 */
export const WithTooltip = (props: TooltipProps) => <WithWrapper Wrapper={Tooltip} wrap={!!props.title} {...props} />
