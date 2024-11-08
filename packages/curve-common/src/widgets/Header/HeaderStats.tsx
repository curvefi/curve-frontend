import { FunctionComponent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export type HeaderStatsProps = {
  appStats: {label: string, value: string}[]
}

export const HeaderStats: FunctionComponent<HeaderStatsProps> = ({ appStats }) => (
  appStats.map(({ label, value }) => (
    <Box key={label} display="inline-flex">
      <Typography variant="bodyMRegular" color="grey.600">{label}:</Typography>
      &nbsp;
      <Typography variant="bodyMBold" color="text.primary">{value || '-'}</Typography>
    </Box>
  ))
)