import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { responsiveTitleEllipsisSx } from '@ui-kit/shared/ui/titleTruncate'
import { applySxProps } from '@ui-kit/utils'

const isHighlighted = (symbol: string, address: string, searchedTerms: string[] | undefined) =>
  searchedTerms?.some(searched => symbol.toLowerCase().includes(searched) || address.toLowerCase().startsWith(searched))

export function PoolTokens({
  filterValue,
  tokenList,
}: {
  filterValue: string | undefined
  tokenList: { symbol: string; address: string }[]
}) {
  const searchedTerms = filterValue?.split(/[\s,]+/)?.map(x => x.toLowerCase())
  return (
    <Stack direction="row" sx={applySxProps({ gap: 2 }, responsiveTitleEllipsisSx)}>
      {tokenList.map(({ symbol, address }, index) => (
        <Typography
          // note: there are pools with duplicated tokens, so we need to use index as key
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
          key={index}
          sx={{
            fontWeight: isHighlighted(symbol, address, searchedTerms) ? 'bold' : 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '10ch',
          }}
        >
          {symbol}
        </Typography>
      ))}
    </Stack>
  )
}
