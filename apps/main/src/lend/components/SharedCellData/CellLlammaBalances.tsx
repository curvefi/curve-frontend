import styled from 'styled-components'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'
import useStore from '@/lend/store/useStore'
import { OneWayMarketTemplate } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import TextCaption from '@ui/TextCaption'
import { formatNumber } from '@ui/utils'

const CellLlammaBalances = ({ userActiveKey, market }: { userActiveKey: string; market: OneWayMarketTemplate }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { borrowed_token, collateral_token } = market ?? {}
  const { details, error } = resp ?? {}

  return (
    <>
      {error ? (
        '?'
      ) : !details ? (
        '-'
      ) : (
        <Box flex gridGap={3}>
          <Box grid>
            <StatsTitle>{collateral_token?.symbol ?? ''}</StatsTitle>
            {formatNumber(details?.state?.collateral)}
            <InpChipUsdRate hideRate address={collateral_token?.address} amount={details?.state?.collateral} />
          </Box>
          <Box grid>
            <StatsTitle>{borrowed_token?.symbol ?? ''}</StatsTitle>
            {formatNumber(details?.state?.borrowed)}
            <InpChipUsdRate hideRate address={borrowed_token?.address} amount={details?.state?.borrowed} />
          </Box>
        </Box>
      )}
    </>
  )
}

const StatsTitle = styled(TextCaption)`
  opacity: 0.7;
`

export default CellLlammaBalances
