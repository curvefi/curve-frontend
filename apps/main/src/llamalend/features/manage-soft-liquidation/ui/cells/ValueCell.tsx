import { sumBy } from 'lodash'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import type { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { formatTokens } from '../action-infos/util'
import type { ClosePositionRow } from '../columns/columns.definitions'

const { Spacing } = SizesAndSpaces

const formatNotional = (notional: Amount) =>
  formatNumber(notional, { unit: 'dollar', abbreviate: false, useGrouping: false })

export const ValueCellDisplay = ({
  tokens,
  isFooter,
  testId,
}: {
  tokens: ClosePositionRow['value']
  isFooter?: boolean
  testId?: string
}) => {
  const notional = sumBy(tokens, ({ usd }) => Number(usd) || 0)
  const tokensColor = notional < 0 ? 'error' : isFooter && notional > 0 ? 'success' : 'textPrimary'

  return (
    <>
      {!!tokens?.length && (
        // Tokens are split into separate no-wrap spans so each wraps as a whole unit.
        // marginInlineStart is used for the gap between tokens — without it, when all tokens
        // fit on one line the '+' separator sticks to the end of the preceding token symbol.
        // 1ch is for some reason too large, 0.25rem seems to do the trick.
        <Typography
          display="flex"
          flexWrap="wrap"
          justifyContent="end"
          textAlign="end"
          variant={isFooter ? 'tableCellMBold' : 'tableCellMRegular'}
          color={tokensColor}
          data-testid={testId}
        >
          {tokens.map((token, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap', ...(i > 0 && { marginInlineStart: '0.25rem' }) }}>
              {i === 0 ? formatTokens(token) : ` + ${formatTokens(token)}`}
            </span>
          ))}
        </Typography>
      )}

      <Typography
        variant={
          tokens.length
            ? isFooter
              ? 'tableCellSBold'
              : 'tableCellSRegular'
            : isFooter
              ? 'tableCellMBold'
              : 'tableCellMRegular'
        }
        color="textSecondary"
        textAlign="end"
      >
        {formatNotional(notional)}
      </Typography>
    </>
  )
}

export const ValueCell = ({ getValue, row }: CellContext<ClosePositionRow, ClosePositionRow['value'] | undefined>) => {
  const value = getValue()
  const { testId } = row.original
  return (
    value && (
      <Box paddingBlock={Spacing.md}>
        <ValueCellDisplay tokens={value} testId={testId} />
      </Box>
    )
  )
}
