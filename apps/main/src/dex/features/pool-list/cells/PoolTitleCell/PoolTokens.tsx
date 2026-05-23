import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { responsiveTitleEllipsisSx } from '@ui-kit/shared/ui/titleTruncate'

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
    <Stack
      direction="row"
      sx={[
        {
          gap: 2,
        },
        ...(Array.isArray(responsiveTitleEllipsisSx) ? responsiveTitleEllipsisSx : [responsiveTitleEllipsisSx]),
      ]}
    >
      {tokenList.map(({ symbol, address }, index) => (
        <Typography
          // note: there are pools with duplicated tokens, so we need to use index as key
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
