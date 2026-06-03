import { type ReactNode, useId } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, ButtonBase, Collapse, Stack, type Theme, Typography } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import type { Responsive } from '@ui-kit/themes/basic-theme'
import { Duration, Transition, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { applySxProps, borderStyle, type SxProps } from '@ui-kit/utils'

const { Spacing, IconSize } = SizesAndSpaces

type Size = 'extraSmall' | 'small' | 'medium'
type Indicator = 'chevron' | 'plusMinus'

const titleVariants = {
  extraSmall: 'bodyXsRegular',
  small: 'headingXsBold',
  medium: 'headingSBold',
} as const satisfies Record<Size, TypographyVariantKey>

const ghostTitleVariants = {
  extraSmall: 'bodyXsRegular',
  small: 'bodyMBold',
  medium: 'headingSBold',
} as const satisfies Record<Size, TypographyVariantKey>

const headerPaddingBlock = {
  extraSmall: 0,
  small: Spacing.xs,
  medium: Spacing.xs,
} as const satisfies Record<Size, number | Responsive>

const headerIconSize = {
  extraSmall: IconSize.xs.mobile,
  small: IconSize.md.mobile,
  medium: IconSize.md.mobile,
} as const satisfies Record<Size, string>

const ghostBorderStyle = (t: Theme) => `1px solid ${t.design.Layer[3].Outline}`
const layer1Fill = (t: Theme) => t.design.Layer[1].Fill
const activeFill = (t: Theme) => t.design.Inputs.Base.Default.Fill.Active
const indicatorIconSize = '0.9375rem'

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
  /** The visual indicator displayed at the end of the header */
  indicator?: Indicator
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

type AccordionProps = AccordionBaseProps & (UncontrolledAccordionProps | ControlledAccordionProps)

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
  indicator = 'chevron',
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
          width: '100%',
          paddingBlock: headerPaddingBlock[size],
          paddingInline: ghost ? 0 : Spacing.sm,
          minHeight: size === 'extraSmall' ? IconSize.sm.mobile : IconSize.md.mobile,
          ...(isOpen && !ghost && { backgroundColor: activeFill }),
          transition: `background-color ${TransitionFunction}`,
          touchAction: 'manipulation',

          // Render border inside without layout shift on hover using a pseudo-element overlay
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none', // Prevents the overlay from intercepting mouse events (e.g., tooltip hover on the `info` slot)
            ...(ghost
              ? isOpen
                ? { borderBottom: ghostBorderStyle }
                : {}
              : isOpen
                ? { border: borderStyle, borderBottom: borderStyle }
                : { border: borderStyle }),
            transition: `border-color ${TransitionFunction}, border-width ${TransitionFunction}`,
          },

          '&.Mui-focusVisible': {
            '&::after': {
              borderColor: t => t.design.Button.Focus_Outline,
              ...(ghost
                ? { borderBottomStyle: 'solid', borderBottomWidth: SizesAndSpaces.OutlineWidth }
                : { borderWidth: '2px' }),
            },
            ...(!ghost && { backgroundColor: layer1Fill }),
          },

          ['@media (hover: hover) and (pointer: fine)']: {
            '&:hover': {
              '&::after': {
                borderColor: t => t.design.Button.Focus_Outline,
                ...(ghost
                  ? { borderBottomStyle: 'solid', borderBottomWidth: SizesAndSpaces.OutlineWidth }
                  : { borderWidth: '2px' }),
              },
              ...(!ghost && { backgroundColor: layer1Fill }),
            },
          },
        }}
      >
        <Stack direction="row" sx={{ flexGrow: 1, alignItems: 'center', gap: Spacing.sm }}>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: headerIconSize[size],
                height: headerIconSize[size],
              }}
            >
              {icon}
            </Box>
          )}

          {typeof title === 'string' ? (
            <Typography
              variant={(ghost ? ghostTitleVariants : titleVariants)[size]}
              color="textSecondary"
              sx={{
                flexGrow: 1,
                textAlign: 'start',

                // Specifically unset to override the variant's uppercase styling; we want full control here
                textTransform: ghost && size === 'small' ? 'unset' : undefined,
              }}
            >
              {title}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexGrow: 1 }}>{title}</Box>
          )}

          {info}

          <ExpandMoreIcon
            sx={{
              display: indicator === 'chevron' ? 'block' : 'none',
              width: headerIconSize[size],
              height: headerIconSize[size],
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${TransitionFunction}`,
            }}
          />
          <Box
            aria-hidden
            sx={{
              display: indicator === 'plusMinus' ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: headerIconSize[size],
              height: headerIconSize[size],
              position: 'relative',
            }}
          >
            <AddIcon
              sx={{
                position: 'absolute',
                width: indicatorIconSize,
                height: indicatorIconSize,
                opacity: isOpen ? 0 : 1,
                transform: isOpen ? 'scale(0.85)' : 'scale(1)',
                transition: `opacity ${TransitionFunction}, transform ${TransitionFunction}`,
              }}
            />
            <RemoveIcon
              sx={{
                position: 'absolute',
                width: indicatorIconSize,
                height: indicatorIconSize,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'scale(1)' : 'scale(0.85)',
                transition: `opacity ${TransitionFunction}, transform ${TransitionFunction}`,
              }}
            />
          </Box>
        </Stack>
      </ButtonBase>

      <Collapse
        in={isOpen}
        id={id}
        easing={Transition}
        timeout={Duration.Transition}
        sx={{
          ...(!ghost && { backgroundColor: layer1Fill }),
          '& .MuiCollapse-wrapperInner': {
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-0.125rem)',
            transition: `opacity ${TransitionFunction}, transform ${TransitionFunction}`,
          },
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
