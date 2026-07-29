import lodash from 'lodash'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
// eslint-disable-next-line no-restricted-imports
import MuiTooltip, { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useMobileTooltipDrawer } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { InvertTheme } from './ThemeProvider'

export type TooltipProps = MuiTooltipProps & {
  body?: ReactNode
  clickable?: boolean
}

const { MaxHeight, Spacing } = SizesAndSpaces

/**
 * This component is used to wrap the content of a tooltip to cancel any theme inversions during hover.
 */
const TooltipContent = (
  { title, children, fullWidth = false }: { title?: ReactNode; children?: ReactNode; fullWidth?: boolean }, // cancel any theme inversion as it's often applied on hover
) => (
  <InvertTheme inverted={false}>
    <Box
      sx={{
        padding: Spacing.md,
        backgroundColor: t => t.design.Layer[1].Fill,
        width: '100%',
        ...(fullWidth && { '&& > *': { maxWidth: 'none', width: '100%' } }),
      }}
      onClick={e => e.stopPropagation()} // prevent changing pages when clicking on the tooltip
    >
      {title && (
        <Typography variant="bodyMBold" color="textPrimary" component="div">
          {title}
        </Typography>
      )}
      {children}
    </Box>
  </InvertTheme>
)

/**
 * Adds a tooltip to the children with a title and content, making sure the content is not inverted on hover.
 * It sucks that we have many components with this name, but we should try to use this one only 🤓
 */
export const Tooltip = ({ title, body, clickable, children, slotProps, ...props }: TooltipProps) => {
  const isMobile = useIsMobile()
  const isMobileDrawerEnabled = useMobileTooltipDrawer() && isMobile
  const [drawerOpen, openDrawer, , , setDrawerOpen] = useSwitch(false)

  if (!title && !body) return children

  const tooltipProps = {
    title: title && <TooltipContent title={title}>{body}</TooltipContent>,
    slotProps: lodash.merge(slotProps, {
      ...(!clickable && { popper: { sx: { userSelect: 'none', pointerEvents: 'none' } } }), // prevent text selection and pointer events
      tooltip: { sx: { '&': { padding: 0 } } }, // remove padding with inverted color
    }),
    ...props,
  }

  if (!isMobileDrawerEnabled || props.open !== undefined) {
    return <MuiTooltip {...tooltipProps}>{children}</MuiTooltip>
  }

  return (
    <>
      <MuiTooltip
        {...tooltipProps}
        enterTouchDelay={0}
        open={false}
        onOpen={event => {
          props.onOpen?.(event)
          openDrawer()
        }}
      >
        {children}
      </MuiTooltip>
      <SwipeableDrawer open={drawerOpen} setOpen={setDrawerOpen} paperSx={{ maxHeight: MaxHeight.drawer }}>
        <TooltipContent fullWidth title={title}>
          {body}
        </TooltipContent>
      </SwipeableDrawer>
    </>
  )
}

export type { MuiTooltipProps }
