import { useId, type ReactNode } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, ButtonBase, Collapse, Stack, Typography, type Theme } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'

const { Spacing, IconSize } = SizesAndSpaces

type Size = 'small' | 'medium'

const titleVariants = {
  small: 'headingXsBold',
  medium: 'headingSBold',
} as const satisfies Record<Size, TypographyVariantKey>

const borderStyle = (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`
const layer1Fill = (t: Theme) => t.design.Layer[1].Fill

type Props = {
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
  /** Control initial expanded state */
  defaultExpanded?: boolean
  /** Content to display when the accordion is expanded */
  children?: ReactNode
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
 */
export const Accordion = ({
  title,
  icon,
  ghost = false,
  size = 'small',
  info,
  defaultExpanded = false,
  children,
}: Props) => {
  const [isOpen, , , toggle] = useSwitch(defaultExpanded)
  const id = `accordion-${useId()}`

  return (
    <Stack>
      <ButtonBase
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={id}
        sx={{
          padding: Spacing.sm,
          ...(isOpen && !ghost && { backgroundColor: layer1Fill }),
          transition: `background-color ${TransitionFunction}`,

          // Render border insize without layout shift on hover
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
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
          sx={{
            paddingBlock: Spacing.sm,
            ...(!ghost && {
              paddingInline: Spacing.sm,
              borderLeft: borderStyle,
              borderRight: borderStyle,
              borderBottom: borderStyle,
            }),
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Stack>
  )
}
