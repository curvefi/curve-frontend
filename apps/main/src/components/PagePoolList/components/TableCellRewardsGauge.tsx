import { isValidAddress, shortenTokenAddress } from '@/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  gauge: string | undefined
  searchText: string
}

const TableCellRewardsGauge = ({ gauge, searchText }: Props) => {
  const gaugeAddress = gauge ? (isValidAddress(gauge) ? gauge : '') : ''

  if (!gaugeAddress || !searchText || (searchText && searchText !== gaugeAddress)) return null

  return (
    <Chip isMono>
      <mark>{shortenTokenAddress(gaugeAddress)}</mark>
    </Chip>
  )
}

export default TableCellRewardsGauge
