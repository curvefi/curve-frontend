import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type HeaderStatsProps = {
  appStats?: { label: string; value: string }[]
}

export const HeaderStats = ({ appStats }: HeaderStatsProps) =>
  appStats?.map(({ label, value }) => (
    <Box key={label} sx={{ display: 'inline-flex', alignItems: 'baseline' }}>
      {/* add ellipsis*/}
      <Typography variant="bodyMRegular" sx={{ color: 'grey.600', whiteSpace: 'nowrap' }}>
        {label}:
      </Typography>
      &nbsp;
      <Typography variant="highlightM" sx={{ color: 'text.primary' }}>
        {value || '-'}
      </Typography>
    </Box>
  ))
