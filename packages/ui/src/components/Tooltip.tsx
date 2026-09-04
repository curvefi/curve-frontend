import lodash from 'lodash'
import type { ReactNode, SyntheticEvent } from 'react'
import Box from '@mui/material/Box'
// eslint-disable-next-line no-restricted-imports
import MuiTooltip, { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { SwipeableDrawer } from '@ui/components/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { InvertTheme } from './ThemeProvider'

export type TooltipProps = MuiTooltipProps & {
  body?: ReactNode
  clickable?: boolean
  /** Show the tooltip content in a drawer on mobile. Mobile tooltips are otherwise disabled. */
  mobileDrawer?: boolean
}

const { MaxHeight, Spacing } = SizesAndSpaces

/** This component is used to wrap the content of a tooltip to cancel any theme inversions during hover */
const TooltipContent = ({ title, children }: { title?: ReactNode; children?: ReactNode }) => (
  // cancel any theme inversion as it's often applied on hover
  <InvertTheme inverted={false}>
    <Box
      sx={{ padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill, width: '100%' }}
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
export const Tooltip = ({
  title,
  body,
  clickable,
  mobileDrawer = false,
  children,
  slotProps,
  ...props
}: TooltipProps) => {
  const isMobile = useIsMobile()
  const [drawerOpen, openDrawer, , , setDrawerOpen] = useSwitch(false)
  const showMobileDrawer = isMobile && mobileDrawer

  if (!(title || body) || (isMobile && !mobileDrawer)) return children

  return (
    <>
      <MuiTooltip
        key={`${isMobile}`} // force remount when switching so we don't change from uncontrolled to controlled internal mui tooltip shenanigans
        title={title && <TooltipContent title={title}>{body}</TooltipContent>}
        slotProps={lodash.merge(slotProps, {
          ...(!clickable && { popper: { sx: { userSelect: 'none', pointerEvents: 'none' } } }), // prevent text selection and pointer events
          tooltip: { sx: { '&': { padding: 0 } } }, // remove padding with inverted color
        })}
        {...props}
        {...(showMobileDrawer && {
          open: false,
          enterTouchDelay: 0,
          onOpen: (event: SyntheticEvent) => {
            props.onOpen?.(event)
            openDrawer()
          },
        })}
      >
        {children}
      </MuiTooltip>
      {showMobileDrawer && (
        <SwipeableDrawer open={drawerOpen} setOpen={setDrawerOpen} paperSx={{ maxHeight: MaxHeight.drawer }}>
          <TooltipContent title={title}>{body}</TooltipContent>
        </SwipeableDrawer>
      )}
    </>
  )
}

export type { MuiTooltipProps }
