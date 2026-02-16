import { useState } from 'react'
import { styled } from 'styled-components'
import { DetailsBandsChart } from '@/loan/components/LoanInfoLlamma/components/DetailsBandsChart'
import type { Llamma } from '@/loan/types/loan.types'
import { Stack } from '@mui/material'
import { Button } from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'
import { ChartUserBands } from './ChartUserBands'

type BandsCompProps = {
  market: Llamma | null
  marketId: string
  page: 'create' | 'manage'
}

export const BandsComp = ({ market, marketId, page }: BandsCompProps) => {
  const [selectedBand, setSelectedBand] = useState<'user' | 'market'>(page === 'create' ? 'market' : 'user')

  const SelectorMenu =
    page === 'create' ? null : (
      <SelectorRow>
        <SelectorButton
          variant={'text'}
          className={selectedBand === 'user' ? 'active' : ''}
          onClick={() => setSelectedBand('user')}
        >
          {t`Position Bands`}
        </SelectorButton>
        <SelectorButton
          variant={'text'}
          className={selectedBand === 'market' ? 'active' : ''}
          onClick={() => setSelectedBand('market')}
        >
          {t`Market Bands`}
        </SelectorButton>
      </SelectorRow>
    )

  return (
    <Stack>
      {selectedBand === 'user' && <ChartUserBands market={market} marketId={marketId} selectorMenu={SelectorMenu} />}
      {selectedBand === 'market' && (
        <DetailsBandsChart marketId={marketId} market={market} selectorMenu={SelectorMenu} />
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
