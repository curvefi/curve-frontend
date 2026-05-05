import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export const LegacyTableFiltersTitles = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Stack height="100%" justifyContent="end">
    <Typography variant="headingSBold">{title}</Typography>
    {subtitle && (
      <Typography variant="bodySRegular" color="textSecondary">
        {subtitle}
      </Typography>
    )}
  </Stack>
)
