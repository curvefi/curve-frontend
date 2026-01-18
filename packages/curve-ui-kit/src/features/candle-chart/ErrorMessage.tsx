import { Stack, SxProps, Typography } from '@mui/material'
import { IconButton } from '@ui/IconButton/IconButton'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

export const ErrorMessage = ({
  errorMessage,
  refreshData,
  sx,
}: {
  errorMessage: string
  refreshData?: () => void
  sx?: SxProps
}) => (
  <Stack direction="column" alignItems="center" gap={Spacing.md} sx={sx}>
    <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
    <Typography variant="bodyMRegular" color="textPrimary" component="div">
      {errorMessage}
    </Typography>
    {refreshData && (
      <IconButton
        size="small"
        onClick={() => {
          refreshData()
        }}
      >
        <ReloadIcon sx={{ width: IconSize.md, height: IconSize.md }} />
      </IconButton>
    )}
  </Stack>
)
