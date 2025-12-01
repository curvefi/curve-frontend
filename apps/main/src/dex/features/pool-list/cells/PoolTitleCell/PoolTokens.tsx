import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { responsiveTitleEllipsisSx } from '@ui-kit/shared/ui/titleTruncate'

const isHighlighted = (symbol: string, address: string, searchedTerms: string[] | undefined) =>
  searchedTerms?.some(
    (searched) => symbol.toLowerCase().includes(searched) || address.toLowerCase().startsWith(searched),
  )

export function PoolTokens({
  filterValue,
  tokenList,
}: {
  filterValue: string | undefined
  tokenList: { symbol: string; address: string }[]
}) {
  const searchedTerms = filterValue?.split(/[\s,]+/)?.map((x) => x.toLowerCase())
  return (
    <Stack direction="row" gap={2} sx={responsiveTitleEllipsisSx}>
      {tokenList.map(({ symbol, address }, index) => (
        <Typography
          fontWeight={isHighlighted(symbol, address, searchedTerms) ? 'bold' : 'normal'}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '10ch',
          }}
          // note: there are pools with duplicated tokens, so we need to use index as key
          key={index}
        >
          {symbol}
        </Typography>
      ))}
    </Stack>
  )
}
