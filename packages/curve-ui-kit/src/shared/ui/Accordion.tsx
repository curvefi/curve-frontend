import { type ReactNode, useId } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, ButtonBase, Collapse, Stack, type Theme, Typography } from '@mui/material'
import {} from '@mui/system'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { applySxProps, SxProps } from '@ui-kit/utils'

const { Spacing, IconSize } = SizesAndSpaces

type Size = 'small' | 'medium'

const titleVariants = {
  small: 'headingXsBold',
  medium: 'headingSBold',
} as const satisfies Record<Size, TypographyVariantKey>

const borderStyle = (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`
const layer1Fill = (t: Theme) => t.design.Layer[1].Fill

type AccordionBaseProps = {
  /** The title displayed in the accordion header */
  title: ReactNode
  /** Optional icon to display before the title */
  icon?: ReactNode
  /** Whether to render the accordion without a border */
  ghost?: boolean
  /** The size of the accordion header */
  size?: Size
  /** Optional information to display in the header */
  info?: ReactNode
  /** Content to display when the accordion is expanded */
  children?: ReactNode
  /** Optional test id for the accordion root */
  testId?: string
  /** Optional sx prop for custom styling */
  sx?: SxProps
}

type UncontrolledAccordionProps = {
  /** Initial expanded state (uncontrolled mode) */
  defaultExpanded?: boolean
  /** Never provided in uncontrolled mode */
  expanded?: never
  /** Never provided in uncontrolled mode */
  toggle?: never
}

type ControlledAccordionProps = {
  /** Never provided in controlled mode */
  defaultExpanded?: never
  /** Current expanded state (controlled mode) */
  expanded: boolean
  /** Callback when expanded state should change */
  toggle: () => void
}

export type AccordionProps = AccordionBaseProps & (UncontrolledAccordionProps | ControlledAccordionProps)

/**
 * Handles the toggle logic for both controlled and uncontrolled accordion modes.
 */
function useAccordionToggle(props: UncontrolledAccordionProps | ControlledAccordionProps) {
  const { defaultExpanded = false } = props as UncontrolledAccordionProps
  const [internalExpanded, , , internalToggle] = useSwitch(defaultExpanded)
  const { expanded = internalExpanded, toggle = internalToggle } = props as ControlledAccordionProps
  return [expanded, toggle] as const
}

/**
 * A customized accordion component that provides a collapsible content section.
 *
 * This component differs from the default MUI Accordion in that it's designed as a
 * single-item constrained collapse component. It's called an Accordion in our Figma
 * design system for consistency. We created this custom implementation because the
 * MUI Accordion lacks the customization options needed for our design requirements,
 * particularly for features like the ghost variant and responsive sizing with
 * appropriate effects on children elements.
 *
 * Can be used in both controlled and uncontrolled modes:
 * - Uncontrolled: Use `defaultExpanded` prop
 * - Controlled: Use `expanded` and `toggle` props
 */
export const Accordion = ({
  title,
  icon,
  ghost = false,
  size = 'small',
  info,
  children,
  testId,
  sx,
  ...controlProps
}: AccordionProps) => {
  const [isOpen, toggle] = useAccordionToggle(controlProps)
  const id = `accordion-${useId()}`

  return (
    <Stack data-testid={testId}>
      <ButtonBase
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={id}
        sx={{
          paddingBlock: Spacing.sm,
          paddingInline: ghost ? 0 : Spacing.sm,
          ...(isOpen && !ghost && { backgroundColor: layer1Fill }),
          transition: `background-color ${TransitionFunction}`,

          // Render border inside without layout shift on hover using a pseudo-element overlay
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none', // Prevents the overlay from intercepting mouse events (e.g., tooltip hover on the `info` slot)
            ...(ghost ? { borderBottom: borderStyle } : { border: borderStyle }),
          },

          '&:hover, &.Mui-focusVisible': {
            '&::after': {
              borderColor: (t) => t.design.Button.Focus_Outline,
              borderWidth: '2px',
            },
            ...(!ghost && { backgroundColor: layer1Fill }),
          },
        }}
      >
        <Stack flexGrow={1} direction="row" alignItems="center" gap={Spacing.sm}>
          {icon && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                width: IconSize.md,
                height: IconSize.md,
              }}
            >
              {icon}
            </Box>
          )}

          {typeof title === 'string' ? (
            <Typography
              flexGrow={1}
              variant={titleVariants[size]}
              color="textSecondary"
              sx={{
                textAlign: 'start',
                // Specifically unset to override the variant's uppercase styling; we want full control here
                textTransform: ghost ? 'unset' : 'uppercase',
              }}
            >
              {title}
            </Typography>
          ) : (
            <Box display="flex" flexGrow={1}>
              {title}
            </Box>
          )}

          {info}

          <ExpandMoreIcon
            sx={{
              width: IconSize.md,
              height: IconSize.md,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              // Create a transition that mimics the collapse transition
              transition: (t) =>
                t.transitions.create('transform', {
                  duration: t.transitions.duration.standard,
                  easing: t.transitions.easing.easeInOut,
                }),
            }}
          />
        </Stack>
      </ButtonBase>

      <Collapse
        in={isOpen}
        id={id}
        sx={{
          ...(!ghost && { backgroundColor: layer1Fill }),
        }}
      >
        {/*
          This Box wrapper serves two purposes:
          1. Padding is applied here instead of on Collapse because Collapse would never
             shrink below the padding size when closing
          2. Borders are applied here to ensure they collapse properly - if the bottom border
             were placed on the Collapse element, two borders would briefly stack when opening
        */}
        <Box
          sx={applySxProps(
            { paddingBlock: Spacing.sm },
            !ghost && {
              paddingInline: Spacing.sm,
              borderLeft: borderStyle,
              borderRight: borderStyle,
              borderBottom: borderStyle,
            },
            sx,
          )}
        >
          {children}
        </Box>
      </Collapse>
    </Stack>
  )
}
