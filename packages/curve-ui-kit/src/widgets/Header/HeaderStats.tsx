import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export type HeaderStatsProps = {
  appStats?: { label: string; value: string }[]
}

export const HeaderStats = ({ appStats }: HeaderStatsProps) =>
  appStats?.map(({ label, value }) => (
    <Box key={label} display="inline-flex" alignItems="baseline">
      {/* add ellipsis*/}
      <Typography variant="bodyMRegular" color="grey.600" sx={{ whiteSpace: 'nowrap' }}>
        {label}:
      </Typography>
      &nbsp;
      <Typography variant="highlightM" color="text.primary">
        {value || '-'}
      </Typography>
    </Box>
  ))
