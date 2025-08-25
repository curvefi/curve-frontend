import { Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'

export interface CellMaxLeverageProps {
  maxLeverage: string | undefined
  error?: string
  showTitle?: boolean
  className?: string
}

const CellMaxLeverage = ({ maxLeverage, error, showTitle, className }: CellMaxLeverageProps) => {
  if (!maxLeverage || maxLeverage === '') return null

  if (error) return <span>?</span>

  return (
    <StyledChip
      className={className}
      $showTitle={showTitle}
      label={
        <>
          {showTitle && <strong>{t`Leverage:`} </strong>}
          up to x{formatNumber(maxLeverage, { maximumSignificantDigits: 2 })}🔥
        </>
      }
      size="small"
      color="highlight"
    />
  )
}

const StyledChip = styled(Chip)<{ $showTitle?: boolean }>(({ theme, $showTitle }) => ({
  whiteSpace: 'nowrap',
  ...($showTitle && {
    display: 'inline-block',
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.25),
  }),
}))

export default CellMaxLeverage
