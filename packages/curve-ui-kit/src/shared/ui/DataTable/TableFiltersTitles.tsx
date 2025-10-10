import Typography from '@mui/material/Typography'

export const TableFiltersTitles = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <>
      <Typography variant="headingSBold">{title}</Typography>
      {subtitle && (
        <Typography variant="bodySRegular" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </>
  )
