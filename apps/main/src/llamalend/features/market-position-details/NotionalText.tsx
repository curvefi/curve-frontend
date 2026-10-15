import Typography from '@mui/material/Typography'

/** A metric's notional line, matching the Metric component's own notional text. */
export const NotionalText = ({ text, testId }: { text: string | undefined; testId?: string }) =>
  text ? (
    <Typography variant="highlightXsNotional" color="textTertiary" data-testid={testId}>
      {text}
    </Typography>
  ) : null
