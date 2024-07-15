import { isValidAddress, shortenTokenAddress } from '@/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  address: string | undefined
  searchText: string
}

const TableCellRewardsGauge = ({ address, searchText }: Props) => {
  const gaugeAddress = address ? (isValidAddress(address) ? address : '') : ''

  if (!gaugeAddress || !searchText || (searchText && searchText !== gaugeAddress)) return null

  return (
    <Chip isMono>
      <mark>{shortenTokenAddress(gaugeAddress)}</mark>
    </Chip>
  )
}

export default TableCellRewardsGauge
