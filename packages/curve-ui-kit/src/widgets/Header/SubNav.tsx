import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { DEFAULT_BAR_SIZE } from '@ui-kit/themes/components'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const SubNav = ({ testId, children }: { testId: string; children: React.ReactNode }) => (
  <Toolbar
    sx={{
      backgroundColor: (t) => t.design.Layer[2].Fill,
      justifyContent: 'space-around',
      borderWidth: '1px 0',
      borderColor: (t) => t.design.Layer[2].Outline,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      height: DEFAULT_BAR_SIZE,
    }}
    data-testid={testId}
  >
    <Container sx={{ alignItems: 'baseline', paddingInline: Spacing.md }}>{children}</Container>
  </Toolbar>
)
