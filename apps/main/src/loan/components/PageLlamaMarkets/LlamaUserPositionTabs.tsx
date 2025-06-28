'use client'
import { useMemo } from 'react'
import { LlamaMarketsTable } from '@/loan/components/PageLlamaMarkets/LlamaMarketsTable'
import { type LlamaMarketsResult } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, useTabFromUrl } from '@ui-kit/shared/ui/TabsSwitcher'

enum TabsEnum {
  Borrows = 'borrow',
  Lending = 'lend',
}

const Tabs = [
  { value: TabsEnum.Borrows, label: t`Borrows` },
  { value: TabsEnum.Lending, label: t`Lending` },
] as const

const titles = {
  [TabsEnum.Borrows]: t`Borrow Positions`,
  [TabsEnum.Lending]: t`Lending Positions`,
}

type TabsViewProps = {
  onReload: () => void
  result: LlamaMarketsResult
  headerHeight: string
  isError: boolean
  minLiquidity: number
}

export const LlamaUserPositionTabs = ({ onReload, result, headerHeight, isError, minLiquidity }: TabsViewProps) => {
  const [activeTab, tabs] = useTabFromUrl<TabsEnum>(Tabs, TabsEnum.Borrows)
  const filteredData = useMemo(
    () => ({
      ...result,
      markets: result.markets.filter((market) => market.userHasPosition?.[activeTab]),
    }),
    [result, activeTab],
  )
  return (
    <Stack>
      <TabsSwitcher size="small" variant="contained" value={activeTab} options={tabs} sx={{ marginBottom: 2 }} />
      <LlamaMarketsTable
        onReload={onReload}
        result={filteredData}
        headerHeight={headerHeight}
        isError={isError}
        minLiquidity={minLiquidity}
        title={titles[activeTab]}
        subtitle={t`Manage your positions easily`}
      />
    </Stack>
  )
}
