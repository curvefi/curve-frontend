import { useState } from 'react'
import { styled } from 'styled-components'
import { DetailsLoanChartBalances } from '@/lend/components/DetailsMarket/components/DetailsLoanChartBalances'
import { DetailsUserLoanChartBandBalances } from '@/lend/components/DetailsUser/components/DetailsUserLoanChartBandBalances'
import { PageContentProps } from '@/lend/types/lend.types'
import { Stack } from '@mui/material'
import { Button } from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'

type BandsCompProps = {
  pageProps: PageContentProps
  loanExists: boolean | undefined
}

export const BandsComp = ({ pageProps, loanExists }: BandsCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const [selectedBand, setSelectedBand] = useState<'user' | 'market'>(loanExists ? 'user' : 'market')

  const SelectorMenu = loanExists && (
    <SelectorRow>
      <SelectorButton
        variant="text"
        className={selectedBand === 'user' ? 'active' : ''}
        onClick={() => setSelectedBand('user')}
      >
        {t`Position Bands`}
      </SelectorButton>
      <SelectorButton
        variant="text"
        className={selectedBand === 'market' ? 'active' : ''}
        onClick={() => setSelectedBand('market')}
      >
        {t`Market Bands`}
      </SelectorButton>
    </SelectorRow>
  )

  return (
    <Stack>
      {selectedBand === 'user' && loanExists && (
        <DetailsUserLoanChartBandBalances {...pageProps} selectorMenu={SelectorMenu} />
      )}
      {(selectedBand === 'market' || !loanExists) && (
        <DetailsLoanChartBalances rChainId={rChainId} rOwmId={rOwmId} market={market} selectorMenu={SelectorMenu} />
      )}
    </Stack>
  )
}

const SelectorRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-2);
`

const SelectorButton = styled(Button)`
  color: inherit;
  font: var(--font);
  font-size: var(--font-size-2);
  font-weight: bold;
  text-transform: none;
  opacity: 0.7;
  &.active {
    opacity: 1;
    border-bottom: 2px solid var(--page--text-color);
  }
`
