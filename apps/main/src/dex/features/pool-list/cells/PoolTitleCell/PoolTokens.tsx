import ChipToken from '@/dex/components/ChipToken'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

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
    <Stack direction="row">
      {tokenList.map(({ symbol, address }, index) => (
        // note: there are pools with duplicated tokens, so we need to use index as key
        <Typography key={index} component="div">
          <ChipToken
            tokenName={symbol}
            tokenAddress={address}
            isHighlight={isHighlighted(symbol, address, searchedTerms)}
          />
        </Typography>
      ))}
    </Stack>
  )
}
