import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { MinHeight } = SizesAndSpaces

export const PageLayout = ({
  header,
  userAddress,
  children,
  connectModal,
  footer,
}: {
  header: ReactNode
  userAddress: `0x${string}` | undefined
  children: ReactNode
  connectModal: ReactNode
  footer: ReactNode
}) => (
  <Stack>
    {header}
    <Box
      component="main"
      sx={{ margin: `0 auto`, maxWidth: `var(--width)`, minHeight: MinHeight.pageContent, width: '100%' }}
    >
      <ErrorBoundary title={t`Page error`} userAddress={userAddress}>
        {children}
      </ErrorBoundary>
    </Box>
    {connectModal}
    {footer}
  </Stack>
)
