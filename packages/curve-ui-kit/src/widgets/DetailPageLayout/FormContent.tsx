import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Wrapper that applies background and padding to the form content, including optional header and footer.
 * @param children The main content of the form
 * @param header The optional subtabs, used in legacy forms
 * @param footer The footer of the form outside the background area, used in new forms for the action info list
 */
export const FormContent = ({
  children,
  header,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
  header?: ReactNode
}) => (
  <WithWrapper shouldWrap={footer} Wrapper={Stack} gap={Spacing.sm}>
    <WithWrapper shouldWrap={header} Wrapper={Stack} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      {header}
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }} gap={Spacing.md} padding={Spacing.md}>
        {children}
      </Stack>
    </WithWrapper>
    {footer}
  </WithWrapper>
)
