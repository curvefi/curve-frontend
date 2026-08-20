import { forwardRef } from 'react'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { LoadingAnimation, TRANSITION_FUNCTION } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

/**
 * A button for controlling the DataTable.
 */
// eslint-disable-next-line @eslint-react/no-forward-ref -- Existing violation before enabling this rule.
export const LegacyTableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    rotateIcon?: boolean
    testId?: string
    icon: typeof SvgIcon
  }
>(function LegacyTableButton({ active, icon: Icon, rotateIcon, testId, ...rest }, ref) {
  const iconProps = rotateIcon && { sx: LoadingAnimation }
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
  active = active || rotateIcon
  return (
    <IconButton
      ref={ref}
      size="small"
      data-testid={testId}
      sx={t => ({
        /** The IconButton component is being used in the codebase as a Button component (with only the icon) or as a Chip component (like here)
         * These are represented by two different components in Figma, therefore we should properly handle both variants from mui-icon-button.ts.
         * TODO: refactor the IconButton's style from mui-icon-button.ts */
        transition: `color ${TRANSITION_FUNCTION}`,
        border: `1px solid ${active ? t.design.Chips.Current.Outline : t.design.Chips.Default.Stroke}`,
        backgroundColor: active ? t.design.Chips.Current.Fill : t.design.Chips.Default.Fill,
        color: active ? t.design.Chips.Current.Label : t.design.Chips.Default.Label,
        '&:hover': {
          backgroundColor: t.design.Chips.Hover.Fill,
          color: t.design.Chips.Hover.Label,
          border: `none`,
        },
        '& svg': {
          width: IconSize.md,
          height: IconSize.md,
        },
      })}
      {...rest}
    >
      <Icon {...iconProps} />
    </IconButton>
  )
})
