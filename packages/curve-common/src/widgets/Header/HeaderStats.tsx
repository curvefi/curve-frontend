import { FunctionComponent } from 'react'
import { Box } from 'curve-ui-kit/src/shared/ui/Box'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

export type HeaderStatsProps = {
  appStats: {label: string, value: string}[]
}

export const HeaderStats: FunctionComponent<HeaderStatsProps> = ({ appStats }) => (
  <Box display="flex" gap={2}>
    {appStats.map(({ label, value }) => value && (
      <Box key={value}>
        <Typography variant="bodyMBold" color="grey.600">{label}</Typography>:{' '}
        <Typography variant="bodyMRegular" color="primary">{value}</Typography>
      </Box>
    ))}
  </Box>
)