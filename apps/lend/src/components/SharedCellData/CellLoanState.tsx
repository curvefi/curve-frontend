import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import TextCaption from '@/ui/TextCaption'

const CellLoanState = ({
  userActiveKey,
  owmDataCachedOrApi,
}: {
  userActiveKey: string
  owmDataCachedOrApi: OWMDataCacheOrApi
}) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { borrowed_token, collateral_token } = owmDataCachedOrApi?.owm ?? {}
  const { details, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Wrapper>
          <Box margin="0 var(--spacing-normal) var(--spacing-narrow) 0">
            <div>
              <TextCaption isCaps>Collateral</TextCaption>
              <br />
              <span>{formatNumber(details?.state?.collateral)}</span> <span>{collateral_token?.symbol ?? ''}</span>
            </div>
            <InpChipUsdRate hideRate address={collateral_token?.address} amount={details?.state?.collateral} />
          </Box>

          <div>
            <div>
              <TextCaption isCaps>Borrowed</TextCaption>
              <br />
              <span>{formatNumber(details?.state?.borrowed)}</span> <span>{borrowed_token?.symbol ?? ''}</span>
            </div>
            <InpChipUsdRate hideRate address={borrowed_token?.address} amount={details?.state?.borrowed} />
          </div>
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  display: flex;
  font-weight: bold;
`

export default CellLoanState
